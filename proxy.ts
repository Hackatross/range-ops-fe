/**
 * Next.js 16 Proxy (formerly `middleware.ts`).
 *
 * Re-exports NextAuth's `auth` so route protection lives in
 * `lib/auth/config.ts` callback `authorized`. Anything not whitelisted there
 * (i.e. anything outside `/login` and `/api/auth/*`) requires a session.
 */
export { auth as proxy } from "@/lib/auth/config";

export const config = {
  // Run on every path except API internals, Next assets, and static files.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
