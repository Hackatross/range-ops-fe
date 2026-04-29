import { cn } from "@/lib/utils";
import { MonoCode } from "./mono-code";

/**
 * Polished empty state for empty lists, no-results, and "coming soon"
 * placeholders. Pair with a domain illustration:
 *
 *   <EmptyState
 *     illustration={<Crosshair size={140} className="text-primary/40" />}
 *     eyebrow="No active sessions"
 *     title="The range is quiet"
 *     description="Start a session to begin tracking shots."
 *     action={<Button>Start session</Button>}
 *   />
 */

export interface EmptyStateProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  illustration?: React.ReactNode;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  illustration,
  eyebrow,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-lg border border-dashed border-border/60 bg-card/40 px-6 py-12 text-center",
        className,
      )}
      {...props}
    >
      {illustration ? (
        <div className="text-primary/50">{illustration}</div>
      ) : null}
      {eyebrow ? (
        <MonoCode size="xs" tone="muted">
          {eyebrow}
        </MonoCode>
      ) : null}
      <h3 className="font-display text-lg font-semibold tracking-tight">
        {title}
      </h3>
      {description ? (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
