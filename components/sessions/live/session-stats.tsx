"use client";

import { Activity, Crosshair, Ruler, Target as TargetIcon } from "lucide-react";
import { KpiGrid, StatCard } from "@/components/system";
import { formatAccuracy, formatCount, formatScore } from "@/lib/format";
import type { Shot } from "@/lib/types/domain";

interface Props {
  shots: Shot[];
}

/**
 * Live-derived KPIs for the session view. We compute from the cached shot
 * stream rather than re-querying the session detail — the WS feed pushes
 * shots into the cache, so these numbers stay in lock-step with the feed.
 */
export function SessionStats({ shots }: Props) {
  const total = shots.length;
  const hits = shots.filter((s) => s.hit?.is_hit).length;
  const bullseyes = shots.filter((s) => s.hit?.is_bullseye).length;
  const score = shots.reduce((acc, s) => acc + (s.hit?.points ?? 0), 0);
  const accuracy = total === 0 ? null : hits / total;

  // Grouping = max pairwise distance between any two non-miss shots.
  // For a small number of shots this is fine to compute on every render.
  const grouping = computeGrouping(shots);

  return (
    <KpiGrid cols={4}>
      <StatCard
        icon={<Activity size={16} />}
        label="Shots"
        value={formatCount(total)}
        hint={total === 0 ? "Awaiting first shot" : undefined}
      />
      <StatCard
        icon={<Crosshair size={16} />}
        label="Score"
        value={formatScore(score)}
        tone={score > 0 ? "accent" : "default"}
      />
      <StatCard
        icon={<TargetIcon size={16} />}
        label="Accuracy"
        value={formatAccuracy(accuracy ?? undefined)}
      />
      <StatCard
        icon={<Ruler size={16} />}
        label="Grouping"
        value={grouping == null ? "—" : `${grouping.toFixed(1)}cm`}
        hint={
          bullseyes > 0
            ? `${bullseyes} bullseye${bullseyes === 1 ? "" : "s"}`
            : undefined
        }
        tone={bullseyes > 0 ? "accent" : "default"}
      />
    </KpiGrid>
  );
}

function computeGrouping(shots: Shot[]): number | null {
  const points = shots
    .filter(
      (s) =>
        s.hit?.is_hit &&
        typeof s.hit?.coordinates?.x_cm === "number" &&
        typeof s.hit?.coordinates?.y_cm === "number",
    )
    .map((s) => ({
      x: s.hit.coordinates.x_cm,
      y: s.hit.coordinates.y_cm,
    }));
  if (points.length < 2) return null;
  let max = 0;
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const dx = points[i].x - points[j].x;
      const dy = points[i].y - points[j].y;
      const d = Math.hypot(dx, dy);
      if (d > max) max = d;
    }
  }
  return max;
}
