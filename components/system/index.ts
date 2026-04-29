/**
 * Tactical design system — composed primitives that build on shadcn.
 *
 * Import from here, not the individual files:
 *   import { PageHeader, StatusPill, StatCard, KpiGrid } from "@/components/system";
 */

export { PageHeader, type PageHeaderProps } from "./page-header";
export { StatusPill, type StatusPillProps } from "./status-pill";
export { StatCard, type StatCardProps } from "./stat-card";
export { KpiGrid, type KpiGridProps } from "./kpi-grid";
export { MonoCode, type MonoCodeProps } from "./mono-code";
export { SectionCard, type SectionCardProps } from "./section-card";
export { EmptyState, type EmptyStateProps } from "./empty-state";
export { RolePills, type RolePillsProps } from "./role-pills";
export { ConfirmDialog, type ConfirmDialogProps } from "./confirm-dialog";
export {
  ResourceDashboard,
  type ResourceConfig,
  type ColumnHandlers,
  type SheetConfig,
  type HeaderAction,
  type ResourceDashboardBodyArgs,
} from "./resource-dashboard";
