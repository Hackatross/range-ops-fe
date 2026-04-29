/**
 * Role helpers — backend stores `role` as a singular column whose value
 * may be a single role ("admin") or a comma-separated set ("admin,trainer").
 * Mirrors the bigboss pattern: keep the type as `string`, split + check at
 * call sites via these helpers so we never lose multi-role users to a
 * stale literal-union check.
 *
 * See [user.model.ts] (apps/server/src/resources/user/user.model.ts) for
 * the canonical validator (`ROLE_FIELD_PATTERN`).
 */

export type PlatformRole = "admin" | "trainer" | "viewer";

const KNOWN_ROLES: readonly PlatformRole[] = ["admin", "trainer", "viewer"] as const;

/**
 * Normalise the `role` value into a string array. Tolerates:
 *   - "admin"                  → ["admin"]
 *   - "admin,trainer"          → ["admin", "trainer"]
 *   - ["admin", "trainer"]     → ["admin", "trainer"]   (defensive — backend is string today)
 *   - undefined / null / ""    → []
 *   - whitespace ("admin , t") → trimmed pieces
 */
export function parseRoles(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String).map((r) => r.trim()).filter(Boolean);
  if (typeof raw === "string")
    return raw
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);
  return [];
}

/** Does the user hold at least one of the wanted roles? */
export function hasAnyRole(raw: unknown, ...wanted: PlatformRole[]): boolean {
  const roles = parseRoles(raw);
  return roles.some((r) => wanted.includes(r as PlatformRole));
}

/** Trainer or admin — anyone allowed to start/control sessions. */
export function isOperator(raw: unknown): boolean {
  return hasAnyRole(raw, "admin", "trainer");
}

/** Admin-only checks (user management, device CRUD, etc.). */
export function isAdmin(raw: unknown): boolean {
  return hasAnyRole(raw, "admin");
}

/**
 * Highest-rank label for UI badges — "admin" wins over "trainer" wins over
 * "viewer". Returns "guest" when the role string is empty.
 */
export function primaryRole(raw: unknown): PlatformRole | "guest" {
  const roles = parseRoles(raw);
  if (roles.includes("admin")) return "admin";
  if (roles.includes("trainer")) return "trainer";
  if (roles.includes("viewer")) return "viewer";
  return "guest";
}

/**
 * Inverse of `parseRoles` — joins a list back into the canonical
 * comma-separated representation the backend stores. Empty array → "viewer"
 * (the safest default; matches the User model's schema default).
 */
export function joinRoles(roles: string[]): string {
  const cleaned = Array.from(
    new Set(roles.map((r) => r.trim()).filter(Boolean)),
  );
  return cleaned.length ? cleaned.join(",") : "viewer";
}

export { KNOWN_ROLES };
