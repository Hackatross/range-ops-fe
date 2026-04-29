"use client";

import { Cpu, Pencil, Trash2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ConfirmDialog,
  MonoCode,
  StatusPill,
} from "@/components/system";
import { SignalStrength } from "@/components/illustrations/signal-strength";
import { deviceStatusSpec } from "@/lib/domain/status";
import {
  deriveStationLabel,
  formatHeartbeatAge,
  formatTime,
  isHeartbeatFresh,
  EM_DASH,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { HardwareDevice } from "@/lib/types/domain";
import { DeviceHeartbeatButton } from "./device-heartbeat-button";

interface Props {
  device: HardwareDevice;
  onEdit: () => void;
  onDelete: (() => Promise<boolean>) | null;
}

/**
 * One device → one station card.
 *
 * Built for tablet-first range operation: 280–360 px wide, every interactive
 * surface ≥ 44 px, status colour driven by `status × heartbeat-freshness`
 * (so a device the backend says is "online" but hasn't beat in 30 s drops to
 * amber automatically). Manual heartbeat + edit live in the card; delete is
 * gated by the role-aware `onDelete` callback, which is null for trainers.
 */
export function DeviceStationCard({ device, onEdit, onDelete }: Props) {
  const fresh = isHeartbeatFresh(device.last_heartbeat);
  const station = deriveStationLabel({
    device_id: device.device_id,
    location: device.location,
  });

  // Status × freshness × type → tone for the card border + signal bars.
  // The pill always reflects backend state; the *border* reflects effective
  // state so a quick scan flags stale-but-online devices.
  const effectiveTone =
    !fresh && device.status === "online"
      ? "warning"
      : device.status === "online"
        ? "success"
        : device.status === "error"
          ? "danger"
          : "neutral";

  const borderClass =
    effectiveTone === "success"
      ? "border-hit/40 bg-hit/5"
      : effectiveTone === "warning"
        ? "border-tactical/40 bg-tactical/5"
        : effectiveTone === "danger"
          ? "border-mission/40 bg-mission/5"
          : "border-border/60 bg-card/60";

  const iconTone =
    effectiveTone === "success"
      ? "bg-hit/15 text-hit"
      : effectiveTone === "warning"
        ? "bg-tactical/15 text-tactical"
        : effectiveTone === "danger"
          ? "bg-mission/15 text-mission"
          : "bg-secondary/40 text-foreground";

  const signalTone =
    effectiveTone === "success"
      ? "text-hit"
      : effectiveTone === "warning"
        ? "text-tactical"
        : effectiveTone === "danger"
          ? "text-mission"
          : "text-muted-foreground";

  const strength = !fresh
    ? device.status === "online"
      ? 1
      : 0
    : device.status === "online"
      ? 4
      : device.status === "error"
        ? 1
        : 0;

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-lg border p-4 transition-colors",
        "min-h-[200px]",
        borderClass,
      )}
    >
      <header className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-md",
            iconTone,
          )}
        >
          {device.type === "camera" ? <Video size={18} /> : <Cpu size={18} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{station}</p>
          <MonoCode size="xs" tone="muted" className="block truncate">
            {device.device_id}
          </MonoCode>
        </div>
        <StatusPill spec={deviceStatusSpec(device.status)} size="sm" />
      </header>

      <div className="flex items-center gap-3 rounded-md border border-border/40 bg-background/40 p-3">
        <span className={cn("flex size-7 items-center justify-center", signalTone)}>
          <SignalStrength strength={strength} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <MonoCode size="xs" tone="muted">
            Last heartbeat
          </MonoCode>
          <p className="text-sm font-medium">
            {formatHeartbeatAge(device.last_heartbeat)}
          </p>
        </div>
        <div className="text-right">
          <MonoCode size="xs" tone="muted">
            Wall clock
          </MonoCode>
          <p className="font-mono text-xs text-muted-foreground">
            {device.last_heartbeat
              ? formatTime(device.last_heartbeat)
              : EM_DASH}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        <DataRow label="Type" value={device.type} mono={false} capitalize />
        <DataRow
          label="Network"
          value={
            device.ip_address || device.port
              ? [device.ip_address, device.port].filter(Boolean).join(":")
              : EM_DASH
          }
        />
        {device.protocol ? (
          <DataRow label="Protocol" value={device.protocol} />
        ) : null}
        {device.location ? (
          <DataRow label="Location" value={device.location} mono={false} />
        ) : null}
      </dl>

      <footer className="mt-auto flex items-center justify-between gap-2 border-t border-border/40 pt-3">
        <DeviceHeartbeatButton device={device} />
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-9 min-h-9 gap-1.5"
          >
            <Pencil className="size-3.5" />
            Edit
          </Button>
          {onDelete ? (
            <ConfirmDialog
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 min-h-9 gap-1.5 text-mission hover:text-mission"
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </Button>
              }
              tone="danger"
              title={`Delete ${device.device_id}?`}
              description="The device will be removed from the registry; sessions referencing it stay intact."
              confirmLabel="Delete"
              onConfirm={async () => {
                await onDelete();
              }}
            />
          ) : null}
        </div>
      </footer>
    </article>
  );
}

function DataRow({
  label,
  value,
  mono = true,
  capitalize = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-border/30 pb-1 last:border-b-0 last:pb-0">
      <MonoCode size="xs" tone="muted">
        {label}
      </MonoCode>
      <span
        className={cn(
          "max-w-[60%] truncate text-right text-xs",
          mono && "font-mono",
          capitalize && "capitalize",
        )}
      >
        {value}
      </span>
    </div>
  );
}
