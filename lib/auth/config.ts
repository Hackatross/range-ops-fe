/**
 * NextAuth v5 — Credentials provider, JWT strategy.
 *
 * Talks to the bd-army-server `/auth/*` endpoints (Arc + JWT bearer).
 * Stores `accessToken` + `refreshToken` + `role` on the JWT so client-side
 * arc-next requests can mint the bearer header without re-fetching the
 * session on every call. Refreshes silently on the boundary between two
 * server-side renders when the access token is within 60 s of expiry.
 *
 * Backend response shapes (apps/server/src/resources/auth/auth.schemas.ts):
 *   POST /auth/login   → { success, user, accessToken, refreshToken }
 *   POST /auth/refresh → { success, accessToken, refreshToken }
 */

import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

// `role` is a singular column on the backend that may hold a single role
// ("admin") OR a comma-separated set ("admin,trainer"). Type stays `string`
// here — call sites parse + check via `lib/auth/roles.ts`.
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: "RefreshFailed";
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
    };
  }
  interface User {
    id?: string;
    role?: string;
    accessToken?: string;
    refreshToken?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    accessToken?: string;
    refreshToken?: string;
    /** Unix ms when accessToken expires — read from JWT `exp` claim post-login. */
    accessTokenExpiresAt?: number;
    error?: "RefreshFailed";
  }
}

const apiUrl =
  process.env.ARC_API_URL ??
  process.env.NEXT_PUBLIC_ARC_API_URL ??
  "http://localhost:8040";

/**
 * Decode the `exp` claim from a JWT without verifying signature.
 * Verification happens server-side; we only need the timestamp here so the
 * NextAuth JWT callback can decide when to refresh.
 */
function decodeAccessTokenExp(jwt: string): number | undefined {
  try {
    const payload = jwt.split(".")[1];
    if (!payload) return undefined;
    const json = JSON.parse(
      Buffer.from(
        payload.replace(/-/g, "+").replace(/_/g, "/"),
        "base64",
      ).toString("utf8"),
    ) as { exp?: number };
    return typeof json.exp === "number" ? json.exp * 1000 : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Hit `/auth/refresh` with the stored refresh token. Returns a fresh token
 * pair on success or null on any failure (network, 401, schema drift).
 * The jwt callback uses the null path to flag the session for re-login.
 */
async function refreshTokens(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const res = await fetch(`${apiUrl}/auth/refresh`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: refreshToken }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      success?: boolean;
      accessToken?: string;
      refreshToken?: string;
    };
    if (!json.success || !json.accessToken || !json.refreshToken) return null;
    return {
      accessToken: json.accessToken,
      refreshToken: json.refreshToken,
    };
  } catch {
    return null;
  }
}

export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const res = await fetch(`${apiUrl}/auth/login`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) return null;

        // Backend's loginResponse is flat — see auth.schemas.ts.
        const json = (await res.json()) as {
          success?: boolean;
          user?: {
            id?: string;
            _id?: string;
            email: string;
            name?: string;
            role: string;
          };
          accessToken?: string;
          refreshToken?: string;
        };

        if (!json.success || !json.user || !json.accessToken) return null;

        return {
          id: json.user.id ?? json.user._id ?? "",
          email: json.user.email,
          name: json.user.name ?? null,
          role: json.user.role,
          accessToken: json.accessToken,
          refreshToken: json.refreshToken,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // First sign-in — copy the freshly-issued tokens onto the JWT.
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpiresAt = user.accessToken
          ? decodeAccessTokenExp(user.accessToken)
          : undefined;
        return token;
      }

      // Subsequent calls — refresh proactively when within 60 s of expiry,
      // or when the caller explicitly requested an update.
      const now = Date.now();
      const expiresAt = token.accessTokenExpiresAt ?? 0;
      const needsRefresh =
        trigger === "update" ||
        (token.refreshToken && expiresAt > 0 && expiresAt - now < 60_000);

      if (!needsRefresh) return token;
      if (!token.refreshToken) {
        token.error = "RefreshFailed";
        return token;
      }

      const next = await refreshTokens(token.refreshToken);
      if (!next) {
        // Surface the failure so the session callback can flip session.error
        // and the UI can ask the user to sign in again.
        token.error = "RefreshFailed";
        token.accessToken = undefined;
        token.refreshToken = undefined;
        token.accessTokenExpiresAt = undefined;
        return token;
      }

      token.accessToken = next.accessToken;
      token.refreshToken = next.refreshToken;
      token.accessTokenExpiresAt = decodeAccessTokenExp(next.accessToken);
      token.error = undefined;
      return token;
    },
    async session({ session, token }) {
      if (token.id) session.user.id = token.id;
      if (token.role) session.user.role = token.role;
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const path = request.nextUrl.pathname;
      const isAuthRoute =
        path.startsWith("/login") || path.startsWith("/api/auth");
      if (isAuthRoute) return true;
      return isLoggedIn;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
