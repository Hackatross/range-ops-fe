"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Activity, CheckCircle2, Plus, XCircle } from "lucide-react";
import { DataTable } from "@classytic/fluid/client/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  EmptyState,
  KpiGrid,
  PageHeader,
  SectionCard,
  StatCard,
} from "@/components/system";
import { NoResults } from "@/components/illustrations/no-results";
import { useSessionsList } from "@/lib/api/sessions";
import { useUrlPagination } from "@/lib/hooks/use-url-pagination";
import type { ColumnHandlers } from "@/components/system";
import type { RangeSession } from "@/lib/types/domain";
import { sessionColumns } from "./session-columns";

const STATUS_TABS = [
  { id: "all", label: "All", icon: Activity },
  { id: "active", label: "Active", icon: Activity },
  { id: "completed", label: "Completed", icon: CheckCircle2 },
  { id: "aborted", label: "Aborted", icon: XCircle },
] as const;

type StatusTab = (typeof STATUS_TABS)[number]["id"];

export function SessionsClient() {
  const [tab, setTab] = useState<StatusTab>("all");
  const { apiParams, handlePageChange } = useUrlPagination({
    basePath: "/sessions",
    defaultLimit: 25,
    defaultSort: "-started_at",
  });

  const params = useMemo(() => {
    if (tab === "all") return apiParams;
    return { ...apiParams, status: tab };
  }, [tab, apiParams]);

  const result = useSessionsList(params);
  const items = (result.items ?? []) as RangeSession[];
  const pagination = result.pagination;

  // Lightweight handlers — sessions don't use the generic ResourceDashboard
  // (lifecycle actions are richer than create/edit/delete), but column
  // factory contract still expects this shape.
  const handlers: ColumnHandlers<RangeSession> = {
    onEdit: () => {},
    onDelete: null,
    permissions: {},
    extra: {},
  };
  const columns = useMemo(() => sessionColumns(handlers), []);

  // KPI stats — derived from current page (fast, indicative).
  const activeCount = items.filter((s) => s.status === "active").length;
  const completedCount = items.filter((s) => s.status === "completed").length;
  const abortedCount = items.filter((s) => s.status === "aborted").length;
  const totalShots = items.reduce((acc, s) => acc + (s.shots_count ?? 0), 0);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6 sm:p-10">
      <PageHeader
        eyebrow="RangeOps"
        title="Sessions"
        description="Live shot tracking and session control."
        actions={
          <Button
            nativeButton={false}
            render={
              <Link href="/sessions/new">
                <Plus className="size-4" />
                Start session
              </Link>
            }
          />
        }
      />

      <KpiGrid cols={4}>
        <StatCard
          icon={<Activity size={16} />}
          label="Active"
          value={activeCount}
          tone={activeCount > 0 ? "accent" : "default"}
          hint="On this page"
        />
        <StatCard
          icon={<CheckCircle2 size={16} />}
          label="Completed"
          value={completedCount}
          hint="On this page"
        />
        <StatCard
          icon={<XCircle size={16} />}
          label="Aborted"
          value={abortedCount}
          tone={abortedCount > 0 ? "warning" : "default"}
          hint="On this page"
        />
        <StatCard
          icon={<Activity size={16} />}
          label="Shots tracked"
          value={totalShots}
          hint="Across visible sessions"
        />
      </KpiGrid>

      <SectionCard
        flush
        eyebrow="Live"
        title="Sessions"
        actions={
          <Tabs value={tab} onValueChange={(v) => setTab(v as StatusTab)}>
            <TabsList>
              {STATUS_TABS.map(({ id, label }) => (
                <TabsTrigger key={id} value={id}>
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        }
      >
        <DataTable<RangeSession, unknown>
          columns={columns}
          data={items}
          isLoading={result.isLoading}
          pagination={
            pagination
              ? {
                  total: pagination.total ?? 0,
                  limit: pagination.limit ?? 25,
                  page: pagination.page ?? 1,
                  pages: pagination.pages ?? 1,
                  hasNext: pagination.hasNext ?? false,
                  hasPrev: pagination.hasPrev ?? false,
                  onPageChange: handlePageChange,
                }
              : undefined
          }
          emptyState={
            <EmptyState
              illustration={<NoResults size={140} />}
              title={
                tab === "all"
                  ? "No sessions yet"
                  : `No ${tab} sessions`
              }
              description={
                tab === "all"
                  ? "Start your first session — pick a shooter, weapon, and target to begin."
                  : "Nothing here right now. Try a different filter or start a new session."
              }
              action={
                <Button
                  nativeButton={false}
                  render={<Link href="/sessions/new">Start session</Link>}
                />
              }
            />
          }
        />
      </SectionCard>
    </div>
  );
}
