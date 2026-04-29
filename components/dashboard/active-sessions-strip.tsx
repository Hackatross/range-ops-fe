"use client";

import Link from "next/link";
import { ArrowRight, Crosshair, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { MonoCode, StatusPill } from "@/components/system";
import { sessionStatusSpec } from "@/lib/domain/status";
import { formatDuration, formatCount, EM_DASH } from "@/lib/format";
import type { RangeSession } from "@/lib/types/domain";

interface Props {
  sessions: RangeSession[];
  isLoading?: boolean;
  className?: string;
}

/**
 * Active-session card row for the landing dashboard.
 *
 * Renders a single tile per active session with the running clock, shot
 * count, and a deep link into the live view. When the list is empty, a
 * dashed CTA tile invites the trainer to start a session — the empty
 * state IS the call to action, not a separate "no data" panel.
 */
export function ActiveSessionsStrip({ sessions, isLoading, className }: Props) {
  if (isLoading) {
    return (
      <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-3", className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-lg border border-border/40 bg-muted/30"
          />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Link
        href="/sessions/new"
        className={cn(
          "group flex min-h-[128px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-6 py-8 text-center transition-colors hover:border-primary/60 hover:bg-primary/10",
          className,
        )}
      >
        <Crosshair className="size-6 text-primary/70 transition-transform group-hover:scale-110" />
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-primary">
          Range is quiet
        </p>
        <p className="text-sm text-muted-foreground">
          Tap to start a new session — pick a shooter, weapon, and target.
        </p>
      </Link>
    );
  }

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-3", className)}>
      {sessions.map((session) => (
        <SessionTile key={session._id} session={session} />
      ))}
    </div>
  );
}

function SessionTile({ session }: { session: RangeSession }) {
  const startedAt = new Date(session.started_at).getTime();
  const elapsedMs = Date.now() - startedAt;
  const spec = sessionStatusSpec(session.status);

  return (
    <Link
      href={`/sessions/${session._id}`}
      className={cn(
        "group flex flex-col gap-3 rounded-lg border border-border/60 bg-card/70 p-4 transition-colors hover:border-primary/50 hover:bg-card",
        "min-h-[128px]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <MonoCode size="xs" tone="muted">
            {session.session_code ?? EM_DASH}
          </MonoCode>
          <p className="mt-1 truncate text-sm font-medium">
            Shooter · {session.shooter_id}
          </p>
        </div>
        <StatusPill spec={spec} size="sm" />
      </div>
      <div className="grid grid-cols-3 gap-2 border-t border-border/50 pt-3 text-xs">
        <div>
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-muted-foreground">
            Elapsed
          </p>
          <p className="mt-0.5 flex items-center gap-1 font-mono">
            <Timer size={11} className="text-primary/70" />
            {formatDuration(elapsedMs)}
          </p>
        </div>
        <div>
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-muted-foreground">
            Shots
          </p>
          <p className="mt-0.5 font-mono font-semibold">
            {formatCount(session.shots_count ?? 0)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-muted-foreground">
            Bulls
          </p>
          <p className="mt-0.5 font-mono font-semibold text-bullseye">
            {formatCount(session.bullseyes ?? 0)}
          </p>
        </div>
      </div>
      <p className="mt-auto inline-flex items-center justify-end gap-1 font-mono text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground transition-colors group-hover:text-primary">
        Open live view <ArrowRight size={11} />
      </p>
    </Link>
  );
}
