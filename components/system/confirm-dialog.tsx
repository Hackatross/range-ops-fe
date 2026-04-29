"use client";

import { useState, useTransition } from "react";
import { TriangleAlert, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

/**
 * Tactical confirmation dialog — wraps `AlertDialog` for destructive flows
 * (soft-delete, abort, etc.). Pass an async `onConfirm`; the dialog stays
 * open while the action is in flight and shows a spinner.
 *
 *   <ConfirmDialog
 *     trigger={<Button variant="ghost">Delete</Button>}
 *     title="Delete shooter?"
 *     description="They'll be moved to the soft-delete bin and can be restored within 30 days."
 *     confirmLabel="Delete"
 *     tone="danger"
 *     onConfirm={() => remove({ id: shooter._id })}
 *   />
 */

type Tone = "danger" | "warning" | "primary";

const ACTION_VARIANT: Record<Tone, string> = {
  danger:
    "bg-mission text-mission-foreground hover:bg-mission/90 focus-visible:ring-mission/40",
  warning:
    "bg-tactical text-tactical-foreground hover:bg-tactical/90 focus-visible:ring-tactical/40",
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary/40",
};

const ICON_TONE: Record<Tone, string> = {
  danger: "text-mission",
  warning: "text-tactical",
  primary: "text-primary",
};

export interface ConfirmDialogProps {
  trigger: React.ReactNode;
  /**
   * Base UI's AlertDialogTrigger defaults to native button semantics.
   * Set this to false when the trigger renders a non-button Base UI item
   * such as DropdownMenuItem.
   */
  triggerNativeButton?: boolean;
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: Tone;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  trigger,
  triggerNativeButton = true,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  onConfirm,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleConfirm(e: React.MouseEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await onConfirm();
        setOpen(false);
      } catch {
        // Error toast surfaces from the mutation hook; keep dialog open
        // so the user can retry.
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
      <AlertDialogTrigger
        nativeButton={triggerNativeButton}
        render={trigger as React.ReactElement}
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "mt-0.5 flex size-8 items-center justify-center rounded-md bg-card",
                ICON_TONE[tone],
              )}
            >
              <TriangleAlert size={16} />
            </span>
            <div className="flex flex-col gap-1.5">
              <AlertDialogTitle>{title}</AlertDialogTitle>
              {description ? (
                <AlertDialogDescription>{description}</AlertDialogDescription>
              ) : null}
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            className={ACTION_VARIANT[tone]}
            disabled={pending}
            onClick={handleConfirm}
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
