import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { MonoCode } from "./mono-code";

/**
 * A `<Card>` with a built-in header/eyebrow/title pattern. Replaces 90%
 * of "section with a title and a body" duplication on dashboards.
 *
 *   <SectionCard eyebrow="Live feed" title="Shots — KAR-2026-0021">
 *     <ShotFeed sessionId={...} />
 *   </SectionCard>
 */

export interface SectionCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** Drops the default body padding so children can manage their own gutter. */
  flush?: boolean;
}

export function SectionCard({
  eyebrow,
  title,
  description,
  actions,
  flush,
  className,
  children,
  ...props
}: SectionCardProps) {
  const hasHeader = !!(eyebrow || title || description || actions);
  return (
    <Card
      className={cn("border-border/60 bg-card/70 backdrop-blur-sm", className)}
      {...props}
    >
      {hasHeader ? (
        <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border/60 px-5 py-4">
          <div className="flex flex-col gap-0.5">
            {eyebrow ? (
              <MonoCode size="xs" tone="muted">
                {eyebrow}
              </MonoCode>
            ) : null}
            {title ? (
              <h2 className="font-display text-base font-semibold tracking-tight">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex items-center gap-2">{actions}</div>
          ) : null}
        </header>
      ) : null}
      <CardContent className={cn(flush ? "p-0" : "p-5")}>{children}</CardContent>
    </Card>
  );
}
