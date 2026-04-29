"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, ShieldCheck, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type LoginFormProps = {
  callbackUrl?: string;
  initialError?: string;
};

export function LoginForm({ callbackUrl, initialError }: LoginFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(
    initialError ? readableAuthError(initialError) : null,
  );

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await signIn("credentials", {
        email: String(formData.get("email") ?? "").trim(),
        password: String(formData.get("password") ?? ""),
        redirect: false,
      });
      if (!res || res.error) {
        setError("Invalid credentials. Check your email and password.");
        return;
      }
      router.replace(callbackUrl || "/");
      router.refresh();
    });
  }

  return (
    <Card className="w-full max-w-md border-border/60 bg-card/80 backdrop-blur-sm shadow-2xl shadow-black/30">
      <CardContent className="flex flex-col gap-7 p-8 sm:p-10">
        <div className="flex flex-col gap-2">
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-primary">
            <ShieldCheck size={12} />
            Secure access
          </span>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Sign in to Command Console
          </h1>
          <p className="text-sm text-muted-foreground">
            Use the credentials issued to you by the range officer.
          </p>
        </div>

        <form action={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel
                htmlFor="email"
                className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground"
              >
                Email
              </FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="trainer@bd-army.local"
                disabled={pending}
              />
            </Field>

            <Field>
              <FieldLabel
                htmlFor="password"
                className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground"
              >
                Password
              </FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="•••••••••"
                disabled={pending}
              />
            </Field>

            {error ? (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md border border-mission/40 bg-mission/10 px-3 py-2 text-sm"
              >
                <TriangleAlert
                  className="mt-0.5 shrink-0 text-mission"
                  size={16}
                />
                <span className="text-mission">{error}</span>
              </div>
            ) : null}

            <Button
              type="submit"
              className="h-11 w-full font-mono text-[0.75rem] uppercase tracking-[0.25em]"
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Authenticating
                </>
              ) : (
                <>Authorise</>
              )}
            </Button>
          </FieldGroup>
        </form>

        <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground/80">
          Session protected · JWT bearer · TLS in production
        </p>
      </CardContent>
    </Card>
  );
}

function readableAuthError(code: string): string {
  switch (code) {
    case "CredentialsSignin":
      return "Invalid credentials. Check your email and password.";
    case "Configuration":
      return "Auth misconfigured. Notify the range officer.";
    case "session-expired":
      return "Your session expired. Please sign in again.";
    default:
      return "Sign-in failed. Try again, or contact the range officer.";
  }
}
