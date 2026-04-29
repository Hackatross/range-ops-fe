"use client";

import { useMemo } from "react";
import { CompassRose, TargetRings } from "@/components/illustrations";
import type { Shot, Target } from "@/lib/types/domain";
import { cn } from "@/lib/utils";

interface Props {
  target: Target;
  shots: Shot[];
  /** Shot ID to flash gold for ~600ms (typically the last bullseye). */
  flashShotId?: string | null;
  className?: string;
  size?: number;
}

/**
 * Layered live target — TargetRings (scaled rings) + CompassRose overlay
 * (decorative bezel) + shot pins at real `(x_cm, y_cm)` coordinates.
 *
 * The TargetRings + shots share the cm-based viewBox; the CompassRose
 * lives in its own 200×200 viewBox so we wrap each layer with `inset-0`
 * absolute positioning and let CSS scale them independently.
 */
export function LiveTarget({
  target,
  shots,
  flashShotId,
  size = 360,
  className,
}: Props) {
  const validShots = useMemo(
    () =>
      shots.filter(
        (s) =>
          typeof s.hit?.coordinates?.x_cm === "number" &&
          typeof s.hit?.coordinates?.y_cm === "number",
      ),
    [shots],
  );

  return (
    <div
      className={cn(
        "relative isolate aspect-square w-full overflow-hidden rounded-md border border-border/60 bg-card/40 backdrop-blur-sm",
        className,
      )}
      style={{ maxWidth: size }}
    >
      {/* Compass rose — decorative bezel, lowest z-index. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-2 text-primary/45"
      >
        <CompassRose className="h-full w-full" size={undefined} />
      </div>

      {/* Target rings + shot pins — tinted `text-primary/60` so the rings
          stay visible while individual shots use their own paint. */}
      <div className="absolute inset-6 text-primary/60">
        <TargetWithShots
          target={target}
          shots={validShots}
          flashShotId={flashShotId}
        />
      </div>

      {/* Live scan-line vibe — only when there are recent shots. */}
      {validShots.length > 0 ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, var(--color-pulse) 50%, transparent 100%)",
            animation: "var(--animate-scan-line)",
          }}
        />
      ) : null}
    </div>
  );
}

/**
 * Reuses the existing TargetRings illustration but layers shot pins on top
 * inside the same SVG so coordinates stay in cm-space.
 */
function TargetWithShots({
  target,
  shots,
  flashShotId,
}: {
  target: Target;
  shots: Shot[];
  flashShotId?: string | null;
}) {
  return (
    <TargetRings
      rings={target.rings}
      shots={shots.map((s) => ({
        x_cm: s.hit.coordinates.x_cm,
        y_cm: s.hit.coordinates.y_cm,
        is_bullseye: !!s.hit.is_bullseye,
      }))}
      className={cn(
        "h-full w-full",
        // Subtle ring-flash on the freshest shot (handled at the dot level
        // would be cleaner — for now the parent handles the gold blip via
        // `--animate-flash-bull`).
      )}
      style={
        flashShotId
          ? {
              animation: "var(--animate-flash-bull)",
            }
          : undefined
      }
    />
  );
}
