"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Crosshair as CrosshairIcon,
  Loader2,
  Target as TargetIcon,
  Users,
} from "lucide-react";
import { useShootersList } from "@/lib/api/shooters";
import { useWeaponsList } from "@/lib/api/weapons";
import { useTargetsList } from "@/lib/api/targets";
import { useStartSession } from "@/lib/api/sessions";
import { useAuthToken } from "@/lib/auth/use-auth-token";
import type { Shooter, Target, Weapon } from "@/lib/types/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  EmptyState,
  MonoCode,
  PageHeader,
  SectionCard,
  StatusPill,
} from "@/components/system";
import { TargetRings } from "@/components/illustrations";
import { NoResults } from "@/components/illustrations/no-results";

type StepId = "shooter" | "weapon" | "target" | "conditions";

const STEPS: { id: StepId; label: string }[] = [
  { id: "shooter", label: "Shooter" },
  { id: "weapon", label: "Weapon" },
  { id: "target", label: "Target" },
  { id: "conditions", label: "Conditions" },
];

interface SelectedState {
  shooter: Shooter | null;
  weapon: Weapon | null;
  target: Target | null;
  conditions: {
    weather: string;
    wind_kmh: string;
    visibility: string;
  };
  notes: string;
}

const initialState: SelectedState = {
  shooter: null,
  weapon: null,
  target: null,
  conditions: { weather: "", wind_kmh: "", visibility: "" },
  notes: "",
};

