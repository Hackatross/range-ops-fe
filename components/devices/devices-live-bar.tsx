"use client";

import { Activity, AlertTriangle, Cpu, Wifi, WifiOff } from "lucide-react";
import { KpiGrid, StatCard } from "@/components/system";
import { useDevicesFeed } from "@/lib/ws/devices-feed";
import { formatCount, isHeartbeatFresh } from "@/lib/format";
import type { HardwareDevice } from "@/lib/types/domain";

interface Props {
  items: HardwareDevice[];
  isLoading: boolean;
}

/**
 * Live KPI strip rendered above the device grid.
 *
 * "Online" counts only devices whose last heartbeat is also fresh — a
 * device flagged online but silent for >30 s is suspect, so we surface it
 * as "stale" rather than rolling it into the green count. The WS link
 * indicator on the first card flips its own icon (Wifi / WifiOff) so
 * trainers can tell at a glance whether the dashboard itself is live.
 */
export function DevicesLiveBar({ items }: Props) {
  const { isConnected, messageCount } = useDevicesFeed();

  const total = items.length;
  const online = items.filter(
    (d) => d.status === "online" && isHeartbeatFresh(d.last_heartbeat),
  ).length;
  const stale = items.filter(
    (d) => d.status === "online" && !isHeartbeatFresh(d.last_heartbeat),
  ).length;
  const error = items.filter((d) => d.status === "error").length;

  return (
    <KpiGrid cols={4} className="py-2">
      <StatCard
        icon={
          isConnected ? (
            <Wifi size={16} />
          ) : (
            <WifiOff size={16} />
          )
        }
        label="Console link"
        value={isConnected ? "Live" : "Offline"}
        tone={isConnected ? "accent" : "warning"}
        hint={
          isConnected
            ? `${messageCount} update${messageCount === 1 ? "" : "s"} this session`
            : "WS reconnecting…"
        }
      />
      <StatCard
        icon={<Cpu size={16} />}
        label="Online"
        value={total === 0 ? "—" : `${online}/${total}`}
        tone={
          total === 0
            ? "default"
            : online === total
              ? "accent"
              : online === 0
                ? "danger"
                : "warning"
        }
        hint={total === 0 ? "No hardware registered" : "Heartbeat ≤ 30 s"}
      />
      <StatCard
        icon={<Activity size={16} />}
        label="Stale"
        value={formatCount(stale)}
        tone={stale > 0 ? "warning" : "default"}
        hint={stale > 0 ? "Online but silent" : "All beats fresh"}
      />
      <StatCard
        icon={<AlertTriangle size={16} />}
        label="Error"
        value={formatCount(error)}
        tone={error > 0 ? "danger" : "default"}
        hint={error > 0 ? "Investigate ASAP" : "No alerts"}
      />
    </KpiGrid>
  );
}
