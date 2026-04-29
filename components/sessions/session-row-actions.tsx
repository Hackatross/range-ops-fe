"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Eye,
  MoreHorizontal,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/system";
import { useEndSession, useAbortSession } from "@/lib/api/sessions";
import type { RangeSession } from "@/lib/types/domain";

export function SessionRowActions({ session }: { session: RangeSession }) {
  const endSession = useEndSession();
  const abortSession = useAbortSession();
  const isActive = session.status === "active";
  const isPending = endSession.isPending || abortSession.isPending;

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="size-8" disabled={isPending}>
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Actions</span>
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem render={<Link href={`/sessions/${session._id}`} />}>
            <Eye className="size-3.5" />
            Open
          </DropdownMenuItem>
          {isActive ? (
            <>
              <DropdownMenuSeparator />
              <ConfirmDialog
                triggerNativeButton={false}
                trigger={
                  <DropdownMenuItem
                    closeOnClick={false}
                    className="text-hit focus:text-hit"
                  >
                    <CheckCircle2 className="size-3.5" />
                    End session
                  </DropdownMenuItem>
                }
                tone="primary"
                title={`End session ${session.session_code}?`}
                description="The session will be locked and a final report generated."
                confirmLabel="End session"
                onConfirm={async () => {
                  await endSession.mutateAsync({ id: session._id });
                }}
              />
              <ConfirmDialog
                triggerNativeButton={false}
                trigger={
                  <DropdownMenuItem
                    closeOnClick={false}
                    className="text-mission focus:text-mission"
                  >
                    <XCircle className="size-3.5" />
                    Abort session
                  </DropdownMenuItem>
                }
                tone="danger"
                title={`Abort session ${session.session_code}?`}
                description="Aborted sessions stop accepting shots and are flagged for review."
                confirmLabel="Abort"
                onConfirm={async () => {
                  await abortSession.mutateAsync({ id: session._id });
                }}
              />
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
