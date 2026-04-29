"use client";

import { useEffect, useRef } from "react";
import { Crosshair, Flag, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MonoCode, StatusPill } from "@/components/system";
import { shotKindSpec } from "@/lib/domain/status";
import { formatRing, formatPoints, formatTime } from "@/lib/format";
import type { Shot } from "@/lib/types/domain";

interface Props {
  shots: Shot[];
  /** Newest shot ID — gets the gold flash treatment for ~220 ms. */
  highlightShotId?: string | null;
  className?: string;
}

/**
 * Terminal-style chronological shot log.
 *
 * Renders newest at the bottom (auto-scrolling), every row shows shot
 * number, ring, points, deviation, and a status badge. Bullseyes flash
 * gold once on arrival via `var(--animate-flash-bull)`.
 */
export function ShotFeed({ shots, highlightShotId, className }: Props) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Keep the latest row in view — only on shot count change, not on
  // unrelated re-renders.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [shots.length]);

  if (shots.length === 0) {
    return (
      <div
        className={cn(
          "flex h-full min-h-[280px] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border/60 bg-card/30 px-6 py-10 text-center",
          className,
        )}
      >
        <Crosshair className="size-6 text-primary/40" />
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
          Awaiting first shot
        </p>
        <p className="text-xs text-muted-foreground">
          Hardware-driven shots and manual entries appear here in real time.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className={cn("h-[440px] pr-1", className)}>
      <ol className="flex flex-col gap-2">
        {shots.map((shot) => (
          <ShotRow
            key={shot._id}
            shot={shot}
            highlight={highlightShotId === shot._id}
          />
        ))}
        <div ref={bottomRef} />
      </ol>
    </ScrollArea>
  );
}

function ShotRow({ shot, highlight }: { shot: Shot; highlight: boolean }) {
  const { is_bullseye, is_hit, ring_hit, points, deviation_cm } = shot.hit;
  const spec = shotKindSpec({
    is_bullseye,
    is_hit,
    ring: ring_hit ?? null,
  });

  return (
    <li
      data-shot-row
      data-bullseye={is_bullseye ? "" : undefined}
      className={cn(
        "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border/50 bg-background/45 px-3.5 py-3 transition-colors hover:border-primary/35 hover:bg-card/70",
        highlight && "border-bullseye/70 bg-bullseye/15 shadow-[0_0_22px_color-mix(in_oklch,var(--bullseye)_18%,transparent)]",
      )}
      style={
        highlight ? { animation: "var(--animate-flash-bull)" } : undefined
      }
    >
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-md ring-1 ring-border/40",
            is_bullseye
              ? "bg-bullseye/20 text-bullseye"
              : is_hit
                ? "bg-hit/15 text-hit"
                : "bg-muted text-muted-foreground",
          )}
        >
          {is_bullseye ? (
            <Target size={14} />
          ) : is_hit ? (
            <Crosshair size={14} />
          ) : (
            <Flag size={14} />
          )}
        </span>
        <div className="flex flex-col gap-0.5">
          <MonoCode size="xs" tone="muted">
            #{String(shot.shot_number).padStart(3, "0")}
          </MonoCode>
          <MonoCode size="xs" tone="muted" className="hidden opacity-70 sm:inline">
            {formatTime(shot.fired_at)}
          </MonoCode>
        </div>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-xs">
        <StatusPill spec={spec} size="sm" showDot={false}>
          {spec.symbol}
        </StatusPill>
        <MonoCode size="xs" weight="semibold">
          {formatRing(ring_hit)}
        </MonoCode>
        <MonoCode size="xs" tone="muted">
          {formatPoints(points)} pts
        </MonoCode>
        {deviation_cm != null ? (
          <MonoCode size="xs" tone="muted" className="basis-full sm:basis-auto">
            ±{deviation_cm.toFixed(1)}cm
          </MonoCode>
        ) : null}
        </div>
        {shot.camera_data?.image_url || shot.laser_data ? (
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {shot.camera_data?.image_url ? "camera frame attached" : "laser coordinate packet"}
          </p>
        ) : null}
      </div>

      <MonoCode size="xs" tone="muted" className="hidden sm:inline">
        {formatTime(shot.fired_at)}
      </MonoCode>
    </li>
  );
}
