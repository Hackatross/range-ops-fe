import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

/**
 * Responsive grid wrapper for `<StatCard>` rows.
 *
 *   <KpiGrid cols={4}>
 *     <StatCard ... />
 *     <StatCard ... />
 *   </KpiGrid>
 */

const gridVariants = cva("grid gap-3", {
  variants: {
    cols: {
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
      5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
      6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
    },
  },
  defaultVariants: { cols: 4 },
});

export interface KpiGridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {}

export function KpiGrid({ cols, className, ...props }: KpiGridProps) {
  return <div className={cn(gridVariants({ cols }), className)} {...props} />;
}
