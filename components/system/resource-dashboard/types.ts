import type { ColumnDef } from "@tanstack/react-table";
import type { ComponentType, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/**
 * Handler bag passed to a resource's `columns` factory. The factory uses
 * these to render row-level edit / delete buttons that reach back into the
 * dashboard state (open the sheet, fire the delete).
 */
export interface ColumnHandlers<T> {
  onEdit: (item: T) => void;
  onDelete: ((item: T) => void) | null;
  permissions: Record<string, boolean>;
  extra: Record<string, unknown>;
}

export interface HeaderAction {
  icon?: LucideIcon;
  text: string;
  size?: "sm" | "default";
  onClick?: () => void;
  /** "create" wires onClick to open the sheet. */
  role?: "create";
  /** Show only when the user has at least one of these roles. */
  requiredRoles?: string[];
}

export interface PermissionRules {
  /** Roles that can delete. Defaults to `["admin"]`. */
  deleteRoles?: string[];
  /** Custom resolution — return arbitrary perm flags. Spread in *after*
   *  the default `canDelete` so a custom map can override. */
  resolve?: (roles: string[]) => Record<string, boolean>;
}

export interface SheetConfig<T> {
  component: ComponentType<{
    item: T | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }>;
  /** Override prop mapping if the sheet expects e.g. `shooter` instead of `item`. */
  getProps?: (
    item: T | null,
    open: boolean,
    onOpenChange: (open: boolean) => void,
  ) => Record<string, unknown>;
}

import type { CrudActions } from "@classytic/arc-next/hooks";

/**
 * Generic shape for any arc-next list hook return — items + pagination.
 * Loose typing matches the variety of hook signatures createCrudHooks emits.
 */
export interface ResourceListPagination {
  total?: number;
  limit?: number;
  page?: number;
  pages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface ResourceListResult<T> {
  items?: T[];
  docs?: T[];
  pagination?: ResourceListPagination | null;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  error?: unknown;
  refetch?: () => unknown;
}

/**
 * Loose call signature — arc-next's `useList` carries TanStack Query option
 * types we don't model here. `any` for the params is intentional at this
 * interop boundary; the surface we actually consume is `ResourceListResult`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ResourceListHook<T> = (...args: any[]) => ResourceListResult<T>;

export interface ResourceDashboardConfig<T> {
  // Identity
  entityName: string;
  basePath: string;

  // Header
  icon?: LucideIcon | null;
  title: string;
  description?: string;
  headerActions?: HeaderAction[];

  // Data
  useList: ResourceListHook<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useActions: () => CrudActions<T, any, any>;

  // Columns
  columns: (handlers: ColumnHandlers<T>) => ColumnDef<T, unknown>[];

  // Defaults
  defaultSort?: string;
  defaultLimit?: number;

  // Sheet (create + edit)
  sheet?: SheetConfig<T>;

  // Optional slots
  searchComponent?: ComponentType<Record<string, never>>;
  renderAboveTable?: ComponentType<{ items: T[]; isLoading: boolean }>;

  // Permissions + delete UX
  permissions?: PermissionRules;
  /** Pre-flight check. Return false silently or a string to show as tooltip. */
  canDelete?: (item: T) => boolean | string;
  deleteConfirm?: (item: T) => {
    title: ReactNode;
    description?: ReactNode;
    confirmLabel?: string;
  };

  // Lifecycle
  onAfterDelete?: (item: T) => void | Promise<void>;
  onBeforeEdit?: (item: T, permissions: Record<string, boolean>) => boolean;

  // Extra hooks (e.g. parent options) merged into ColumnHandlers.extra
  useExtraHooks?: () => Record<string, unknown>;

  // Layout
  tableHeight?: string;
  enableRowSelection?: boolean;
}
