"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Award,
  Crosshair,
  Loader2,
  ShieldCheck,
  Target as TargetIcon,
} from "lucide-react";
import { DataTable } from "@classytic/fluid/client/table";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EmptyState,
  KpiGrid,
  MonoCode,
  PageHeader,
  SectionCard,
  StatCard,
  StatusPill,
} from "@/components/system";
import { NoResults } from "@/components/illustrations/no-results";
import { useShooterReport } from "@/lib/api/reports";
import { sessionStatusSpec } from "@/lib/domain/status";
import {
  formatAccuracy,
  formatCount,
  formatScore,
  formatTime,
} from "@/lib/format";
import type { ShooterReportSession } from "@/lib/types/domain";
import { PerformanceChart } from "./performance-chart";

interface Props {
  shooterIdOrCode: string;
}

export function ShooterReportClient({ shooterIdOrCode }: Props) {
  const query = useShooterReport(shooterIdOrCode);
  const report = query.data;

  if (query.isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6 sm:p-10">
        <Skeleton className="h-12 w-1/2" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-[280px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="mx-auto flex w-full max-w-3xl p-10">
        <EmptyState
          illustration={<NoResults size={140} />}
          title="Shooter not found"
          description="The shooter may have been removed or the ID is wrong."
          action={
            <Button
              nativeButton={false}
              render={
                <Link href="/reports/leaderboard">Back to leaderboard</Link>
              }
            />
          }
        />
      </div>
    );
  }

  const { shooter, aggregate, sessions } = report;

  const sessionColumns: ColumnDef<ShooterReportSession, unknown>[] = [
    {
      accessorKey: "session_code",
      header: "Code",
      cell: ({ row }) => (
        <Link
          href={`/sessions/${row.original._id}`}
          className="hover:text-primary"
        >
          <MonoCode size="sm" tone="primary">
            {row.original.session_code}
          </MonoCode>
        </Link>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusPill spec={sessionStatusSpec(row.original.status)} />
      ),
    },
    {
      accessorKey: "started_at",
      header: "Started",
      cell: ({ row }) => (
        <MonoCode size="xs" tone="muted">
          {formatTime(row.original.started_at)}
        </MonoCode>
      ),
    },
    {
      id: "shots",
      header: "Shots",
      cell: ({ row }) => (
        <MonoCode size="sm">{row.original.stats.total_shots ?? 0}</MonoCode>
      ),
    },
    {
      id: "score",
      header: "Score",
      cell: ({ row }) => (
        <MonoCode size="sm" weight="semibold">
          {formatScore(row.original.stats.total_score)}
        </MonoCode>
      ),
    },
    {
      id: "accuracy",
      header: "Accuracy",
      cell: ({ row }) => (
        <MonoCode size="sm" tone="primary">
          {formatAccuracy(row.original.stats.accuracy_percent)}
        </MonoCode>
      ),
    },
    {
      id: "bullseyes",
      header: "Bullseyes",
      cell: ({ row }) => (
        <MonoCode size="sm" tone="bullseye">
          {row.original.stats.bullseyes ?? 0}
        </MonoCode>
      ),
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6 sm:p-10">
      <PageHeader
        eyebrow={
          <Link
            href="/reports/leaderboard"
            className="inline-flex items-center gap-1 hover:text-primary"
          >
            <ArrowLeft size={12} />
            Leaderboard
          </Link>
        }
        title={
          <span className="flex items-center gap-3">
            <span>{shooter.name}</span>
            <MonoCode size="sm" tone="muted">
              {shooter.shooter_id}
            </MonoCode>
          </span>
        }
        description={
          <span className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {shooter.rank ? <span>{shooter.rank}</span> : null}
            {shooter.unit ? <span>· {shooter.unit}</span> : null}
          </span>
        }
        badge={
          <ShieldCheck className="size-5 text-primary" />
        }
      />

      <KpiGrid cols={4}>
        <StatCard
          icon={<TargetIcon size={16} />}
          label="Sessions"
          value={formatCount(aggregate.completed_sessions)}
          hint={`${aggregate.total_sessions} total`}
        />
        <StatCard
          icon={<Crosshair size={16} />}
          label="Accuracy"
          value={formatAccuracy(aggregate.accuracy_percent)}
          tone="accent"
          hint={`${formatCount(aggregate.total_hits)} hits / ${formatCount(aggregate.total_shots)} shots`}
        />
        <StatCard
          icon={<Award size={16} />}
          label="Total score"
          value={formatScore(aggregate.total_score)}
          hint={`${formatAccuracy(aggregate.score_percent)} of max possible`}
        />
        <StatCard
          icon={<TargetIcon size={16} />}
          label="Bullseyes"
          value={formatCount(aggregate.bullseyes)}
          tone={aggregate.bullseyes > 0 ? "accent" : "default"}
          hint={`Best session ${formatScore(aggregate.best_session_score)}`}
        />
      </KpiGrid>

      <SectionCard
        eyebrow="Trend"
        title="Performance over time"
        description="Accuracy and score per completed session, oldest to newest."
        actions={
          query.isFetching ? (
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          ) : null
        }
      >
        <PerformanceChart sessions={sessions} />
      </SectionCard>

      <SectionCard
        flush
        eyebrow="History"
        title="All sessions"
        description="Click a code to open the detail / replay view."
      >
        <DataTable<ShooterReportSession, unknown>
          columns={sessionColumns}
          data={sessions}
          isLoading={query.isLoading}
          emptyState={
            <EmptyState
              illustration={<NoResults size={140} />}
              title="No sessions yet"
              description="This shooter hasn't completed any sessions on the range."
            />
          }
        />
      </SectionCard>
    </div>
  );
}
