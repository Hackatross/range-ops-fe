# rangeops-web — RangeOps Console

The Bangladesh Army shooting-range training console. Trainers run live shot tracking, admins manage the armoury and personnel, viewers watch the leaderboard.

This is the **frontend** for the [bd-army-server](../server) Arc backend. The two run together as a single LAN deployment — no multi-tenancy, no cloud auth, no third-party SaaS.

## Stack

| Concern | Choice |
|---|---|
| Framework | **Next.js 16** (App Router · Turbopack default · `proxy.ts` instead of `middleware.ts`) |
| Runtime | **React 19** (Actions, ref-as-prop, no `forwardRef`) |
| UI primitives | **shadcn (Base UI variant)** — `render` prop, not `asChild` |
| UI compositions | `@classytic/fluid` — `ResourceDashboard`, `DataTable`, `FormSheet` |
| Forms | `@classytic/formkit` (schema-driven) + react-hook-form + zod |
| Backend SDK | `@classytic/arc-next` — TanStack Query 5 + WS + bearer auth |
| Auth | **NextAuth v5** Credentials → backend `/auth/login` (JWT bearer) |
| Charts | recharts |
| Tooling | TypeScript 5 strict · React Compiler enabled |

## Layout

```
app/(auth)/login              public — credentials form
app/(app)/                    protected — sidebar shell, role-gated nav
  ├─ sessions/                list + status tabs + KPIs
  │   ├─ new/                 4-step wizard (shooter → weapon → target → conditions)
  │   └─ [id]/                live view + WS shot feed + target overlay
  ├─ shooters/                CRUD + sheet
  ├─ weapons/                 CRUD + sheet
  ├─ targets/                 CRUD + sheet (rings sub-form)
  ├─ devices/                 CRUD + sheet + heartbeat + WS live bar
  ├─ users/                   admin-only CRUD (multi-role select)
  └─ reports/
      ├─ leaderboard/         sortable + date-range + medal pills
      └─ shooter/[id]/        aggregate KPIs + recharts trend + history

components/
  system/                     Tactical design system (PageHeader, StatusPill, …)
  illustrations/              SVGs (TargetRings, CompassRose, SignalStrength, NoResults)
  form/form-system/           shadcn ↔ formkit adapter
  {sessions,shooters,…}/      Per-domain composition

lib/
  api/                        SDK modules (one per resource) + server.ts for SSR
  auth/                       NextAuth config, role helpers, token cache
  domain/status.ts            Single source of truth for status → pill mapping
  format.ts                   Single source of truth for number/time formatters
  hooks/                      use-url-pagination, use-form-submit-state
  ws/                         session-feed, devices-feed
```

See [components/system/README.md](components/system/README.md) for the design-system contract.

## Running locally

You need both servers up:

```bash
# Backend on :8040 — see ../server/README.md for first-run seed
cd apps/server
npm run seed && npm run dev

# Frontend on :3015 (3000 may be taken on a dev machine)
cd apps/web
npm run dev -- -p 3015
```

Open <http://localhost:3015/login>. Seeded credentials:

| Role | Email | Password |
|---|---|---|
| admin | `admin@bd-army.local` | `admin1234` |
| trainer | `trainer@bd-army.local` | `trainer1234` |

## Auth flow

```
Browser → NextAuth /api/auth/callback/credentials
        → authorize() in lib/auth/config.ts
        → POST :8040/auth/login   { email, password }
        → JWT { user, accessToken, refreshToken } onto session
        → AuthBridge syncs accessToken to module cache
        → arc-next reads it synchronously via configureAuth({ getToken })
        → Every backend call carries Authorization: Bearer <token>
```

Refresh-on-expiry runs in the JWT callback when the access token is within 60 s of expiring; failure flips `session.error = "RefreshFailed"` and the next protected page redirects to `/login?error=session-expired`.

## Live data

Two WS rooms:

- `session:<id>` — shot recordings + session lifecycle (`shot:recorded`, `session:ended`). Subscribed by `useLiveSessionFeed(sessionId)` on `/sessions/[id]`.
- `devices` — heartbeat-driven status flips (`device:status`). Subscribed by `useDevicesFeed()` on `/devices`.

