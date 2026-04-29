/**
 * Status → UI variant maps.
 *
 * Every place that renders a session, device, or shot status pulls its pill
 * tone + label from here. When the backend adds a new status, you change
 * exactly one file.
 */

import type { SessionStatus, HardwareDevice } from "@/lib/types/domain";

export type PillTone =
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "neutral"
  | "accent";

export type PillBeat = "static" | "pulse" | "flash";

export interface PillSpec {
  tone: PillTone;
  beat: PillBeat;
  label: string;
}

export function sessionStatusSpec(status: SessionStatus | string | undefined): PillSpec {
  switch (status) {
    case "active":
      return { tone: "success", beat: "pulse", label: "Active" };
    case "completed":
      return { tone: "info", beat: "static", label: "Completed" };
    case "aborted":
      return { tone: "danger", beat: "static", label: "Aborted" };
    default:
      return { tone: "neutral", beat: "static", label: status ?? "Unknown" };
  }
}

export function deviceStatusSpec(
  status: HardwareDevice["status"] | string | undefined,
): PillSpec {
  switch (status) {
    case "online":
      return { tone: "success", beat: "pulse", label: "Online" };
    case "offline":
      return { tone: "neutral", beat: "static", label: "Offline" };
    case "error":
      return { tone: "danger", beat: "pulse", label: "Error" };
    default:
      return { tone: "neutral", beat: "static", label: status ?? "Unknown" };
  }
}

export interface ShotKindSpec extends PillSpec {
  symbol: string; // emoji-free, plain text marker for monospace rows
}

export function shotKindSpec(input: {
  is_bullseye?: boolean;
  is_hit?: boolean;
  ring?: number | null;
}): ShotKindSpec {
  if (input.is_bullseye) {
    return {
      tone: "accent",
      beat: "flash",
      label: "Bullseye",
      symbol: "BUL",
    };
  }
  if (input.is_hit) {
    return {
      tone: "success",
      beat: "static",
      label: "Hit",
      symbol: "HIT",
    };
  }
  return {
    tone: "neutral",
    beat: "static",
    label: "Miss",
    symbol: "—",
  };
}

/**
 * Leaderboard rank → medal pill.
 * Returns null for ranks > 3 so the caller can render a plain rank number.
 */
export function leaderboardRankSpec(rank: number): PillSpec | null {
  if (rank === 1) return { tone: "accent", beat: "static", label: "Gold" };
  if (rank === 2) return { tone: "info", beat: "static", label: "Silver" };
  if (rank === 3) return { tone: "warning", beat: "static", label: "Bronze" };
  return null;
}
