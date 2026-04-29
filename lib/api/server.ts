/**
 * Server-side fetch helpers for arc backend.
 *
 * arc-next's `configureClient` is client-only — calling it during SSR leaks
 * module state across requests. Server components that need bearer-authed
 * data go through this thin wrapper instead.
 *
 * Usage:
 *   const me = await fetchServer<{ data: User }>("/auth/me");
 */

import { auth } from "@/lib/auth/config";

const apiUrl =
  process.env.ARC_API_URL ??
  process.env.NEXT_PUBLIC_ARC_API_URL ??
  "http://localhost:8040";

export type FetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Override the bearer token; falls back to the active NextAuth session. */
  token?: string | null;
};

export async function fetchServer<T = unknown>(
  endpoint: string,
  init: FetchOptions = {},
): Promise<T> {
  const session = init.token === undefined ? await auth() : null;
  const token = init.token ?? session?.accessToken ?? null;

  const headers = new Headers(init.headers);
  headers.set("accept", "application/json");
  if (init.body !== undefined && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  if (token) headers.set("authorization", `Bearer ${token}`);

  const res = await fetch(`${apiUrl}${endpoint}`, {
    ...init,
    headers,
    body:
      init.body === undefined
        ? undefined
        : typeof init.body === "string" || init.body instanceof FormData
        ? (init.body as BodyInit)
        : JSON.stringify(init.body),
    cache: init.cache ?? "no-store",
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new ArcServerError(
      `${res.status} ${res.statusText} on ${endpoint}`,
      res.status,
      detail,
    );
  }
  return (await res.json()) as T;
}

export class ArcServerError extends Error {
  status: number;
  detail: string;
  constructor(message: string, status: number, detail = "") {
    super(message);
    this.name = "ArcServerError";
    this.status = status;
    this.detail = detail;
  }
}

/** Convenience wrapper for `GET /auth/me`. */
export async function fetchMe<TUser = unknown>(): Promise<TUser | null> {
  try {
    const json = await fetchServer<{ success?: boolean; data?: TUser }>(
      "/auth/me",
    );
    return json.data ?? null;
  } catch (err) {
    if (err instanceof ArcServerError && err.status === 401) return null;
    throw err;
  }
}
