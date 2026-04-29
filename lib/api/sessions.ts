import { createCrudApi } from "@classytic/arc-next/api";
import { createCrudHooks } from "@classytic/arc-next/hooks";
import { withSoftDelete } from "@classytic/arc-next/presets/soft-delete";
import { handleApiRequest } from "@classytic/arc-next/client";
import type { RangeSession } from "@/lib/types/domain";

export interface StartSessionPayload {
  shooter_id: string;
  weapon_id: string;
  target_id: string;
  trainer_id?: string;
  conditions?: {
    weather?: string;
    wind_kmh?: number;
    visibility?: string;
  };
  notes?: string;
}

export type EndSessionPayload = { notes?: string };
export type AbortSessionPayload = { reason?: string; notes?: string };

export const sessionsApi = withSoftDelete(
  createCrudApi<RangeSession, never, Partial<RangeSession>>("sessions", {
    basePath: "",
  }),
);

/**
 * `/sessions/start` is the only creation path — the bare POST is disabled
 * server-side (see `disabledRoutes: ['create']` in session.resource.ts).
 */
export async function startSession(
  data: StartSessionPayload,
): Promise<{ success: boolean; data: RangeSession }> {
  return handleApiRequest("POST", "/sessions/start", { body: data });
}

export async function endSession(
  id: string,
  data: EndSessionPayload = {},
): Promise<{ success: boolean; data: RangeSession }> {
  return handleApiRequest("POST", `/sessions/${id}/end`, { body: data });
}

export async function abortSession(
  id: string,
  data: AbortSessionPayload = {},
): Promise<{ success: boolean; data: RangeSession }> {
  return handleApiRequest("POST", `/sessions/${id}/abort`, { body: data });
}

export async function fetchSessionReport<TReport = unknown>(
  id: string,
): Promise<TReport> {
  return handleApiRequest("GET", `/sessions/${id}/report`);
}

export const {
  KEYS: SESSIONS_KEYS,
  cache: sessionsCache,
  useList: useSessionsList,
  useDetail: useSession,
  useActions: useSessionActions,
  useDeleted: useDeletedSessions,
  useNavigation: useSessionNavigation,
  useCustomMutation: useSessionCustomMutation,
} = createCrudHooks<RangeSession, never, Partial<RangeSession>>({
  api: sessionsApi,
  entityKey: "sessions",
  singular: "Session",
  plural: "Sessions",
});

/* -------------------------------------------------------------------------- */
/*  Lifecycle mutation hooks                                                  */
/*                                                                            */
/*  Each wraps a session-lifecycle endpoint with arc-next's mutation factory  */
/*  so toasts + cache invalidation mirror the auto-CRUD behaviour.            */
/* -------------------------------------------------------------------------- */

export function useStartSession() {
  return useSessionCustomMutation<
    { success: boolean; data: RangeSession },
    StartSessionPayload
  >({
    mutationFn: (vars) => startSession(vars),
    invalidateQueries: [SESSIONS_KEYS.lists()],
    messages: {
      success: "Session started.",
      error: "Could not start session.",
    },
  });
}

export function useEndSession() {
  return useSessionCustomMutation<
    { success: boolean; data: RangeSession },
    { id: string; data?: EndSessionPayload }
  >({
    mutationFn: ({ id, data }) => endSession(id, data),
    invalidateQueries: [SESSIONS_KEYS.lists(), SESSIONS_KEYS.details()],
    messages: {
      success: "Session completed.",
      error: "Could not end session.",
    },
  });
}

export function useAbortSession() {
  return useSessionCustomMutation<
    { success: boolean; data: RangeSession },
    { id: string; data?: AbortSessionPayload }
  >({
    mutationFn: ({ id, data }) => abortSession(id, data),
    invalidateQueries: [SESSIONS_KEYS.lists(), SESSIONS_KEYS.details()],
    messages: {
      success: "Session aborted.",
      error: "Could not abort session.",
    },
  });
}
