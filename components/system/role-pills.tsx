import { parseRoles } from "@/lib/auth/roles";
import { StatusPill } from "./status-pill";
import type { PillTone } from "@/lib/domain/status";

/**
 * Renders one chip per role on a user's `role` value. Tolerates
 * comma-separated strings ("admin,trainer"), arrays, and missing values.
 */

const ROLE_TONES: Record<string, PillTone> = {
  admin: "danger",
  trainer: "success",
  viewer: "info",
  guest: "neutral",
};

export interface RolePillsProps {
  role: unknown;
  size?: "sm" | "md";
  showDot?: boolean;
}

export function RolePills({ role, size = "sm", showDot = false }: RolePillsProps) {
  const roles = parseRoles(role);
  const list = roles.length ? roles : ["guest"];
  return (
    <div className="flex items-center gap-1.5">
      {list.map((r) => (
        <StatusPill
          key={r}
          tone={ROLE_TONES[r] ?? "neutral"}
          size={size}
          showDot={showDot}
        >
          {r}
        </StatusPill>
      ))}
    </div>
  );
}
