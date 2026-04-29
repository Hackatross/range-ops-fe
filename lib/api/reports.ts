import { useQuery } from "@tanstack/react-query";
import { handleApiRequest, createQueryString } from "@classytic/arc-next/client";
import { useAuthToken } from "@/lib/auth/use-auth-token";
import type {
  LeaderboardRow,
  ShooterReport,
} from "@/lib/types/domain";

export type LeaderboardSortKey =
  | "accuracy_percent"
  | "total_score"
  | "bullseyes"
  | "score_percent";

export interface LeaderboardParams {
  from?: string;
  to?: string;
  limit?: number;
  sort_by?: LeaderboardSortKey;
}

/** GET /reports/leaderboard — completed sessions in a date range, ranked. */
export function useLeaderboard(params: LeaderboardParams = {}) {
  const { token, isReady } = useAuthToken();
  return useQuery<LeaderboardRow[]>({
    queryKey: ["reports", "leaderboard", params],
    enabled: isReady,
    queryFn: async () => {
      const qs = createQueryString(params as Record<string, unknown>);
      const json = await handleApiRequest<{
        success: boolean;
        data: LeaderboardRow[];
      }>("GET", `/reports/leaderboard${qs ? `?${qs}` : ""}`, { token });
      return json.data ?? [];
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

/** GET /reports/shooter/:id — accepts ObjectId or shooter_id business code. */
export function useShooterReport(shooterIdOrCode: string | null) {
  const { token, isReady } = useAuthToken();
  return useQuery<ShooterReport | null>({
    queryKey: ["reports", "shooter", shooterIdOrCode],
    enabled: isReady && !!shooterIdOrCode,
    queryFn: async () => {
      const json = await handleApiRequest<{
        success: boolean;
        data: ShooterReport | null;
      }>("GET", `/reports/shooter/${shooterIdOrCode}`, { token });
      return json.data ?? null;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

/** GET /reports/session/:id — printable session payload. */
export function useSessionReport<TReport = unknown>(sessionId: string | null) {
  const { token, isReady } = useAuthToken();
  return useQuery<TReport | null>({
    queryKey: ["reports", "session", sessionId],
    enabled: isReady && !!sessionId,
    queryFn: async () => {
      const json = await handleApiRequest<{
        success: boolean;
        data: TReport | null;
      }>("GET", `/reports/session/${sessionId}`, { token });
      return json.data ?? null;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
