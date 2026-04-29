"use client";

import Link from "next/link";
import { Crosshair, Flag, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { MonoCode, StatusPill } from "@/components/system";
import { shotKindSpec } from "@/lib/domain/status";
import { formatPoints, formatRing, formatTime } from "@/lib/format";
import type { Shot } from "@/lib/types/domain";

interface Props {
  shots: Shot[];
  isLoading?: boolean;
  className?: string;
}

/**
 * Cross-session shot ticker for the landing dashboard.
 *
 * Newest first — the inverse of the live-session ShotFeed (which auto-
 * scrolls to the bottom). Each row links into the originating session
 * so the trainer can jump from "huh, that bullseye on Lane 03" straight
 * to that session's live view.
 */
export function RecentShotsTicker({ shots, isLoading, className }: Props) {
  if (isLoading) {
    return (
      <ul className={cn("space-y-1.5", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <li
            key={i}
            className="h-9 animate-pulse rounded border border-border/40 bg-muted/30"
          />
        ))}
      </ul>
    );
  }

  if (shots.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border/60 bg-card/30 px-6 py-10 text-center",
          className,
        )}
      >
        <Crosshair className="size-5 text-primary/40" />
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground">
          No shots recorded yet
        </p>
        <p className="text-xs text-muted-foreground">
          Hardware ingest and manual entries from any session land here.
        </p>
      </div>
    );
  }

  return (
    <ol className={cn("flex flex-col gap-1.5", className)}>
      {shots.map((shot) => (
        <TickerRow key={shot._id} shot={shot} />
      ))}
    </ol>
  );
}

function TickerRow({ shot }: { shot: Shot }) {
  const { is_bullseye, is_hit, ring_hit, points } = shot.hit;
  const spec = shotKindSpec({
    is_bullseye,
    is_hit,
    ring: ring_hit ?? null,
  });

  return (
    <li>
      <Link
        href={`/sessions/${shot.session_id}`}
        className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded border border-border/40 bg-card/40 px-3 py-2 transition-colors hover:border-primary/40 hover:bg-card/70"
      >
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-md",
            is_bullseye
              ? "bg-bullseye/20 text-bullseye"
              : is_hit
                ? "bg-hit/15 text-hit"
                : "bg-muted text-muted-foreground",
          )}
        >
          {is_bullseye ? (
            <Target size={13} />
          ) : is_hit ? (
            <Crosshair size={13} />
          ) : (
            <Flag size={13} />
          )}
        </span>
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs">
          <StatusPill spec={spec} size="sm" showDot={false}>
            {spec.symbol}
          </StatusPill>
          <MonoCode size="xs" weight="semibold">
            {formatRing(ring_hit)}
          </MonoCode>
          <MonoCode size="xs" tone="muted">
            {formatPoints(points)} pts
          </MonoCode>
          <MonoCode size="xs" tone="muted" className="hidden sm:inline">
            #{String(shot.shot_number).padStart(3, "0")}
          </MonoCode>
        </div>
        <MonoCode size="xs" tone="muted">
          {formatTime(shot.fired_at)}
        </MonoCode>
      </Link>
    </li>
  );
}
