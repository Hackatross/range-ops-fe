import type { TargetRing } from "@/lib/types/domain";

interface Props extends Omit<React.SVGProps<SVGSVGElement>, "viewBox"> {
  rings: TargetRing[];
  size?: number;
  /** Optional shot overlays (cm coords from target centre). */
  shots?: Array<{ x_cm: number; y_cm: number; is_bullseye?: boolean }>;
}

/**
 * Renders an actual target from a `Target.rings[]` definition. Uses real
 * `radius_cm` values mapped to a 1:1 viewBox so shot coordinates can be
 * overlaid as native SVG circles.
 */
export function TargetRings({
  rings,
  size = 320,
  shots = [],
  className,
  ...rest
}: Props) {
  const sorted = [...rings].sort((a, b) => b.radius_cm - a.radius_cm);
  const outer = sorted[0]?.radius_cm ?? 30;
  const vb = outer * 2.2;
  const c = vb / 2;

  return (
    <svg
      viewBox={`0 0 ${vb} ${vb}`}
      width={size}
      height={size}
      fill="none"
      className={className}
      {...rest}
    >
      {sorted.map((r, i) => {
        const isBull = r.is_bullseye;
        return (
          <circle
            key={r.ring}
            cx={c}
            cy={c}
            r={r.radius_cm}
            stroke={isBull ? "var(--color-bullseye)" : "currentColor"}
            strokeOpacity={isBull ? 0.9 : 0.25 + (i / sorted.length) * 0.5}
            strokeWidth={isBull ? 0.7 : 0.4}
            fill={isBull ? "var(--color-bullseye)" : "none"}
            fillOpacity={isBull ? 0.08 : 0}
          />
        );
      })}
      {/* crosshair marks */}
      <path
        d={`M${c} 0 L${c} ${vb}`}
        stroke="currentColor"
        strokeOpacity={0.15}
        strokeWidth={0.3}
      />
      <path
        d={`M0 ${c} L${vb} ${c}`}
        stroke="currentColor"
        strokeOpacity={0.15}
        strokeWidth={0.3}
      />
      {/* shots */}
      {shots.map((s, i) => (
        <circle
          key={i}
          cx={c + s.x_cm}
          cy={c - s.y_cm}
          r={0.7}
          fill={s.is_bullseye ? "var(--color-bullseye)" : "var(--color-hit)"}
          stroke="var(--color-background)"
          strokeWidth={0.2}
        />
      ))}
    </svg>
  );
}
