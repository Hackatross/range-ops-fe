/**
 * Tactical-readout formatters.
 *
 * Every number that lands in a `MonoCode` / `StatCard` / shot-feed row goes
 * through here so we keep one decision per concept (precision, fallbacks,
 * sign, units). Avoids drift between pages — fix the format once and every
 * page updates.
 */

const EM_DASH = "—";

export function formatScore(score: number | null | undefined): string {
  if (score == null) return EM_DASH;
  return Math.round(score).toString().padStart(3, "0");
}

export function formatAccuracy(accuracy: number | null | undefined): string {
  if (accuracy == null) return EM_DASH;
  // Backend stores as 0..1 OR 0..100 — normalize.
  const pct = accuracy <= 1 ? accuracy * 100 : accuracy;
  return `${pct.toFixed(1)}%`;
}

export function formatRing(ring: number | null | undefined): string {
  if (ring == null) return "MISS";
  return `R${ring}`;
}

export function formatPoints(points: number | null | undefined): string {
  if (points == null) return EM_DASH;
  return points.toString();
}

export function formatDeviation(cm: number | null | undefined): string {
  if (cm == null) return EM_DASH;
  return `${cm.toFixed(1)}cm`;
}

export function formatCount(n: number | null | undefined): string {
  if (n == null) return EM_DASH;
  return n.toLocaleString("en-US");
}

/**
 * Friendly wallclock — "14:32" for today, "Yesterday 14:32", "12 Apr 14:32"
 * for older dates. Locale-stable.
 */
export function formatTime(iso: string | null | undefined): string {
  if (!iso) return EM_DASH;
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();

  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  const time = `${hh}:${mm}`;

  if (sameDay) return time;
  if (isYesterday) return `Yesterday ${time}`;
  return `${d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  })} ${time}`;
}

/**
 * Duration in ms → "12m 34s" / "1h 02m" / "0.4s".
 */
export function formatDuration(ms: number | null | undefined): string {
  if (ms == null || ms < 0) return EM_DASH;
  if (ms < 1_000) return `${ms}ms`;
  const s = Math.round(ms / 1_000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m < 60) return `${m}m ${rem.toString().padStart(2, "0")}s`;
  const h = Math.floor(m / 60);
  const remM = m % 60;
  return `${h}h ${remM.toString().padStart(2, "0")}m`;
}

/**
 * Session code parser — splits "SSN-2026-0451" into pieces so the UI can
 * render them with subtle weight differences.
 */
export function splitSessionCode(code: string): {
  prefix: string;
  year: string;
  serial: string;
} {
  const m = /^([A-Z]+)-(\d{4})-(\d+)$/.exec(code);
  if (!m) return { prefix: code, year: "", serial: "" };
  return { prefix: m[1], year: m[2], serial: m[3] };
}

/**
 * Heartbeat freshness — "12s" / "3m" / "Stale" / "Never" depending on age.
 * Used by the device-health grid where exact timestamps are noise.
 */
export function formatHeartbeatAge(iso: string | null | undefined): string {
  if (!iso) return "Never";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0) return "now";
  const s = Math.round(ms / 1_000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return "Stale";
}

/**
 * Heartbeat freshness threshold — devices older than 30s with last_heartbeat
 * are visually warned (regardless of `status` field, which may lag). Shared
 * with the dashboard tile + `/devices` row so the rule lives once.
 */
export function isHeartbeatFresh(iso: string | null | undefined): boolean {
  if (!iso) return false;
  return Date.now() - new Date(iso).getTime() < 30_000;
}

/**
 * Derive a station/lane label from a HardwareDevice.
 *
 * Backend doesn't model lanes (M9 work) — but the convention is that the
 * `device_id` is dash-tokenized like "cam-lane-01" or "laser-bay-03", and
 * `location` is a free-text override. Try `location` first, then peel a
 * "lane-NN" / "bay-NN" / "station-NN" token from the device_id, then fall
 * back to the device_id verbatim.
 */
export function deriveStationLabel(input: {
  device_id?: string;
  location?: string;
}): string {
  if (input.location && input.location.trim()) return input.location.trim();
  const id = input.device_id ?? "";
  const m = /(lane|bay|station|fp)[-_ ]?(\d{1,3})/i.exec(id);
  if (m) return `${m[1][0].toUpperCase()}${m[1].slice(1).toLowerCase()} ${m[2]}`;
  return id || EM_DASH;
}

export { EM_DASH };
