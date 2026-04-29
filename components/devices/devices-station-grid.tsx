"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/system";
import { CompassRose } from "@/components/illustrations/compass-rose";
import type { HardwareDevice } from "@/lib/types/domain";
import { DeviceStationCard } from "./device-station-card";

interface Props {
  items: HardwareDevice[];
  isLoading: boolean;
  onEdit: (device: HardwareDevice) => void;
  onDelete: ((device: HardwareDevice) => Promise<boolean>) | null;
  permissions: Record<string, boolean>;
}

/**
 * Card grid for hardware stations — replaces the default DataTable body
 * inside `<ResourceDashboard>`.
 *
 * Why cards: range deployments rarely hold more than ~30 devices, the cards
 * are tablet-friendly (every action ≥ 44 px), and the live status (heartbeat
 * freshness, signal strength) reads better in a tile than a row. Pagination
 * still flows through `<ResourceDashboard>`'s footer — the grid renders
 * whatever page the URL points at.
 */
export function DevicesStationGrid({
  items,
  isLoading,
  onEdit,
  onDelete,
}: Props) {
  if (isLoading) {
    return (
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-[200px] animate-pulse rounded-lg border border-border/40 bg-muted/30"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          illustration={
            <CompassRose
              size={140}
              className="text-primary/50"
            />
          }
          eyebrow="Range hardware"
          title="No stations registered"
          description="Register a device for each lane — laser sensors detect shots, cameras capture frames. Heartbeats start landing the moment hardware comes online."
          action={
            <Button
              nativeButton={false}
              render={
                <Link href="/devices?new=1">
                  <Plus className="size-4" />
                  Register a device
                </Link>
              }
            />
          }
        />
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Need a quick smoke test? See{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.65rem]">
            apps/server/tests/probes/probe-smoke.mjs
          </code>{" "}
          for a hardware-free dry run.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((device) => (
        <DeviceStationCard
          key={device._id}
          device={device}
          onEdit={() => onEdit(device)}
          onDelete={onDelete ? () => onDelete(device) : null}
        />
      ))}
    </div>
  );
}

