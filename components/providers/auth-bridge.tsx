"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { setAccessToken } from "@/lib/auth/token-cache";

/**
 * Pulls the access token off the NextAuth session (kept on the JWT under
 * `accessToken`) and writes it to the module-level cache that arc-next's
 * `getToken` reads synchronously. Effectively a one-way mirror.
 */
export function AuthBridge() {
  const { data, status } = useSession();
  useEffect(() => {
    if (status === "authenticated") {
      setAccessToken(data?.accessToken ?? null);
    } else if (status === "unauthenticated") {
      setAccessToken(null);
    }
  }, [data?.accessToken, status]);
  return null;
}
