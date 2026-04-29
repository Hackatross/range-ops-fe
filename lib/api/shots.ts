import { useQuery } from "@tanstack/react-query";
import { createCrudApi } from "@classytic/arc-next/api";
import { createCrudHooks } from "@classytic/arc-next/hooks";
import { arcRequest } from "./request";
import { useAuthToken } from "@/lib/auth/use-auth-token";
import type { Shot } from "@/lib/types/domain";

/**
 * Top-level `/shots` resource (read-mostly). The session-scoped
 * `/sessions/:id/shots` route is also exposed; we use that for live views
 * because it returns a chronological list and is sourced from the same
 * session controller that broadcasts on the WS.
 */
export const shotsApi = createCrudApi<Shot, never, Partial<Shot>>("shots", {
  basePath: "",
});

export const {
  KEYS: SHOTS_KEYS,
  cache: shotsCache,
  useList: useShotsList,
  useDetail: useShot,
  useNavigation: useShotNavigation,
} = createCrudHooks<Shot, never, Partial<Shot>>({
  api: shotsApi,
  entityKey: "shots",
  singular: "Shot",
  plural: "Shots",
});

/**
 * Session-scoped chronological shot list — wraps `GET /sessions/:id/shots`.
 * Pass `enabled` so the wizard / list can mount this in dependent layouts.
 */
export function useSessionShots(sessionId: string | null) {
  const { isReady } = useAuthToken();
  return useQuery<Shot[]>({
    queryKey: ["sessions", sessionId, "shots"],
    enabled: isReady && !!sessionId,
    queryFn: async () => {
      const json = await arcRequest<{ success: boolean; data: Shot[] }>(
        "GET",
        `/sessions/${sessionId}/shots`,
      );
      return json.data ?? [];
    },
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });
}

/**
 * Cross-session ticker — `GET /shots?sort=-fired_at&limit=N`. Used by the
 * landing dashboard's recent-shots strip; not session-scoped.
 */
export function useRecentShots(limit = 10) {
  const { isReady } = useAuthToken();
  return useQuery<Shot[]>({
    queryKey: ["shots", "recent", limit],
    enabled: isReady,
    queryFn: async () => {
      const json = await arcRequest<{
        success: boolean;
        data: Shot[];
      }>("GET", `/shots?sort=-fired_at&limit=${limit}`);
      return json.data ?? [];
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Manual shot payload — see apps/server/src/resources/shots/shot.schemas.ts.
 * Caller supplies hit coordinates only; the backend hit-calculator derives
 * ring / points / is_bullseye / is_hit from the target geometry. This
 * keeps manual entry indistinguishable from hardware ingest on the wire.
 */
export interface ManualShotPayload {
  hit_x_cm: number;
  hit_y_cm: number;
  fired_at?: string;
  notes?: string;
}

export async function postManualShot(
  sessionId: string,
  data: ManualShotPayload,
): Promise<{ success: boolean; data: Shot }> {
  return arcRequest("POST", `/sessions/${sessionId}/shots`, {
    body: data,
  });
}
