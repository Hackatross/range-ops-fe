type Props = React.SVGProps<SVGSVGElement> & { size?: number };

export function PatchEmblem({ size = 56, className, ...props }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <circle cx="32" cy="32" r="28" />
      <circle cx="32" cy="32" r="22" strokeOpacity="0.55" />
      <path d="M32 8 L36 24 L52 24 L40 34 L44 50 L32 41 L20 50 L24 34 L12 24 L28 24 Z" fill="currentColor" fillOpacity="0.12" />
      <path d="M32 18 L32 46" strokeOpacity="0.4" />
      <path d="M18 32 L46 32" strokeOpacity="0.4" />
    </svg>
  );
}
