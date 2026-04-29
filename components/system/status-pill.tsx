import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { PillTone, PillBeat, PillSpec } from "@/lib/domain/status";

/**
 * Tactical status pill — single source for all status labels.
 *
 * Compose with the spec helpers in `lib/domain/status.ts`:
 *   <StatusPill spec={sessionStatusSpec(session.status)} />
 *   <StatusPill spec={deviceStatusSpec(device.status)} />
 */

const pillVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.2em] whitespace-nowrap",
  {
    variants: {
      tone: {
        success:
          "border-hit/40 bg-hit/10 text-hit",
        info:
          "border-primary/30 bg-primary/10 text-primary",
        warning:
          "border-tactical/40 bg-tactical/10 text-tactical",
        danger:
          "border-mission/45 bg-mission/15 text-mission",
        neutral:
          "border-border/60 bg-secondary/40 text-muted-foreground",
        accent:
          "border-bullseye/40 bg-bullseye/15 text-bullseye",
      } satisfies Record<PillTone, string>,
      size: {
        sm: "px-2 py-0.5 text-[0.6rem]",
        md: "px-2.5 py-0.5 text-[0.65rem]",
        lg: "px-3 py-1 text-xs",
      },
    },
    defaultVariants: { tone: "neutral", size: "md" },
  },
);

const dotVariants = cva("size-1.5 rounded-full", {
  variants: {
    tone: {
      success: "bg-hit",
      info: "bg-primary",
      warning: "bg-tactical",
      danger: "bg-mission",
      neutral: "bg-muted-foreground",
      accent: "bg-bullseye",
    } satisfies Record<PillTone, string>,
    beat: {
      static: "",
      pulse: "shadow-[0_0_0_0_currentColor] [animation:var(--animate-pulse-dot)]",
      flash:
        "shadow-[0_0_8px_2px_currentColor] [animation:var(--animate-flash-bull)]",
    } satisfies Record<PillBeat, string>,
  },
  defaultVariants: { tone: "neutral", beat: "static" },
});

export interface StatusPillProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children">,
    VariantProps<typeof pillVariants> {
  spec?: PillSpec;
  beat?: PillBeat;
  showDot?: boolean;
  children?: React.ReactNode;
}

export function StatusPill({
  spec,
  tone: toneProp,
  beat: beatProp,
  size,
  showDot = true,
  className,
  children,
  ...props
}: StatusPillProps) {
  const tone = (spec?.tone ?? toneProp ?? "neutral") as PillTone;
  const beat = (spec?.beat ?? beatProp ?? "static") as PillBeat;
  return (
    <span
      role="status"
      className={cn(pillVariants({ tone, size }), className)}
      {...props}
    >
      {showDot ? (
        <span aria-hidden className={dotVariants({ tone, beat })} />
      ) : null}
      {children ?? spec?.label}
    </span>
  );
}
