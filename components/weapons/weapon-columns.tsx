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
  StatusPill,
  type ColumnHandlers,
} from "@/components/system";
import type { PillTone } from "@/lib/domain/status";
import type { Weapon } from "@/lib/types/domain";

const TYPE_TONE: Record<string, PillTone> = {
  rifle: "info",
  pistol: "accent",
  smg: "warning",
  lmg: "danger",
};

export function weaponColumns(
  handlers: ColumnHandlers<Weapon>,
): ColumnDef<Weapon, unknown>[] {
  return [
    {
      accessorKey: "weapon_code",
      header: "Code",
      cell: ({ row }) => (
        <MonoCode size="sm" tone="primary">
          {row.original.weapon_code}
        </MonoCode>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <StatusPill
          tone={TYPE_TONE[row.original.type] ?? "neutral"}
          showDot={false}
          size="sm"
        >
          {row.original.type}
        </StatusPill>
      ),
    },
    {
      accessorKey: "model",
      header: "Model",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.model}</span>
      ),
    },
    {
      accessorKey: "caliber",
      header: "Caliber",
      cell: ({ row }) => (
        <MonoCode size="sm" tone="muted">
          {row.original.caliber}
        </MonoCode>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const weapon = row.original;
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
                <DropdownMenuItem onClick={() => handlers.onEdit(weapon)}>
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
                      title={`Delete ${weapon.weapon_code}?`}
                      description="The weapon will be moved to the soft-delete bin."
                      confirmLabel="Delete"
                      onConfirm={async () => {
                        await handlers.onDelete?.(weapon);
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
