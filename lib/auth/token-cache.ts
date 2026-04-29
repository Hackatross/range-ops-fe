/**
 * Module-level access-token cache.
 *
 * arc-next requires `getToken` to resolve **synchronously** (`() => string | null`).
 * NextAuth's session lookup is async, so we cache the JWT here and refresh it
 * via `<AuthBridge>` whenever the session changes on the client.
 *
 * On the server, route handlers / server components should pass `token` directly
 * via `ApiRequestOptions` instead of relying on this cache (it's client-only).
 */

let token: string | null = null;

export function setAccessToken(next: string | null): void {
  token = next;
}

export function getAccessToken(): string | null {
  return token;
}
