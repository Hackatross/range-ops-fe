"use client";

import Link from "next/link";
import { Cpu, Crosshair, Target, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { MonoCode } from "@/components/system";

interface Step {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  done: boolean;
}

interface Props {
  hasShooters: boolean;
  hasWeapons: boolean;
  hasTargets: boolean;
  hasDevices: boolean;
  className?: string;
}

/**
 * Onboarding ladder for an empty range.
 *
 * Surfaces the four reference-data prerequisites a trainer needs before
 * starting their first session, in dependency order. Each row is a real
 * deep-link, so an admin can step through left-to-right without losing
 * context. Hidden once the range is fully provisioned — the dashboard
 * renders its live overview instead.
 */
export function SetupChecklist({
  hasShooters,
  hasWeapons,
  hasTargets,
  hasDevices,
  className,
}: Props) {
  const steps: Step[] = [
    {
      href: "/shooters",
      label: "Add shooters",
      description: "Trainees and personnel firing on the range.",
      icon: <Users size={16} />,
      done: hasShooters,
    },
    {
      href: "/weapons",
      label: "Register weapons",
      description: "Rifles, pistols, SMGs, LMGs in the armoury.",
      icon: <Crosshair size={16} />,
      done: hasWeapons,
    },
    {
      href: "/targets",
      label: "Define targets",
      description: "Ring scoring geometry per target type.",
      icon: <Target size={16} />,
      done: hasTargets,
    },
    {
      href: "/devices",
      label: "Connect hardware",
      description: "Lane cameras and laser sensors.",
      icon: <Cpu size={16} />,
      done: hasDevices,
    },
  ];

  const completed = steps.filter((s) => s.done).length;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <MonoCode size="xs" tone="muted">
          Setup · {completed}/{steps.length}
        </MonoCode>
        <div
          aria-hidden
          className="ml-3 flex-1 max-w-xs h-1 overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full bg-primary transition-[width]"
            style={{ width: `${(completed / steps.length) * 100}%` }}
          />
        </div>
      </div>
      <ol className="grid gap-2 sm:grid-cols-2">
        {steps.map((step) => (
          <li key={step.href}>
            <Link
              href={step.href}
              className={cn(
                "group flex items-start gap-3 rounded-lg border p-4 transition-colors",
                "min-h-[72px]",
                step.done
                  ? "border-hit/40 bg-hit/5 hover:border-hit/60"
                  : "border-dashed border-border/60 bg-card/40 hover:border-primary/40 hover:bg-primary/5",
              )}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-md",
                  step.done
                    ? "bg-hit/15 text-hit"
                    : "bg-primary/10 text-primary",
                )}
              >
                {step.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-medium">
                  {step.label}
                  {step.done ? (
                    <span className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-hit">
                      ✓ Ready
                    </span>
                  ) : null}
                </p>
                <p className="text-xs text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
