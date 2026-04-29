type Strength = 0 | 1 | 2 | 3 | 4;

interface Props extends Omit<React.SVGProps<SVGSVGElement>, "children"> {
  strength: Strength;
  size?: number;
}

const BARS: Array<{ x: number; y: number; h: number }> = [
  { x: 3, y: 18, h: 4 },
  { x: 8.5, y: 14, h: 8 },
  { x: 14, y: 10, h: 12 },
  { x: 19.5, y: 6, h: 16 },
];

/**
 * 4-bar ascending signal-strength indicator.
 *
 * Tone is owned by the parent (via `currentColor`) so consumers can swap
 * the colour for connection quality:
 *   - 0..1 → text-mission   (offline / poor)
 *   - 2..3 → text-tactical  (degraded)
 *   - 4    → text-hit       (live)
 *
 * Inactive bars render at 20 % alpha against the same `currentColor`
 * so the missing capacity stays visible without leaking another token.
 */
export function SignalStrength({
  strength,
  size = 16,
  className,
  ...props
}: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      role="img"
      aria-label={`Signal strength ${strength} of 4`}
      className={className}
      {...props}
    >
      {BARS.map((b, i) => {
        const active = i < strength;
        return (
          <rect
            key={i}
            x={b.x - 1.4}
            y={b.y}
            width={2.8}
            height={b.h}
            rx={0.6}
            opacity={active ? 1 : 0.2}
          />
        );
      })}
    </svg>
  );
}

export type { Strength as SignalStrengthValue };
