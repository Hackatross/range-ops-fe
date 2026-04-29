import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

/**
 * Monospace readout — for session_code, shooter_id, weapon_code, ring
 * numbers, deviation values. Keeps "instrument" things visually distinct
 * from prose.
 */
const monoVariants = cva("inline-flex items-baseline font-mono tracking-tight", {
  variants: {
    size: {
      xs: "text-[0.65rem] uppercase tracking-[0.25em]",
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
      xl: "text-lg",
      "2xl": "text-2xl",
    },
    tone: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
      bullseye: "text-bullseye",
      hit: "text-hit",
      mission: "text-mission",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
    },
  },
  defaultVariants: {
    size: "sm",
    tone: "default",
    weight: "medium",
  },
});

export interface MonoCodeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof monoVariants> {
  ref?: React.Ref<HTMLSpanElement>;
}

export function MonoCode({
  className,
  size,
  tone,
  weight,
  ref,
  ...props
}: MonoCodeProps) {
  return (
    <span
      ref={ref}
      className={cn(monoVariants({ size, tone, weight }), className)}
      {...props}
    />
  );
}
