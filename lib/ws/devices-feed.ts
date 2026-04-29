"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "@classytic/arc-next/ws";
import { DEVICES_KEYS } from "@/lib/api/devices";

interface DeviceStatusBroadcast {
  event: "device:status";
  device_id: string;
  status: "online" | "offline" | "error";
  last_heartbeat?: string | null;
}

export interface UseDevicesFeedResult {
  isConnected: boolean;
  /** Last `device_id` whose status changed — useful for row-flash highlights. */
  lastDeviceId: string | null;
  messageCount: number;
}

/**
 * Subscribes to the global `devices` WS room. Every status change
 * invalidates the device list so the table re-fetches and re-paints.
 *
 *   const { isConnected, lastDeviceId } = useDevicesFeed();
 *
 * Heartbeat-driven status flips travel through this room (see
 * apps/server/src/resources/hardware/hardware.controller.ts:95).
 */
export function useDevicesFeed(enabled = true): UseDevicesFeedResult {
  const qc = useQueryClient();
  const [lastDeviceId, setLastDeviceId] = useState<string | null>(null);
  const lastSeenRef = useRef<string | null>(null);

  const result = useWebSocket<DeviceStatusBroadcast>({
    path: "/ws",
    enabled,
    subscribe: ["devices"],
    heartbeatInterval: 30_000,
    onMessage: (msg) => {
      const data = msg.data as DeviceStatusBroadcast | undefined;
      if (!data || data.event !== "device:status") return;
      lastSeenRef.current = data.device_id;
      setLastDeviceId(data.device_id);
      qc.invalidateQueries({ queryKey: DEVICES_KEYS.lists() });
      // Detail key also caches the last_heartbeat we just got an update on.
      qc.invalidateQueries({ queryKey: DEVICES_KEYS.details() });
    },
  });

  // Clear the last-seen flash 600 ms after the row settles so callers
  // can use it as a one-shot animation hook.
  useEffect(() => {
    if (!lastDeviceId) return;
    const t = setTimeout(() => setLastDeviceId(null), 600);
    return () => clearTimeout(t);
  }, [lastDeviceId]);

  return {
    isConnected: result.isConnected,
    lastDeviceId,
    messageCount: result.messageCount,
  };
}
