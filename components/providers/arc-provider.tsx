"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { configureNavigation } from "@classytic/arc-next/hooks";
import { ensureArcClient } from "@/lib/api/client";

/**
 * Configures arc-next exactly once, on the client.
 *
 * arc-next stores its config in module-scoped state, so we MUST NOT call
 * `configureClient` / `configureAuth` during SSR (state would leak between
 * concurrent requests). The `typeof window` guard runs the configuration
 * lazily on first import in the browser bundle and skips it on the server.
 *
 * `configureNavigation` needs a hook reference, so it lives inside the
 * component body — Next's `useRouter` only works in client tree.
 */
if (typeof window !== "undefined") {
  ensureArcClient();
}

export function ArcProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    configureNavigation(() => router);
  }, [router]);
  return <>{children}</>;
}
