"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "@classytic/arc-next/ws";
import { SESSIONS_KEYS } from "@/lib/api/sessions";
import type { Shot } from "@/lib/types/domain";

/**
 * Live session feed — subscribes to the `session:<id>` WS room and
 * mirrors the broadcast events into TanStack Query cache so any consumer
 * (`useSession`, `useSessionShots`) re-renders without re-fetching.
 *
 * Backend broadcasts (apps/server/src/resources/sessions/session.controller.ts):
 *   - `shot:recorded`   { session_id, shot }
 *   - `session:ended`   { session_id, status, stats?, ended_at }
 *
 * Hardware ingest publishes the same `shot:recorded` shape, so a manually
 * entered shot and a sensor-driven shot are indistinguishable on the wire.
 */

interface ShotBroadcast {
  event: "shot:recorded";
  session_id: string;
  shot: Shot;
}

interface SessionEndedBroadcast {
  event: "session:ended";
  session_id: string;
  status: "completed" | "aborted";
  stats?: Record<string, unknown>;
  ended_at?: string;
}

type Broadcast = ShotBroadcast | SessionEndedBroadcast;

export interface UseLiveSessionFeedResult {
  isConnected: boolean;
  /** Last shot pushed by the backend; useful for one-off animations. */
  lastShot: Shot | null;
  messageCount: number;
}

export function useLiveSessionFeed(
  sessionId: string | null,
): UseLiveSessionFeedResult {
  const qc = useQueryClient();
  const [lastShot, setLastShot] = useState<Shot | null>(null);

  const result = useWebSocket<Broadcast>({
    path: "/ws",
    enabled: !!sessionId,
    subscribe: sessionId ? [`session:${sessionId}`] : [],
    heartbeatInterval: 30_000,
    onMessage: (msg) => {
      if (!sessionId) return;
      const data = msg.data as Broadcast | undefined;
      if (!data || data.session_id !== sessionId) return;

      if (data.event === "shot:recorded") {
        // Append to the cached chronological shot list — the live view
        // reads it via `useSessionShots(sessionId)`.
        qc.setQueryData<Shot[]>(
          ["sessions", sessionId, "shots"],
          (old) => (old ? [...old, data.shot] : [data.shot]),
        );
        setLastShot(data.shot);
        // Bump session detail (shots_count + score will refresh).
        qc.invalidateQueries({
          queryKey: SESSIONS_KEYS.detail(sessionId),
        });
      } else if (data.event === "session:ended") {
        qc.invalidateQueries({
          queryKey: SESSIONS_KEYS.detail(sessionId),
        });
        qc.invalidateQueries({ queryKey: SESSIONS_KEYS.lists() });
      }
    },
  });

  // Reset the lastShot state when the session changes — prevents a
  // bullseye flash from a previous session leaking into a new mount.
  useEffect(() => {
    setLastShot(null);
  }, [sessionId]);

  return {
    isConnected: result.isConnected,
    lastShot,
    messageCount: result.messageCount,
  };
}
