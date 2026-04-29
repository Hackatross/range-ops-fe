"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog, MonoCode } from "@/components/system";
import type { ColumnHandlers } from "@/components/system";
import type { Shooter } from "@/lib/types/domain";

export function shooterColumns(
  handlers: ColumnHandlers<Shooter>,
): ColumnDef<Shooter, unknown>[] {
  return [
    {
      accessorKey: "shooter_id",
      header: "ID",
      cell: ({ row }) => (
        <MonoCode size="sm" tone="primary">
          {row.original.shooter_id}
        </MonoCode>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "rank",
      header: "Rank",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.rank ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "unit",
      header: "Unit",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.unit ?? "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const shooter = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => handlers.onEdit(shooter)}>
                  <Pencil className="size-3.5" />
                  Edit
                </DropdownMenuItem>
                {handlers.onDelete ? (
                  <>
                    <DropdownMenuSeparator />
                    <ConfirmDialog
                      triggerNativeButton={false}
                      trigger={
                        <DropdownMenuItem
                          closeOnClick={false}
                          className="text-mission focus:text-mission"
                        >
                          <Trash2 className="size-3.5" />
                          Delete
                        </DropdownMenuItem>
                      }
                      tone="danger"
                      title={`Delete ${shooter.name}?`}
                      description="They'll be moved to the soft-delete bin and can be restored within 30 days."
                      confirmLabel="Delete"
                      onConfirm={async () => {
                        await handlers.onDelete?.(shooter);
                      }}
                    />
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
