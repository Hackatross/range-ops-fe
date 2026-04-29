# Tactical Design System

Composed primitives that build on shadcn (Base UI variant) for the RangeOps Console. Don't re-roll these patterns inline — extend the system instead.

## Usage

```tsx
import {
  PageHeader,
  KpiGrid,
  StatCard,
  SectionCard,
  StatusPill,
  EmptyState,
  MonoCode,
  RolePills,
} from "@/components/system";
```

## Layers

```
shadcn primitives (components/ui/*)
        ↑
system primitives (components/system/*)   ← you live here for shared patterns
        ↑
feature components (components/{auth,session,shooter,...}/*)
        ↑
pages (app/**/page.tsx)
```

**Rule of thumb:** if you find yourself writing `<Card><CardContent>...font-mono text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground...` more than once, extract into the system.

## Primitives

| Primitive | When to use |
|---|---|
| `<PageHeader>` | The title block of every page. Eyebrow + title + description + actions in one consistent shape. |
| `<KpiGrid>` + `<StatCard>` | Dashboard KPIs. KpiGrid is the responsive 1/2/3/4-col layout; StatCard is the tile. |
| `<SectionCard>` | Card with built-in eyebrow + title + body. Replaces 90% of `<Card><CardHeader>...<CardContent>` boilerplate. |
| `<StatusPill>` | Domain status. Always pair with a spec from `lib/domain/status.ts` (`sessionStatusSpec`, `deviceStatusSpec`, `shotKindSpec`, `leaderboardRankSpec`). |
| `<RolePills>` | One pill per role in `user.role` (handles comma-separated). |
| `<MonoCode>` | Codes, IDs, ring numbers, deviation values — anything "instrument-readout". |
| `<EmptyState>` | Empty lists / zero-results. Always pair with a domain illustration. |

## Status mapping (single source of truth)

Backend status strings → UI variants live in [`lib/domain/status.ts`](../../lib/domain/status.ts):

```ts
sessionStatusSpec("active")   // → { tone: "success", beat: "pulse", label: "Active" }
deviceStatusSpec("error")     // → { tone: "danger",  beat: "pulse", label: "Error" }
shotKindSpec({ is_bullseye }) // → { tone: "accent",  beat: "flash", label: "Bullseye", symbol: "BUL" }
leaderboardRankSpec(1)        // → { tone: "accent",  beat: "static", label: "Gold" }
```

Add new statuses there, not inline in components.

## Formatting (single source of truth)

Numbers/timestamps go through [`lib/format.ts`](../../lib/format.ts):

```ts
formatScore(98.7)        // "099"
formatAccuracy(0.823)    // "82.3%"
formatRing(10)           // "R10"
formatDeviation(2.4)     // "2.4cm"
formatDuration(125_000)  // "2m 05s"
formatTime("2026-04-28T14:32Z") // "14:32" (today)
splitSessionCode("SSN-2026-0451") // { prefix, year, serial }
```

## Theme tokens

All colour goes through CSS variables in [`app/globals.css`](../../app/globals.css):

| Token | Use for |
|---|---|
| `--color-primary` (military green) | Primary CTA, accent text, active state |
| `--color-tactical` (amber) | Secondary actions, warnings |
| `--color-mission` (red) | Destructive, aborted, errors |
| `--color-bullseye` (gold) | Bullseye flashes, leaderboard #1 |
| `--color-hit` (green) | Successful hit indicators |
| `--color-miss` (slate) | Missed shots, neutral states |
| `--color-pulse` | Pulsing dot animation |
| `--color-grid-line` | Background tactical grid |

Custom utilities:
- `tactical-grid` — 24px background grid
- `tactical-scan` — animated scan-line overlay (use `relative` + `tactical-scan`)
- `--animate-pulse-dot` — live indicator pulse
- `--animate-flash-bull` — gold flash on bullseye

## Adding a new primitive

1. Drop the component in `components/system/<name>.tsx`
2. Use `cva` for variant props (see `status-pill.tsx` for the shape)
3. Re-export from `components/system/index.ts`
4. Update this README's primitive table

## Adding a new domain illustration

1. Drop the SVG component in `components/illustrations/<name>.tsx`
2. Re-export from `components/illustrations/index.ts`
3. Use `currentColor` so it picks up theme tokens — never hardcode hex
