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
  RolePills,
  type ColumnHandlers,
} from "@/components/system";
import { formatTime } from "@/lib/format";
import type { User } from "@/lib/types/domain";

export function userColumns(
  handlers: ColumnHandlers<User>,
): ColumnDef<User, unknown>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <MonoCode size="xs" tone="muted">
          {row.original.email}
        </MonoCode>
      ),
    },
    {
      accessorKey: "role",
      header: "Roles",
      cell: ({ row }) => <RolePills role={row.original.role} />,
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <MonoCode size="xs" tone="muted">
          {formatTime(row.original.createdAt)}
        </MonoCode>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const user = row.original;
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
                <DropdownMenuItem onClick={() => handlers.onEdit(user)}>
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
                      title={`Delete ${user.name}?`}
                      description="The user will be soft-deleted. They keep showing up in audit trails but can't sign in."
                      confirmLabel="Delete"
                      onConfirm={async () => {
                        await handlers.onDelete?.(user);
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
