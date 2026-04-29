import {
  handleApiRequest,
  type ApiRequestOptions,
  type HttpMethod,
} from "@classytic/arc-next/client";
import { getAccessToken } from "@/lib/auth/token-cache";

/**
 * Auth-aware wrapper around `handleApiRequest`. Auto-injects the bearer token
 * from the NextAuth-bridged token cache so hand-rolled mutations and queries
 * don't have to pass `{ token }` on every call. Pass `token` explicitly to
 * override (use `token: null` to deliberately skip auth).
 *
 * `createCrudHooks` already routes auth through its own resolver — only the
 * direct callsites in `lib/api/{sessions,shots,devices,reports}.ts` need this.
 */
export function arcRequest<T = unknown>(
  method: HttpMethod,
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  return handleApiRequest<T>(method, endpoint, {
    ...options,
    token: options.token !== undefined ? options.token : getAccessToken(),
  });
}