export function StartSessionWizard() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [state, setState] = useState<SelectedState>(initialState);
  const [submitting, startTransition] = useTransition();
  const startSession = useStartSession();

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;
  const canAdvance =
    (step.id === "shooter" && !!state.shooter) ||
    (step.id === "weapon" && !!state.weapon) ||
    (step.id === "target" && !!state.target) ||
    step.id === "conditions";

  function next() {
    if (!canAdvance) return;
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }
  function back() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  function submit() {
    const shooter = state.shooter;
    const weapon = state.weapon;
    const target = state.target;
    if (!shooter || !weapon || !target) return;
    startTransition(async () => {
      try {
        const conditions: Record<string, string | number> = {};
        if (state.conditions.weather) conditions.weather = state.conditions.weather;
        if (state.conditions.visibility)
          conditions.visibility = state.conditions.visibility;
        if (state.conditions.wind_kmh) {
          const n = Number(state.conditions.wind_kmh);
          if (!Number.isNaN(n)) conditions.wind_kmh = n;
        }

        const res = await startSession.mutateAsync({
          shooter_id: shooter._id,
          weapon_id: weapon._id,
          target_id: target._id,
          ...(Object.keys(conditions).length ? { conditions } : {}),
          ...(state.notes ? { notes: state.notes } : {}),
        });
        if (res?.data?._id) {
          router.push(`/sessions/${res.data._id}`);
        } else {
          router.push("/sessions");
        }
      } catch {
        // toast surfaces via mutation messages
      }
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6 sm:p-10">
      <PageHeader
        eyebrow="RangeOps"
        title="Start a new session"
        description="Pick a shooter, weapon, and target. Optional conditions help anchor the report."
      />

      <Stepper steps={STEPS} active={stepIndex} />

      <SectionCard
        eyebrow={`Step ${stepIndex + 1} of ${STEPS.length}`}
        title={step.label}
      >
        {step.id === "shooter" ? (
          <ShooterStep
            value={state.shooter}
            onChange={(s) => setState((prev) => ({ ...prev, shooter: s }))}
          />
        ) : null}
        {step.id === "weapon" ? (
          <WeaponStep
            value={state.weapon}
            onChange={(w) => setState((prev) => ({ ...prev, weapon: w }))}
          />
        ) : null}
        {step.id === "target" ? (
          <TargetStep
            value={state.target}
            onChange={(t) => setState((prev) => ({ ...prev, target: t }))}
          />
        ) : null}
        {step.id === "conditions" ? (
          <ConditionsStep
            value={state}
            onChange={(next) => setState((prev) => ({ ...prev, ...next }))}
          />
        ) : null}
      </SectionCard>

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={back}
          disabled={stepIndex === 0 || submitting}
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>

        {!isLast ? (
          <Button type="button" onClick={next} disabled={!canAdvance}>
            Next
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={submit}
            disabled={
              submitting ||
              !state.shooter ||
              !state.weapon ||
              !state.target
            }
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            Start session
          </Button>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Stepper                                                                   */
/* -------------------------------------------------------------------------- */

function Stepper({
  steps,
  active,
}: {
  steps: typeof STEPS;
  active: number;
}) {
  return (
    <ol className="flex flex-wrap items-center gap-2 text-sm">
      {steps.map((s, i) => (
        <li
          key={s.id}
          className={cn(
            "flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.2em] transition-colors",
            i === active &&
              "border-primary/60 bg-primary/10 text-primary",
            i < active &&
              "border-hit/40 bg-hit/10 text-hit",
            i > active &&
              "border-border/60 bg-card/40 text-muted-foreground",
          )}
        >
          <span
            className={cn(
              "flex size-5 items-center justify-center rounded-full border text-[0.6rem]",
              i === active && "border-primary text-primary",
              i < active && "border-hit text-hit",
              i > active && "border-border text-muted-foreground",
            )}
          >
            {i + 1}
          </span>
          {s.label}
        </li>
      ))}
    </ol>
  );
}

/* -------------------------------------------------------------------------- */
/*  Steps                                                                     */
/* -------------------------------------------------------------------------- */

function ShooterStep({
  value,
  onChange,
}: {
  value: Shooter | null;
  onChange: (s: Shooter | null) => void;
}) {
  const [q, setQ] = useState("");
  const { isReady } = useAuthToken();
  const result = useShootersList(
    q.trim() ? { limit: 25, "name[contains]": q.trim() } : { limit: 25 },
    { enabled: isReady },
  );
  const items = (result.items ?? []) as Shooter[];

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Search by name…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search shooters"
      />
      <PickerGrid
        loading={!!result.isLoading}
        empty={items.length === 0}
        emptyHint="No shooters match — clear search or add one in /shooters."
      >
        {items.map((s) => (
          <PickerCard
            key={s._id}
            selected={value?._id === s._id}
            onClick={() => onChange(s)}
            icon={<Users className="size-4 text-primary" />}
            title={s.name}
            subtitle={
              <span className="flex items-center gap-1.5">
                <MonoCode size="xs" tone="primary">
                  {s.shooter_id}
                </MonoCode>
                {s.unit ? (
                  <span className="text-muted-foreground">· {s.unit}</span>
                ) : null}
              </span>
            }
          />
        ))}
      </PickerGrid>
    </div>
  );
}

function WeaponStep({
  value,
  onChange,
}: {
  value: Weapon | null;
  onChange: (w: Weapon | null) => void;
}) {
  const { isReady } = useAuthToken();
  const result = useWeaponsList({ limit: 50 }, { enabled: isReady });
  const items = (result.items ?? []) as Weapon[];

  return (
    <PickerGrid
      loading={!!result.isLoading}
      empty={items.length === 0}
      emptyHint="No weapons in armoury — add one in /weapons."
    >
      {items.map((w) => (
        <PickerCard
          key={w._id}
          selected={value?._id === w._id}
          onClick={() => onChange(w)}
          icon={<CrosshairIcon className="size-4 text-primary" />}
          title={`${w.model}`}
          subtitle={
            <span className="flex items-center gap-1.5">
              <MonoCode size="xs" tone="primary">
                {w.weapon_code}
              </MonoCode>
              <StatusPill tone="info" size="sm" showDot={false}>
                {w.type}
              </StatusPill>
              <span className="text-muted-foreground">{w.caliber}</span>
            </span>
          }
        />
      ))}
    </PickerGrid>
  );
}

function TargetStep({
  value,
  onChange,
}: {
  value: Target | null;
  onChange: (t: Target | null) => void;
}) {
  const { isReady } = useAuthToken();
  const result = useTargetsList({ limit: 50 }, { enabled: isReady });
  const items = (result.items ?? []) as Target[];

  return (
    <PickerGrid
      loading={!!result.isLoading}
      empty={items.length === 0}
      emptyHint="No targets defined — add one in /targets."
    >
      {items.map((t) => (
        <PickerCard
          key={t._id}
          selected={value?._id === t._id}
          onClick={() => onChange(t)}
          icon={<TargetIcon className="size-4 text-primary" />}
          title={t.name}
          subtitle={
            <span className="flex items-center gap-1.5">
              <MonoCode size="xs" tone="primary">
                {t.target_code}
              </MonoCode>
              <span className="text-muted-foreground">
                {t.distance_meters}m · {t.rings.length} rings
              </span>
            </span>
          }
          preview={
            <TargetRings
              rings={t.rings}
              size={56}
              className="text-primary/70"
            />
          }
        />
      ))}
    </PickerGrid>
  );
}

function ConditionsStep({
  value,
  onChange,
}: {
  value: SelectedState;
  onChange: (next: Partial<SelectedState>) => void;
}) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <LabelledField label="Weather" htmlFor="cond-weather">
          <Input
            id="cond-weather"
            placeholder="Clear, light overcast…"
            value={value.conditions.weather}
            onChange={(e) =>
              onChange({
                conditions: { ...value.conditions, weather: e.target.value },
              })
            }
          />
        </LabelledField>
        <LabelledField label="Wind (km/h)" htmlFor="cond-wind">
          <Input
            id="cond-wind"
            type="number"
            min={0}
            max={200}
            inputMode="decimal"
            placeholder="0"
            value={value.conditions.wind_kmh}
            onChange={(e) =>
              onChange({
                conditions: { ...value.conditions, wind_kmh: e.target.value },
              })
            }
          />
        </LabelledField>
        <LabelledField label="Visibility" htmlFor="cond-vis">
          <Input
            id="cond-vis"
            placeholder="Good, hazy…"
            value={value.conditions.visibility}
            onChange={(e) =>
              onChange({
                conditions: { ...value.conditions, visibility: e.target.value },
              })
            }
          />
        </LabelledField>
      </div>
      <LabelledField label="Notes" htmlFor="cond-notes">
        <Textarea
          id="cond-notes"
          rows={3}
          placeholder="Range officer remarks, pre-session checks…"
          value={value.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
        />
      </LabelledField>
      <div className="rounded-md border border-border/60 bg-card/40 px-4 py-3 text-xs text-muted-foreground">
        <span className="font-mono uppercase tracking-[0.25em] text-primary">
          Ready
        </span>{" "}
        — review your selections, then start the session.
      </div>
    </div>
  );
}

function LabelledField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Picker primitives                                                         */
/* -------------------------------------------------------------------------- */

function PickerGrid({
  children,
  loading,
  empty,
  emptyHint,
}: {
  children: React.ReactNode;
  loading: boolean;
  empty: boolean;
  emptyHint: string;
}) {
  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }
  if (empty) {
    return (
      <EmptyState
        illustration={<NoResults size={120} />}
        title="Nothing to pick"
        description={emptyHint}
      />
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
  );
}

function PickerCard({
  selected,
  onClick,
  icon,
  title,
  subtitle,
  preview,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  preview?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "group flex w-full items-start gap-3 rounded-md border bg-card/60 p-3 text-left transition-all hover:border-primary/50 hover:bg-card",
        selected
          ? "border-primary bg-primary/10 shadow-[0_0_0_1px_var(--primary)/60]"
          : "border-border/60",
      )}
    >
      <span className="flex size-9 items-center justify-center rounded-md bg-primary/10">
        {icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-sm font-medium">{title}</span>
        <span className="truncate text-xs">{subtitle}</span>
      </div>
      {preview ? <div className="shrink-0">{preview}</div> : null}
    </button>
  );
}
