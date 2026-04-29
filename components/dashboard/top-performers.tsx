"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { MonoCode, StatusPill } from "@/components/system";
import { leaderboardRankSpec } from "@/lib/domain/status";
import { formatAccuracy, formatCount, EM_DASH } from "@/lib/format";
import type { LeaderboardRow } from "@/lib/types/domain";

interface Props {
  rows: LeaderboardRow[];
  isLoading?: boolean;
  className?: string;
}

/**
 * Top-5 leaderboard preview for the landing.
 *
 * Mirrors the medal pills used on the full leaderboard so the visual
 * shorthand carries — gold/silver/bronze first, then plain ranks. The
 * shooter cell is a deep-link into the per-shooter report.
 */
export function TopPerformers({ rows, isLoading, className }: Props) {
  if (isLoading) {
    return (
      <ul className={cn("space-y-1.5", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <li
            key={i}
            className="h-10 animate-pulse rounded border border-border/40 bg-muted/30"
          />
        ))}
      </ul>
    );
  }

  if (rows.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border/60 bg-card/30 px-6 py-10 text-center",
          className,
        )}
      >
        <Trophy className="size-5 text-primary/40" />
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground">
          No completed sessions yet
        </p>
        <p className="text-xs text-muted-foreground">
          The leaderboard fills in once a session ends.
        </p>
      </div>
    );
  }

  return (
    <ol className={cn("flex flex-col gap-1", className)}>
      {rows.map((row, i) => (
        <PerformerRow key={row.shooter?._id ?? i} row={row} rank={i + 1} />
      ))}
    </ol>
  );
}

function PerformerRow({ row, rank }: { row: LeaderboardRow; rank: number }) {
  const medal = leaderboardRankSpec(rank);
  const shooter = row.shooter;
  const target = shooter?._id ? `/reports/shooter/${shooter._id}` : null;

  const Inner = (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 rounded border border-border/40 bg-card/40 px-3 py-2 transition-colors hover:border-primary/40 hover:bg-card/70">
      <span className="flex size-7 items-center justify-center rounded-md border border-border/60 bg-secondary/40 font-mono text-xs font-semibold tabular-nums">
        {rank}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">
          {shooter?.name ?? EM_DASH}
        </p>
        <p className="truncate font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
          {shooter?.shooter_id ?? EM_DASH}
          {row.sessions ? ` · ${formatCount(row.sessions)} sess` : ""}
        </p>
      </div>
      <MonoCode size="xs" weight="semibold">
        {formatAccuracy(row.accuracy_percent)}
      </MonoCode>
      {medal ? (
        <StatusPill spec={medal} size="sm" />
      ) : (
        <span className="w-12" aria-hidden />
      )}
    </div>
  );

  return (
    <li>
      {target ? (
        <Link href={target} className="block">
          {Inner}
        </Link>
      ) : (
        Inner
      )}
    </li>
  );
}
