import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Card, CardContent } from "@/components/ui/card";
import { MonoCode } from "./mono-code";

/**
 * KPI tile.
 *
 *   <StatCard
 *     icon={<Activity size={16} />}
 *     label="Active sessions"
 *     value={4}
 *     trend={{ delta: +2, hint: "since yesterday" }}
 *   />
 *
 * Pair with `KpiGrid` to lay out a row of them.
 */

const cardVariants = cva(
  "border-border/60 bg-card/70 transition-colors hover:border-primary/40",
  {
    variants: {
      tone: {
        default: "",
        accent: "border-primary/30 bg-primary/5",
        warning: "border-tactical/30 bg-tactical/5",
        danger: "border-mission/30 bg-mission/5",
      },
    },
    defaultVariants: { tone: "default" },
  },
);

const iconWrapVariants = cva(
  "flex size-9 shrink-0 items-center justify-center rounded-md",
  {
    variants: {
      tone: {
        default: "bg-primary/10 text-primary",
        accent: "bg-primary/15 text-primary",
        warning: "bg-tactical/15 text-tactical",
        danger: "bg-mission/15 text-mission",
      },
    },
    defaultVariants: { tone: "default" },
  },
);

export interface StatCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof cardVariants> {
  icon?: React.ReactNode;
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
  trend?: { delta: number; hint?: React.ReactNode };
}

export function StatCard({
  icon,
  label,
  value,
  hint,
  trend,
  tone,
  className,
  ...props
}: StatCardProps) {
  return (
    <Card className={cn(cardVariants({ tone }), className)} {...props}>
      <CardContent className="flex items-start gap-3 p-4">
        {icon ? <span className={iconWrapVariants({ tone })}>{icon}</span> : null}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <MonoCode size="xs" tone="muted">
            {label}
          </MonoCode>
          <div className="flex items-baseline gap-2">
            <MonoCode size="2xl" weight="semibold">
              {value}
            </MonoCode>
            {trend ? (
              <span
                className={cn(
                  "font-mono text-[0.7rem] uppercase tracking-[0.2em]",
                  trend.delta > 0 && "text-hit",
                  trend.delta < 0 && "text-mission",
                  trend.delta === 0 && "text-muted-foreground",
                )}
              >
                {trend.delta > 0 ? "▲" : trend.delta < 0 ? "▼" : "·"}{" "}
                {Math.abs(trend.delta)}
              </span>
            ) : null}
          </div>
          {hint || trend?.hint ? (
            <p className="text-xs text-muted-foreground">{hint ?? trend?.hint}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
