"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Cpu, MoreHorizontal, Pencil, Radio, Trash2, Video } from "lucide-react";
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
import { deviceStatusSpec } from "@/lib/domain/status";
import { formatTime } from "@/lib/format";
import type { HardwareDevice } from "@/lib/types/domain";
import { DeviceHeartbeatButton } from "./device-heartbeat-button";

export function deviceColumns(
  handlers: ColumnHandlers<HardwareDevice>,
): ColumnDef<HardwareDevice, unknown>[] {
  return [
    {
      id: "icon",
      header: "",
      cell: ({ row }) => (
        <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
          {row.original.type === "camera" ? (
            <Video size={14} />
          ) : (
            <Cpu size={14} />
          )}
        </span>
      ),
    },
    {
      accessorKey: "device_id",
      header: "Device",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <MonoCode size="sm" tone="primary">
            {row.original.device_id}
          </MonoCode>
          {row.original.location ? (
            <span className="text-xs text-muted-foreground">
              {row.original.location}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span className="text-sm capitalize">{row.original.type}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusPill spec={deviceStatusSpec(row.original.status)} />
      ),
    },
    {
      accessorKey: "ip_address",
      header: "Network",
      cell: ({ row }) => {
        const { ip_address, port, protocol } = row.original;
        if (!ip_address && !port) return <span className="text-muted-foreground">—</span>;
        return (
          <MonoCode size="xs" tone="muted">
            {[ip_address, port].filter(Boolean).join(":") || "—"}
            {protocol ? ` · ${protocol}` : ""}
          </MonoCode>
        );
      },
    },
    {
      accessorKey: "last_heartbeat",
      header: "Last beat",
      cell: ({ row }) => (
        <MonoCode size="xs" tone="muted">
          {row.original.last_heartbeat
            ? formatTime(row.original.last_heartbeat)
            : "—"}
        </MonoCode>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const device = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <DeviceHeartbeatButton device={device} />
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
                <DropdownMenuItem onClick={() => handlers.onEdit(device)}>
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
                      title={`Delete ${device.device_id}?`}
                      description="The device will be removed from the registry; sessions referencing it stay intact."
                      confirmLabel="Delete"
                      onConfirm={async () => {
                        await handlers.onDelete?.(device);
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
