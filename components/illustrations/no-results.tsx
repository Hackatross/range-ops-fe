type Props = React.SVGProps<SVGSVGElement> & { size?: number };

/**
 * Tactical "no results" — a target with a single missed shot off the rings.
 * Pairs with `<EmptyState>` for empty list states.
 */
export function NoResults({ size = 160, className, ...props }: Props) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <circle cx="100" cy="100" r="80" strokeOpacity="0.3" />
      <circle cx="100" cy="100" r="56" strokeOpacity="0.45" />
      <circle cx="100" cy="100" r="32" strokeOpacity="0.65" />
      <circle cx="100" cy="100" r="10" strokeOpacity="0.85" />
      <path d="M100 8 L100 28" strokeOpacity="0.7" />
      <path d="M100 172 L100 192" strokeOpacity="0.7" />
      <path d="M8 100 L28 100" strokeOpacity="0.7" />
      <path d="M172 100 L192 100" strokeOpacity="0.7" />
      {/* the missed shot */}
      <circle cx="160" cy="38" r="3" fill="currentColor" fillOpacity="0.6" />
      <line x1="148" y1="50" x2="172" y2="26" strokeOpacity="0.4" />
    </svg>
  );
}
