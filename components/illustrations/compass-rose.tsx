type Props = Omit<React.SVGProps<SVGSVGElement>, "children"> & {
  size?: number;
  /** Show the small "N" letter above the north tick. Default true. */
  showNorth?: boolean;
};

const CX = 100;
const CY = 100;
const R_OUTER = 92;
const R_INNER = 72;
const CARDINAL_LEN = 12;
const INTERMEDIATE_LEN = 6;

interface Tick {
  /** Angle in degrees, 0 = north, clockwise. */
  angle: number;
  length: number;
  cardinal: boolean;
}

/**
 * Cardinal ticks at N/E/S/W (every 90°) get the heavier treatment;
 * 8 intermediate ticks every 30° fill the gaps (2 per quadrant).
 */
const TICKS: Tick[] = [
  { angle: 0, length: CARDINAL_LEN, cardinal: true },
  { angle: 30, length: INTERMEDIATE_LEN, cardinal: false },
  { angle: 60, length: INTERMEDIATE_LEN, cardinal: false },
  { angle: 90, length: CARDINAL_LEN, cardinal: true },
  { angle: 120, length: INTERMEDIATE_LEN, cardinal: false },
  { angle: 150, length: INTERMEDIATE_LEN, cardinal: false },
  { angle: 180, length: CARDINAL_LEN, cardinal: true },
  { angle: 210, length: INTERMEDIATE_LEN, cardinal: false },
  { angle: 240, length: INTERMEDIATE_LEN, cardinal: false },
  { angle: 270, length: CARDINAL_LEN, cardinal: true },
  { angle: 300, length: INTERMEDIATE_LEN, cardinal: false },
  { angle: 330, length: INTERMEDIATE_LEN, cardinal: false },
];

function tickPoints(angle: number, len: number) {
  const θ = (angle * Math.PI) / 180;
  const sin = Math.sin(θ);
  const cos = Math.cos(θ);
  // Outer end sits flush with R_OUTER; inner end is `len` shorter so the tick
  // grows inward from the ring rather than outward (keeps the outline crisp).
  const x1 = CX + (R_OUTER - len) * sin;
  const y1 = CY - (R_OUTER - len) * cos;
  const x2 = CX + R_OUTER * sin;
  const y2 = CY - R_OUTER * cos;
  return { x1, y1, x2, y2 };
}

/**
 * Compass rose overlay for the live target view.
 *
 * Stroke-only, `currentColor`-driven so it inherits the surrounding
 * theme — drop it inside a wrapper coloured `text-primary/40` (or any
 * other muted token) and it composites cleanly on top of `<TargetRings>`.
 *
 *   <div className="relative text-primary/35">
 *     <TargetRings rings={target.rings} />
 *     <CompassRose className="absolute inset-0" />
 *   </div>
 *
 * No `aria-label` — purely decorative; the target diagram below carries
 * the meaning. Set `aria-hidden` on the wrapping element if needed.
 */
export function CompassRose({
  size = 200,
  showNorth = true,
  className,
  ...props
}: Props) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {/* Inner ghost ring — barely there, gives the rose visual weight. */}
      <circle
        cx={CX}
        cy={CY}
        r={R_INNER}
        strokeOpacity={0.25}
        strokeWidth={0.6}
      />

      {/* Outer ring */}
      <circle
        cx={CX}
        cy={CY}
        r={R_OUTER}
        strokeOpacity={0.4}
        strokeWidth={0.8}
      />

      {/* Tick marks — cardinals heavier, intermediates lighter */}
      {TICKS.map((tick) => {
        const { x1, y1, x2, y2 } = tickPoints(tick.angle, tick.length);
        return (
          <line
            key={tick.angle}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            strokeOpacity={tick.cardinal ? 0.7 : 0.35}
            strokeWidth={tick.cardinal ? 1.2 : 0.7}
            strokeLinecap="round"
          />
        );
      })}

      {showNorth ? (
        <text
          x={CX}
          y={CY - R_OUTER + 2}
          textAnchor="middle"
          fontFamily="var(--font-mono, ui-monospace, monospace)"
          fontSize={9}
          fontWeight={600}
          fill="currentColor"
          fillOpacity={0.7}
          stroke="none"
        >
          N
        </text>
      ) : null}
    </svg>
  );
}
