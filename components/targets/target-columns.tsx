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
import {
  ConfirmDialog,
  MonoCode,
  type ColumnHandlers,
} from "@/components/system";
import { TargetRings } from "@/components/illustrations";
import type { Target } from "@/lib/types/domain";

export function targetColumns(
  handlers: ColumnHandlers<Target>,
): ColumnDef<Target, unknown>[] {
  return [
    {
      id: "preview",
      header: "",
      cell: ({ row }) => (
        <div className="flex size-9 items-center justify-center text-primary/70">
          <TargetRings rings={row.original.rings} size={36} />
        </div>
      ),
    },
    {
      accessorKey: "target_code",
      header: "Code",
      cell: ({ row }) => (
        <MonoCode size="sm" tone="primary">
          {row.original.target_code}
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
      accessorKey: "distance_meters",
      header: "Distance",
      cell: ({ row }) => (
        <MonoCode size="sm" tone="muted">
          {row.original.distance_meters}m
        </MonoCode>
      ),
    },
    {
      id: "rings",
      header: "Rings",
      cell: ({ row }) => (
        <MonoCode size="sm" tone="muted">
          {row.original.rings.length}
        </MonoCode>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const target = row.original;
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
                <DropdownMenuItem onClick={() => handlers.onEdit(target)}>
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
                      title={`Delete ${target.name}?`}
                      description="The target will be moved to the soft-delete bin. Sessions that referenced it keep working."
                      confirmLabel="Delete"
                      onConfirm={async () => {
                        await handlers.onDelete?.(target);
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
