type Props = React.SVGProps<SVGSVGElement> & { size?: number };

export function Crosshair({ size = 320, className, ...props }: Props) {
  return (
    <svg
      viewBox="0 0 320 320"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <circle cx="160" cy="160" r="148" strokeOpacity="0.3" />
      <circle cx="160" cy="160" r="112" strokeOpacity="0.45" />
      <circle cx="160" cy="160" r="76" strokeOpacity="0.6" />
      <circle cx="160" cy="160" r="40" strokeOpacity="0.85" />
      <circle cx="160" cy="160" r="6" fill="currentColor" fillOpacity="0.7" />
      <path d="M160 4 L160 56" strokeOpacity="0.7" />
      <path d="M160 264 L160 316" strokeOpacity="0.7" />
      <path d="M4 160 L56 160" strokeOpacity="0.7" />
      <path d="M264 160 L316 160" strokeOpacity="0.7" />
      <path d="M160 88 L160 116" strokeOpacity="0.45" />
      <path d="M160 204 L160 232" strokeOpacity="0.45" />
      <path d="M88 160 L116 160" strokeOpacity="0.45" />
      <path d="M204 160 L232 160" strokeOpacity="0.45" />
    </svg>
  );
}
