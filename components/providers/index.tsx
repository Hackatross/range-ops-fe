"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { ArcProvider } from "./arc-provider";
import { AuthBridge } from "./auth-bridge";
import { QueryProvider } from "./query-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={false}>
      <AuthBridge />
      <ArcProvider>
        <QueryProvider>{children}</QueryProvider>
      </ArcProvider>
      <Toaster richColors closeButton position="top-right" />
    </SessionProvider>
  );
}
