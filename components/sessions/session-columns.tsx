"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { MonoCode, StatusPill, type ColumnHandlers } from "@/components/system";
import { sessionStatusSpec } from "@/lib/domain/status";
import { formatAccuracy, formatScore, formatTime } from "@/lib/format";
import type { RangeSession } from "@/lib/types/domain";
import { SessionRowActions } from "./session-row-actions";

export function sessionColumns(
  _handlers: ColumnHandlers<RangeSession>,
): ColumnDef<RangeSession, unknown>[] {
  return [
    {
      accessorKey: "session_code",
      header: "Code",
      cell: ({ row }) => (
        <Link
          href={`/sessions/${row.original._id}`}
          className="hover:underline"
        >
          <MonoCode size="sm" tone="primary">
            {row.original.session_code}
          </MonoCode>
        </Link>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusPill spec={sessionStatusSpec(row.original.status)} />
      ),
    },
    {
      accessorKey: "started_at",
      header: "Started",
      cell: ({ row }) => (
        <MonoCode size="sm" tone="muted">
          {formatTime(row.original.started_at)}
        </MonoCode>
      ),
    },
    {
      accessorKey: "shots_count",
      header: "Shots",
      cell: ({ row }) => (
        <MonoCode size="sm">{row.original.shots_count ?? "—"}</MonoCode>
      ),
    },
    {
      accessorKey: "score",
      header: "Score",
      cell: ({ row }) => (
        <MonoCode size="sm" weight="semibold">
          {formatScore(row.original.score)}
        </MonoCode>
      ),
    },
    {
      accessorKey: "accuracy",
      header: "Accuracy",
      cell: ({ row }) => (
        <MonoCode size="sm" tone="muted">
          {formatAccuracy(row.original.accuracy)}
        </MonoCode>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => <SessionRowActions session={row.original} />,
    },
  ];
}
