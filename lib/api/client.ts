/**
 * arc-next client setup — configured once in `<Providers>` (client side).
 *
 * Bearer-mode because the bd-army-server runs Arc with `--jwt`. We bridge
 * NextAuth's async session through a sync token cache (see auth/token-cache.ts).
 */

import { configureClient, configureAuth } from "@classytic/arc-next/client";
import { configureToast } from "@classytic/arc-next/mutation";
import { toast } from "sonner";
import { getAccessToken } from "@/lib/auth/token-cache";

let initialized = false;

export function ensureArcClient(): void {
  if (initialized) return;
  initialized = true;

  configureClient({
    baseUrl:
      process.env.NEXT_PUBLIC_ARC_API_URL ?? "http://localhost:8040",
    authMode: "bearer",
    retry: { attempts: 2, backoff: "exponential" },
  });

  configureAuth({
    getToken: () => getAccessToken(),
  });

  // Surface CRUD success/error toasts via Sonner — installed by the
  // `sonner` shadcn primitive. The host page renders `<Toaster />` once
  // at the root so these messages render globally.
  configureToast({
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
  });
}
