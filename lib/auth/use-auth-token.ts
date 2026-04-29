"use client";

import { useSession } from "next-auth/react";

/**
 * Read the bearer token straight off the NextAuth session. Use this in custom
 * `useQuery` hooks that call `handleApiRequest` directly — gate `enabled` on
 * `isReady` and pass `token` explicitly to skip the module-level cache race
 * where AuthBridge's effect hasn't filled the mirror yet.
 *
 * createCrudHooks already gates internally on `!!token` from
 * `getAuthContext()`, so it doesn't need this — only the hand-rolled queries
 * in `lib/api/reports.ts` and `lib/api/shots.ts` do.
 */
export function useAuthToken(): {
  token: string | null;
  isReady: boolean;
} {
  const { data, status } = useSession();
  return {
    token: data?.accessToken ?? null,
    isReady: status === "authenticated" && !!data?.accessToken,
  };
}