Both hooks mirror inbound events into the TanStack Query cache, so consumers re-render without re-fetching.

## Roles

`session.user.role` is a singular column that may hold a single role (`"admin"`) or a comma-separated set (`"admin,trainer"`). Never compare with `===` literals — use the helpers in [lib/auth/roles.ts](lib/auth/roles.ts):

```ts
isAdmin(role)     // role contains "admin"
isOperator(role)  // role contains "admin" OR "trainer"
parseRoles(role)  // string → string[]
joinRoles(arr)    // array → comma-separated string (used by the user form)
```

The user-management form ([components/users/user-form.tsx](components/users/user-form.tsx)) renders the multi-select and joins/parses on the form boundary — backend storage stays canonical.

## Smoke testing

A wire-level QA probe lives at [../server/tests/probes/probe-smoke.mjs](../server/tests/probes/probe-smoke.mjs). With both servers up:

```bash
node apps/server/tests/probes/probe-smoke.mjs
```

Should print **29 passed · 0 failed**. It exercises every endpoint the FE depends on — auth round-trip, reference-data lists, full session lifecycle (start → 5 shots → end → leaderboard sort variants → shooter report → device CRUD with heartbeat).

For browser-driven testing, the [qa-next-devtools](../../skills/qa-next-devtools/SKILL.md) skill prescribes the next-devtools MCP procedure (init → nextjs_index → browser_eval → page-check probe per route).

## Build flags worth knowing

`next.config.ts`:

- `transpilePackages: ["@classytic/fluid"]` — fluid ships pre-built ESM, Turbopack must re-process so its JSX runtime + HMR boundaries align with this app's React copy.
- `reactCompiler: true` — auto-memoization across the live shot feed and dashboards. No manual `useMemo` / `React.memo` required.
- `experimental.turbopackFileSystemCacheForDev: true` — faster dev restarts.

`cacheComponents` is **off** for now. Enabling it requires a Suspense boundary around every `auth()` / `searchParams` read site — it'll land alongside `'use cache'` directives on report pages.

## Known frontend gaps / next work

- **No CSV export on the leaderboard.** Easy add via `react-csv` once the backend exposes a download path.
- **Print stylesheet for `/sessions/[id]/report`.** Currently the page renders fine but lacks `@media print` polish — A4-friendly margins, hide the sidebar, remove interactive controls.
- **English-only.** `<FluidProvider labels>` makes Bangla a 5-minute task when the brief settles.
- **No e2e Playwright suite yet** — the qa-next-devtools skill drives manual MCP-based testing instead.

## Known backend coupling (not frontend bugs)

These are backend behaviours the FE works around. Documented here so future FE work doesn't accidentally try to fix them client-side:

- **Camera hit detection is a deterministic stub** — see [apps/server/src/services/detect-hit-from-image.ts](../server/src/services/detect-hit-from-image.ts). Every "camera-derived" hit on `/hardware/ingest` returns the same fixed coordinate. Real CV lands in the M9 hardening pass.
- **Media upload is deferred in hardware ingest** — [apps/server/src/resources/hardware/hardware.controller.ts](../server/src/resources/hardware/hardware.controller.ts) (~line 150). Camera frames aren't stored alongside shots yet; the FE doesn't render frame thumbnails on the live feed for that reason.
- **Live stats aren't pushed per shot** — [apps/server/src/resources/hardware/hardware.controller.ts](../server/src/resources/hardware/hardware.controller.ts) (~line 213). The session's `stats` blob updates only on `/end`. The live `/sessions/[id]` view derives stats client-side from the WS-pushed shot stream so the dashboard stays accurate during a session — but `GET /sessions/:id.stats` lags until completion.

When any of these are addressed, audit the corresponding FE workaround:

- Real CV → frame thumbnails can render in [components/sessions/live/shot-feed.tsx](components/sessions/live/shot-feed.tsx)
- Media on ingest → swap the placeholder in `<ShotFeed>` for the actual frame URL
- Per-shot stats push → drop the client-side derivation in [components/sessions/live/session-stats.tsx](components/sessions/live/session-stats.tsx) and read directly from `session.stats` instead
