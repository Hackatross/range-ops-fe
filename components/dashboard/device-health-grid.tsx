"use client";

import Link from "next/link";
import { Cpu, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { MonoCode } from "@/components/system";
import { SignalStrength } from "@/components/illustrations/signal-strength";
import {
  deriveStationLabel,
  formatHeartbeatAge,
  isHeartbeatFresh,
} from "@/lib/format";
import type { HardwareDevice } from "@/lib/types/domain";

interface Props {
  devices: HardwareDevice[];
  isLoading?: boolean;
  className?: string;
}

/**
 * Compact per-device health tiles for the landing dashboard.
 *
 * Tone is driven by the *combination* of `status` and heartbeat freshness
 * — a device the backend marked "online" but hasn't beat in 2 minutes is
 * suspect, so we drop it to amber regardless. The signal-strength icon is
 * a compressed proxy: 4 bars when fresh + online, 0 bars when offline.
 */
export function DeviceHealthGrid({ devices, isLoading, className }: Props) {
  if (isLoading) {
    return (
      <div className={cn("grid gap-2 sm:grid-cols-2 lg:grid-cols-3", className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-md border border-border/40 bg-muted/30"
          />
        ))}
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <Link
        href="/devices"
        className={cn(
          "flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 bg-card/40 px-6 py-8 text-center transition-colors hover:border-primary/50 hover:bg-primary/5",
          className,
        )}
      >
        <Cpu className="size-6 text-muted-foreground/60" />
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
          No hardware registered
        </p>
        <p className="inline-flex items-center gap-1 text-xs text-primary">
          <Plus size={12} /> Register a device
        </p>
      </Link>
    );
  }

  return (
    <div className={cn("grid gap-2 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {devices.map((device) => (
        <DeviceTile key={device._id} device={device} />
      ))}
    </div>
  );
}

function DeviceTile({ device }: { device: HardwareDevice }) {
  const fresh = isHeartbeatFresh(device.last_heartbeat);
  const station = deriveStationLabel({
    device_id: device.device_id,
    location: device.location,
  });

  // Signal strength: 4 bars only when both flags align. Stale beats drop us
  // to 1 bar so the trainer sees a degraded link before the status flips.
  const strength = !fresh
    ? device.status === "online"
      ? 1
      : 0
    : device.status === "online"
      ? 4
      : device.status === "error"
        ? 1
        : 0;

  const tone =
    !fresh && device.status === "online"
      ? "text-tactical"
      : device.status === "online"
        ? "text-hit"
        : device.status === "error"
          ? "text-mission"
          : "text-muted-foreground";

  return (
    <Link
      href="/devices"
      className="group flex items-center gap-3 rounded-md border border-border/60 bg-card/60 p-3 transition-colors hover:border-primary/40 hover:bg-card"
    >
      <span className={cn("flex size-9 items-center justify-center", tone)}>
        <SignalStrength strength={strength} size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{station}</p>
        <p className="truncate font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
          {device.type} · {device.device_id}
        </p>
      </div>
      <div className="text-right">
        <p
          className={cn(
            "font-mono text-[0.6rem] uppercase tracking-[0.2em]",
            tone,
          )}
        >
          {device.status}
        </p>
        <p className="mt-0.5 font-mono text-[0.6rem] text-muted-foreground">
          {formatHeartbeatAge(device.last_heartbeat)}
        </p>
      </div>
    </Link>
  );
}
