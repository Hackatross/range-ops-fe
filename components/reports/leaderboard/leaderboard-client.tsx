"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Award, Calendar, Trophy } from "lucide-react";
import { DataTable } from "@classytic/fluid/client/table";
import type { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  EmptyState,
  MonoCode,
  PageHeader,
  SectionCard,
  StatusPill,
} from "@/components/system";
import { NoResults } from "@/components/illustrations/no-results";
import { useLeaderboard, type LeaderboardSortKey } from "@/lib/api/reports";
import { leaderboardRankSpec } from "@/lib/domain/status";
import { formatAccuracy, formatCount, formatScore } from "@/lib/format";
import type { LeaderboardRow } from "@/lib/types/domain";

const SORT_TABS: { id: LeaderboardSortKey; label: string }[] = [
  { id: "accuracy_percent", label: "Accuracy" },
  { id: "total_score", label: "Score" },
  { id: "score_percent", label: "Score %" },
  { id: "bullseyes", label: "Bullseyes" },
];

const RANGE_PRESETS = [
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
  { id: "all", label: "All time" },
] as const;

type RangeId = (typeof RANGE_PRESETS)[number]["id"];

function rangeToDates(id: RangeId): { from?: string; to?: string } {
  if (id === "all") return {};
  const days = id === "7d" ? 7 : id === "30d" ? 30 : 90;
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - days);
  return { from: from.toISOString(), to: to.toISOString() };
}

export function LeaderboardClient() {
  const [sort, setSort] = useState<LeaderboardSortKey>("accuracy_percent");
  const [range, setRange] = useState<RangeId>("30d");
  const [limit, setLimit] = useState(10);

  const params = useMemo(
    () => ({ sort_by: sort, limit, ...rangeToDates(range) }),
    [sort, range, limit],
  );
  const query = useLeaderboard(params);
  const rows = query.data ?? [];

  const columns = useMemo<ColumnDef<LeaderboardRow, unknown>[]>(
    () => [
      {
        id: "rank",
        header: "Rank",
        cell: ({ row }) => {
          const rank = row.index + 1;
          const spec = leaderboardRankSpec(rank);
          return (
            <div className="flex items-center gap-2">
              <span
                className="flex size-8 items-center justify-center rounded-full font-mono text-sm font-semibold"
                style={
                  spec
                    ? {
                        backgroundColor:
                          spec.tone === "accent"
                            ? "color-mix(in oklch, var(--bullseye) 18%, transparent)"
                            : spec.tone === "info"
                              ? "color-mix(in oklch, var(--primary) 16%, transparent)"
                              : "color-mix(in oklch, var(--tactical) 18%, transparent)",
                        color:
                          spec.tone === "accent"
                            ? "var(--bullseye)"
                            : spec.tone === "info"
                              ? "var(--primary)"
                              : "var(--tactical)",
                      }
                    : { background: "var(--secondary)" }
                }
              >
                {rank}
              </span>
              {spec ? (
                <StatusPill spec={spec} size="sm" showDot={false}>
                  {spec.label}
                </StatusPill>
              ) : null}
            </div>
          );
        },
      },
      {
        id: "shooter",
        header: "Shooter",
        cell: ({ row }) => {
          const s = row.original.shooter;
          if (!s) {
            return <span className="text-muted-foreground">— removed —</span>;
          }
          return (
            <Link
              href={`/reports/shooter/${s._id}`}
              className="flex flex-col gap-0.5 hover:text-primary"
            >
              <span className="text-sm font-medium">{s.name}</span>
              <span className="flex items-center gap-1.5">
                <MonoCode size="xs" tone="muted">
                  {s.shooter_id}
                </MonoCode>
                {s.unit ? (
                  <span className="text-xs text-muted-foreground">
                    · {s.unit}
                  </span>
                ) : null}
              </span>
            </Link>
          );
        },
      },
      {
        accessorKey: "accuracy_percent",
        header: "Accuracy",
        cell: ({ row }) => (
          <MonoCode size="sm" weight="semibold" tone="primary">
            {formatAccuracy(row.original.accuracy_percent)}
          </MonoCode>
        ),
      },
      {
        accessorKey: "total_score",
        header: "Score",
        cell: ({ row }) => (
          <MonoCode size="sm" weight="semibold">
            {formatScore(row.original.total_score)}
          </MonoCode>
        ),
      },
      {
        accessorKey: "bullseyes",
        header: "Bullseyes",
        cell: ({ row }) => (
          <MonoCode size="sm" tone="bullseye" weight="semibold">
            {formatCount(row.original.bullseyes)}
          </MonoCode>
        ),
      },
      {
        accessorKey: "sessions",
        header: "Sessions",
        cell: ({ row }) => (
          <MonoCode size="sm" tone="muted">
            {row.original.sessions}
          </MonoCode>
        ),
      },
      {
        accessorKey: "shots",
        header: "Shots",
        cell: ({ row }) => (
          <MonoCode size="sm" tone="muted">
            {formatCount(row.original.shots)}
          </MonoCode>
        ),
      },
    ],
    [],
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6 sm:p-10">
      <PageHeader
        eyebrow="Reports"
        title="Leaderboard"
        description="Top performers in completed sessions. Click a name for the full performance breakdown."
        badge={<Trophy className="size-5 text-bullseye" />}
        actions={
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-muted-foreground" />
            <Tabs value={range} onValueChange={(v) => setRange(v as RangeId)}>
              <TabsList>
                {RANGE_PRESETS.map((p) => (
                  <TabsTrigger key={p.id} value={p.id}>
                    {p.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        }
      />

      <SectionCard
        flush
        eyebrow="Ranking"
        title="Top performers"
        description={`Sorted by ${SORT_TABS.find((t) => t.id === sort)?.label.toLowerCase() ?? "accuracy"}.`}
        actions={
          <div className="flex items-center gap-3">
            <Tabs
              value={sort}
              onValueChange={(v) => setSort(v as LeaderboardSortKey)}
            >
              <TabsList>
                {SORT_TABS.map((t) => (
                  <TabsTrigger key={t.id} value={t.id}>
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Input
              type="number"
              min={3}
              max={100}
              value={limit}
              onChange={(e) =>
                setLimit(Math.max(3, Math.min(100, Number(e.target.value) || 10)))
              }
              aria-label="Top N"
              className="h-8 w-16 text-sm"
            />
          </div>
        }
      >
        <DataTable<LeaderboardRow, unknown>
          columns={columns}
          data={rows}
          isLoading={query.isLoading}
          emptyState={
            <EmptyState
              illustration={<NoResults size={140} />}
              eyebrow={<Award className="size-4" />}
              title="Empty leaderboard"
              description="Once sessions complete in this date range, ranks land here. Try widening the window."
            />
          }
        />
      </SectionCard>
    </div>
  );
}
