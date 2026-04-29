"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { useUrlPagination } from "@/lib/hooks/use-url-pagination";
import type {
  ColumnHandlers,
  ResourceDashboardConfig,
  HeaderAction,
} from "./types";

const DEFAULT_DELETE_ROLES = ["admin"];

function resolvePermissions<T>(
  rules: ResourceDashboardConfig<T>["permissions"],
  userRoles: string[],
): Record<string, boolean> & { canDelete: boolean } {
  const deleteRoles = rules?.deleteRoles ?? DEFAULT_DELETE_ROLES;
  const canDelete = deleteRoles.some((r) => userRoles.includes(r));
  const custom = rules?.resolve?.(userRoles) ?? {};
  return { canDelete, ...custom };
}

export interface UseResourceDashboardOptions {
  userRoles?: string[];
}

/**
 * Orchestrates list query + sheet + delete + URL pagination for a
 * resource dashboard. Mirrors the bigboss commerce pattern, slimmed
 * for our project (no branch context, our `ConfirmDialog` instead of
 * native confirm, sonner already wired through arc-next's `configureToast`).
 */
export function useResourceDashboard<
  T extends { _id?: string; id?: string; name?: string },
>(
  config: ResourceDashboardConfig<T>,
  opts: UseResourceDashboardOptions = {},
) {
  const userRoles = opts.userRoles ?? [];

  // 1. URL pagination
  const { currentPage, apiParams, handlePageChange } = useUrlPagination({
    basePath: config.basePath,
    defaultLimit: config.defaultLimit,
    defaultSort: config.defaultSort,
  });

  // 2. Data
  const list = config.useList(apiParams) as ReturnType<
    typeof config.useList
  >;
  const items = (list.items ?? list.docs ?? []) as T[];
  const isLoading = list.isLoading ?? false;
  const isFetching = list.isFetching ?? false;
  const isError = list.isError ?? false;
  const error = list.error;
  const crudActions = config.useActions();
  const extra = config.useExtraHooks?.() ?? {};

  // 3. Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<T | null>(null);
  const selectedIdRef = useRef<string | null>(null);

  // Keep `selected` in sync with fresh list data after a mutation.
  useEffect(() => {
    if (!selected || !items.length) return;
    const id = (selected as { _id?: string; id?: string })._id ?? (selected as { _id?: string; id?: string }).id;
    if (!id) return;
    selectedIdRef.current = id;
    const fresh = items.find(
      (item) => ((item as { _id?: string; id?: string })._id ?? (item as { _id?: string; id?: string }).id) === id,
    );
    if (fresh && fresh !== selected) setSelected(fresh);
  }, [items, selected]);

  const handleOpenChange = (next: boolean) => {
    setSheetOpen(next);
    if (!next) {
      setSelected(null);
      selectedIdRef.current = null;
    }
  };

  const openCreate = () => {
    setSelected(null);
    setSheetOpen(true);
  };

  // 4. Permissions
  const permissions = useMemo(
    () => resolvePermissions(config.permissions, userRoles),
    [config.permissions, userRoles],
  );

  // 5. Edit + delete handlers
  const handleEdit = (item: T) => {
    if (config.onBeforeEdit && !config.onBeforeEdit(item, permissions)) return;
    setSelected(item);
    setSheetOpen(true);
  };

  const handleDelete = permissions.canDelete
    ? async (item: T): Promise<boolean> => {
        if (config.canDelete) {
          const result = config.canDelete(item);
          if (result === false) return false;
          if (typeof result === "string") {
            toast.error(result);
            return false;
          }
        }
        const id =
          (item as { _id?: string; id?: string })._id ??
          (item as { _id?: string; id?: string }).id;
        if (!id) return false;
        await crudActions.remove({ id });
        await config.onAfterDelete?.(item);
        return true;
      }
    : null;

  // 6. Columns
  const columnHandlers: ColumnHandlers<T> = {
    onEdit: handleEdit,
    onDelete: handleDelete,
    permissions,
    extra,
  };
  const columns: ColumnDef<T, unknown>[] = config.columns(columnHandlers);

  // 7. Pagination shape for fluid's DataTable
  const pagination = {
    total: list.pagination?.total ?? items.length,
    limit: list.pagination?.limit ?? config.defaultLimit ?? 25,
    page: list.pagination?.page ?? currentPage,
    pages: list.pagination?.pages ?? 1,
    hasNext: list.pagination?.hasNext ?? false,
    hasPrev: list.pagination?.hasPrev ?? false,
    onPageChange: handlePageChange,
  };

  // 8. Header actions — filter by role + wire `role: "create"`.
  const headerActions: HeaderAction[] = (config.headerActions ?? [])
    .filter(
      (a) =>
        !a.requiredRoles ||
        a.requiredRoles.some((r) => userRoles.includes(r)),
    )
    .map((a) => ({
      ...a,
      onClick: a.role === "create" ? openCreate : a.onClick,
    }));

  return {
    config,
    items,
    isLoading,
    isFetching,
    isError,
    error,
    pagination,
    columns,
    headerActions,
    sheetOpen,
    selected,
    handleOpenChange,
    openCreate,
    handleEdit,
    handleDelete,
    permissions,
    crudActions,
  };
}
