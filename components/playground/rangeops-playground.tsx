"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Cable,
  Camera,
  CheckCircle2,
  Cpu,
  Crosshair,
  RadioTower,
  RotateCcw,
  Send,
  Target as TargetIcon,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  KpiGrid,
  MonoCode,
  PageHeader,
  SectionCard,
  StatCard,
  StatusPill,
} from "@/components/system";
import { TargetRings } from "@/components/illustrations";
import { useShootersList } from "@/lib/api/shooters";
import { useWeaponsList } from "@/lib/api/weapons";
import { useTargetsList } from "@/lib/api/targets";
import { useDevicesList } from "@/lib/api/devices";
import { cn } from "@/lib/utils";
import { formatAccuracy, formatCount, formatDeviation, formatScore } from "@/lib/format";
import type {
  HardwareDevice,
  Shooter,
  Target,
  TargetRing,
  Weapon,
} from "@/lib/types/domain";

type MockShot = {
  id: string;
  shot_number: number;
  x_cm: number;
  y_cm: number;
  deviation_cm: number;
  ring_hit: number | null;
  points: number;
  is_hit: boolean;
  is_bullseye: boolean;
  device_id: string;
  sent_at: string;
};

type FlowState = "idle" | "connected" | "streaming";

export function RangeOpsPlayground() {
  const shootersQuery = useShootersList({ limit: 50, sort: "name" });
  const weaponsQuery = useWeaponsList({ limit: 50, sort: "weapon_code" });
  const targetsQuery = useTargetsList({ limit: 50, sort: "target_code" });
  const devicesQuery = useDevicesList({ limit: 50, sort: "device_id" });

  const shooters = (shootersQuery.items ?? []) as Shooter[];
  const weapons = (weaponsQuery.items ?? []) as Weapon[];
  const targets = (targetsQuery.items ?? []) as Target[];
  const devices = (devicesQuery.items ?? []) as HardwareDevice[];

  const [selectedShooterId, setSelectedShooterId] = useState("");
  const [selectedWeaponId, setSelectedWeaponId] = useState("");
  const [selectedTargetId, setSelectedTargetId] = useState("");
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [flowState, setFlowState] = useState<FlowState>("idle");
  const [shots, setShots] = useState<MockShot[]>([]);

  const shooter = shooters.find((s) => s._id === selectedShooterId) ?? null;
  const weapon = weapons.find((w) => w._id === selectedWeaponId) ?? null;
  const target = targets.find((t) => t._id === selectedTargetId) ?? null;
  const device = devices.find((d) => d._id === selectedDeviceId) ?? null;
  const canConnect = !!shooter && !!weapon && !!target && !!device;

  const stats = useMemo(() => {
    const total = shots.length;
    const hits = shots.filter((s) => s.is_hit).length;
    const score = shots.reduce((sum, s) => sum + s.points, 0);
    const bullseyes = shots.filter((s) => s.is_bullseye).length;
    const avgDeviation = hits
      ? shots.filter((s) => s.is_hit).reduce((sum, s) => sum + s.deviation_cm, 0) / hits
      : 0;
    return {
      total,
      hits,
      accuracy: total ? (hits / total) * 100 : 0,
      score,
      bullseyes,
      avgDeviation,
    };
  }, [shots]);

  const payload = useMemo(
    () => ({
      device_id: device?.device_id ?? "LANE-01-LASER",
      session_id: "simulated-session-id",
      hit_x_cm: shots.at(-1)?.x_cm ?? 0,
      hit_y_cm: shots.at(-1)?.y_cm ?? 0,
      laser_data: {
        measured_distance_m: target?.distance_meters ?? 100,
        sensor_id: device?.device_id ?? "SIM-SENSOR",
      },
      raw: {
        source: "RangeOps playground",
        mode: "local simulation only",
      },
    }),
    [device, shots, target],
  );

  function connect() {
    if (!canConnect) return;
    setFlowState("connected");
    setShots([]);
  }

  function simulateShot() {
    if (!target || !device) return;
    const shot = makeMockShot({
      target,
      deviceId: device.device_id,
      shotNumber: shots.length + 1,
    });
    setShots((prev) => [...prev, shot]);
    setFlowState("streaming");
  }

  function reset() {
    setFlowState("idle");
    setShots([]);
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-10">
      <PageHeader
        eyebrow="RangeOps playground"
        title="Hardware flow simulator"
        description="Select existing range data, connect a mock lane device, and watch simulated hardware shots move through the system. No backend data is created."
        badge={<StatusPill tone="warning" size="sm">simulation</StatusPill>}
        actions={
          <Button variant="outline" onClick={reset} disabled={shots.length === 0 && flowState === "idle"}>
            <RotateCcw className="size-4" />
            Reset
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <SectionCard
          eyebrow="Step 1"
          title="Connect existing data"
          description="Use real records from the app to show how a lane gateway would be configured."
        >
          <div className="grid gap-4">
            <EntitySelect
              label="Shooter"
              icon={<Users size={14} />}
              value={selectedShooterId}
              onValueChange={setSelectedShooterId}
              placeholder="Select shooter"
              items={shooters.map((s) => ({ value: s._id, label: s.name, meta: s.shooter_id }))}
              isLoading={shootersQuery.isLoading}
            />
            <EntitySelect
              label="Weapon"
              icon={<Crosshair size={14} />}
              value={selectedWeaponId}
              onValueChange={setSelectedWeaponId}
              placeholder="Select weapon"
              items={weapons.map((w) => ({ value: w._id, label: w.weapon_code, meta: [w.type, w.model].filter(Boolean).join(" · ") }))}
              isLoading={weaponsQuery.isLoading}
            />
            <EntitySelect
              label="Target"
              icon={<TargetIcon size={14} />}
              value={selectedTargetId}
              onValueChange={setSelectedTargetId}
              placeholder="Select target"
              items={targets.map((t) => ({ value: t._id, label: t.name, meta: `${t.distance_meters}m · ${t.target_code}` }))}
              isLoading={targetsQuery.isLoading}
            />
            <EntitySelect
              label="Range device"
              icon={<Cpu size={14} />}
              value={selectedDeviceId}
              onValueChange={setSelectedDeviceId}
              placeholder="Select device"
              items={devices.map((d) => ({ value: d._id, label: d.device_id, meta: `${d.type} · ${d.status}` }))}
              isLoading={devicesQuery.isLoading}
            />

            <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
              <div className="mb-3 flex items-center gap-2">
                <Cable className="size-4 text-primary" />
                <MonoCode size="xs" tone="muted">Gateway config</MonoCode>
              </div>
              <pre className="overflow-x-auto rounded-md bg-background/70 p-3 text-xs leading-relaxed text-muted-foreground">
{JSON.stringify({
  server_url: "http://rangeops-server:8040",
  endpoint: "/hardware/ingest",
  device_id: device?.device_id ?? "select-device",
  active_session_id: canConnect ? "created-by-trainer" : "waiting-for-selection",
}, null, 2)}
              </pre>
            </div>

            <Button onClick={connect} disabled={!canConnect} className="w-full">
              <RadioTower className="size-4" />
              Connect mock lane
            </Button>
          </div>
        </SectionCard>

        <div className="grid gap-4">
          <FlowDiagram state={flowState} />

          <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
            <SectionCard
              eyebrow="Step 2"
              title="Mock hardware stream"
              description="Each shot creates the same coordinate shape a laser sensor or CV gateway would send."
              actions={
                <Button onClick={simulateShot} disabled={flowState === "idle" || !target || !device}>
                  <Zap className="size-4" />
                  Generate shot
                </Button>
              }
            >
              <KpiGrid cols={4}>
                <StatCard icon={<Activity size={16} />} label="Shots" value={formatCount(stats.total)} />
                <StatCard icon={<CheckCircle2 size={16} />} label="Accuracy" value={formatAccuracy(stats.accuracy)} tone={stats.total ? "accent" : "default"} />
                <StatCard icon={<TargetIcon size={16} />} label="Score" value={formatScore(stats.score)} />
                <StatCard icon={<Crosshair size={16} />} label="Avg dev" value={formatDeviation(stats.avgDeviation)} />
              </KpiGrid>

              <div className="mt-5 grid gap-4 md:grid-cols-[minmax(220px,360px)_1fr]">
                <div className="flex items-center justify-center rounded-lg border border-border/60 bg-card/40 p-4">
                  {target ? (
                    <TargetRings
                      rings={target.rings}
                      shots={shots.map((s) => ({
                        x_cm: s.x_cm,
                        y_cm: s.y_cm,
                        is_bullseye: s.is_bullseye,
                      }))}
                      className="h-full w-full max-w-[320px] text-primary/70"
                      size={320}
                    />
                  ) : (
                    <div className="flex aspect-square w-full max-w-[320px] items-center justify-center rounded-md border border-dashed border-border/60 text-center text-sm text-muted-foreground">
                      Select a target to preview rings
                    </div>
                  )}
                </div>

                <ShotLog shots={shots} />
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Step 3"
              title="Ingest payload"
              description="This is the JSON shape a real lane gateway posts to the backend."
            >
              <div className="mb-3 flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
                <Send className="size-4 text-primary" />
                <MonoCode size="xs">POST /hardware/ingest</MonoCode>
              </div>
              <pre className="max-h-[420px] overflow-auto rounded-lg bg-background/80 p-3 text-xs leading-relaxed text-muted-foreground ring-1 ring-border/60">
{JSON.stringify(payload, null, 2)}
              </pre>
              <p className="mt-3 text-xs text-muted-foreground">
                The real backend validates the active session, calculates ring points, stores the shot, and broadcasts it to the live session view.
              </p>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function EntitySelect({
  label,
  icon,
  value,
  onValueChange,
  placeholder,
  items,
  isLoading,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  items: Array<{ value: string; label: string; meta?: string }>;
  isLoading?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {icon}
        {label}
      </span>
      <Select
        value={value}
        onValueChange={(next) => onValueChange(next ?? "")}
        disabled={isLoading || items.length === 0}
      >
        <SelectTrigger className="h-10 w-full">
          <SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
        </SelectTrigger>
        <SelectContent align="start" className="min-w-72">
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium">{item.label}</span>
                {item.meta ? (
                  <span className="truncate text-xs text-muted-foreground">{item.meta}</span>
                ) : null}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

function FlowDiagram({ state }: { state: FlowState }) {
  const steps = [
    { id: "device", label: "Lane device", icon: <Camera size={18} />, active: state !== "idle" },
    { id: "gateway", label: "Gateway", icon: <RadioTower size={18} />, active: state !== "idle" },
    { id: "ingest", label: "Ingest API", icon: <Send size={18} />, active: state === "streaming" },
    { id: "dashboard", label: "Live console", icon: <Activity size={18} />, active: state === "streaming" },
  ];

  return (
    <SectionCard
      eyebrow="System map"
      title="How RangeOps receives a shot"
      description="A lane controller normalizes hardware data, posts it to the server, and the dashboard updates through WebSocket broadcasts."
    >
      <div className="grid gap-3 md:grid-cols-4">
        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            <div
              className={cn(
                "flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition-colors",
                step.active
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border/60 bg-card/40 text-muted-foreground",
              )}
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-background/70 ring-1 ring-border/60">
                {step.icon}
              </span>
              <span className="text-sm font-medium">{step.label}</span>
              <MonoCode size="xs" tone={step.active ? "primary" : "muted"}>
                {step.active ? "ready" : "waiting"}
              </MonoCode>
            </div>
            {index < steps.length - 1 ? (
              <div className="pointer-events-none absolute left-[calc(100%-0.25rem)] top-1/2 z-10 hidden h-px w-4 bg-border md:block" />
            ) : null}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function ShotLog({ shots }: { shots: MockShot[] }) {
  if (shots.length === 0) {
    return (
      <div className="flex min-h-[260px] flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-card/30 p-6 text-center">
        <Crosshair className="mb-2 size-6 text-primary/50" />
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
          No simulated shots
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Connect a lane and generate a shot to see the event stream.
        </p>
      </div>
    );
  }

  return (
    <ol className="max-h-[360px] space-y-2 overflow-auto pr-1">
      {shots.slice().reverse().map((shot) => (
        <li
          key={shot.id}
          className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border/50 bg-card/50 px-3 py-2"
        >
          <span
            className={cn(
              "flex size-8 items-center justify-center rounded-md",
              shot.is_bullseye
                ? "bg-bullseye/20 text-bullseye"
                : shot.is_hit
                  ? "bg-hit/15 text-hit"
                  : "bg-muted text-muted-foreground",
            )}
          >
            {shot.is_bullseye ? <TargetIcon size={14} /> : <Crosshair size={14} />}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              Shot #{String(shot.shot_number).padStart(2, "0")} · {shot.ring_hit ? `Ring ${shot.ring_hit}` : "Miss"}
            </p>
            <p className="truncate font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
              x {shot.x_cm.toFixed(1)}cm · y {shot.y_cm.toFixed(1)}cm · {shot.device_id}
            </p>
          </div>
          <MonoCode size="sm" tone={shot.is_bullseye ? "bullseye" : "muted"}>
            {shot.points} pts
          </MonoCode>
        </li>
      ))}
    </ol>
  );
}

function makeMockShot({
  target,
  deviceId,
  shotNumber,
}: {
  target: Target;
  deviceId: string;
  shotNumber: number;
}): MockShot {
  const outer = Math.max(...target.rings.map((r) => r.radius_cm), 30);
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.sqrt(Math.random()) * outer * 1.08;
  const x = roundCm(Math.cos(angle) * radius);
  const y = roundCm(Math.sin(angle) * radius);
  const hit = calculateHit({ x_cm: x, y_cm: y }, target.rings);

  return {
    id: `${shotNumber}-${crypto.randomUUID()}`,
    shot_number: shotNumber,
    x_cm: x,
    y_cm: y,
    deviation_cm: hit.deviation_cm,
    ring_hit: hit.ring_hit,
    points: hit.points,
    is_hit: hit.is_hit,
    is_bullseye: hit.is_bullseye,
    device_id: deviceId,
    sent_at: new Date().toISOString(),
  };
}

function calculateHit(
  coords: { x_cm: number; y_cm: number },
  rings: TargetRing[],
) {
  const deviation_cm = Math.sqrt(coords.x_cm * coords.x_cm + coords.y_cm * coords.y_cm);
  const matched = [...rings]
    .sort((a, b) => a.radius_cm - b.radius_cm)
    .find((ring) => ring.radius_cm >= deviation_cm);

  return {
    is_hit: !!matched,
    deviation_cm,
    ring_hit: matched?.ring ?? null,
    points: matched?.points ?? 0,
    is_bullseye: matched?.is_bullseye === true,
  };
}

function roundCm(value: number): number {
  return Math.round(value * 10) / 10;
}
