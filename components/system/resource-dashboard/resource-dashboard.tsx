"use client";

import { useSession } from "next-auth/react";
import { ResourceDashboard as FluidResourceDashboard } from "@classytic/fluid/dashboard/resource-dashboard";
import type { HeaderAction as FluidHeaderAction } from "@classytic/fluid/dashboard";
import { parseRoles } from "@/lib/auth/roles";
import { NoResults } from "@/components/illustrations/no-results";
import {
  useResourceDashboard,
  type UseResourceDashboardOptions,
} from "./use-resource-dashboard";
import type {
  HeaderAction,
  ResourceDashboardConfig,
} from "./types";

export interface ResourceDashboardBodyArgs<T> {
  items: T[];
  isLoading: boolean;
  onEdit: (item: T) => void;
  onDelete: ((item: T) => Promise<boolean>) | null;
  permissions: Record<string, boolean>;
}

interface ResourceDashboardProps<T> {
  config: ResourceDashboardConfig<T>;
  /** Optional override; defaults to roles from the active NextAuth session. */
  userRoles?: string[];
  /**
   * Replaces the default DataTable body. When set, columns/sorting still
   * power the underlying state (sheet, delete confirm, etc.) but the visual
   * is your component. Edit/delete handlers are passed through so a card
   * grid (or any custom layout) can wire row actions exactly like a column.
   */
  body?: (args: ResourceDashboardBodyArgs<T>) => React.ReactNode;
}

function toFluidActions(actions: HeaderAction[]): FluidHeaderAction[] {
  return actions.map(({ role: _role, requiredRoles: _rr, ...rest }) => ({
    ...rest,
  }) as FluidHeaderAction);
}

/**
 * Tactical resource-list page in one config.
 *
 * Wraps fluid's `ResourceDashboard` with our session/role plumbing, the
 * tactical empty state, and a side-sheet form (passed via `config.sheet`).
 *
 *   <ResourceDashboard config={shootersConfig} />
 */
export function ResourceDashboard<
  T extends { _id?: string; id?: string; name?: string },
>({ config, userRoles: userRolesOverride, body }: ResourceDashboardProps<T>) {
  const { data: session } = useSession();
  const userRoles =
    userRolesOverride ?? parseRoles(session?.user?.role);
  const opts: UseResourceDashboardOptions = { userRoles };
  const state = useResourceDashboard<T>(config, opts);

  const SearchComponent = config.searchComponent;
  const StatsComponent = config.renderAboveTable;
  const SheetComponent = config.sheet?.component;

  const sheetProps = config.sheet?.getProps
    ? config.sheet.getProps(
        state.selected,
        state.sheetOpen,
        state.handleOpenChange,
      )
    : {
        item: state.selected,
        open: state.sheetOpen,
        onOpenChange: state.handleOpenChange,
      };

  const filters = SearchComponent ? (
    <div className="py-2">
      <SearchComponent />
    </div>
  ) : undefined;

  const aboveBody = StatsComponent ? (
    <StatsComponent items={state.items} isLoading={state.isLoading} />
  ) : undefined;

  return (
    <>
      <FluidResourceDashboard
        icon={config.icon ?? null}
        title={config.title}
        description={config.description}
        headerVariant="compact"
        actions={toFluidActions(state.headerActions)}
        columns={state.columns}
        data={state.items}
        isLoading={state.isLoading}
        isError={state.isError}
        error={
          state.error instanceof Error
            ? state.error.message
            : state.error
              ? String(state.error)
              : undefined
        }
        pagination={state.pagination}
        enableRowSelection={config.enableRowSelection}
        filters={filters}
        aboveBody={aboveBody}
        body={
          body
            ? body({
                items: state.items,
                isLoading: state.isLoading,
                onEdit: state.handleEdit,
                onDelete: state.handleDelete,
                permissions: state.permissions,
              })
            : undefined
        }
        emptyState={{
          icon: <NoResults />,
          title: `No ${config.title.toLowerCase()} yet`,
          description: `Use ${
            (config.headerActions ?? []).find((a) => a.role === "create")
              ?.text ?? "the action above"
          } to add the first one.`,
        }}
        dataTableClassName={
          config.tableHeight ?? "min-h-[60dvh] rounded-lg"
        }
      />
      {SheetComponent ? (
        <SheetComponent
          {...(sheetProps as {
            item: T | null;
            open: boolean;
            onOpenChange: (open: boolean) => void;
          })}
        />
      ) : null}
    </>
  );
}
