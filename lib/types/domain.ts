/**
 * Domain types — hand-rolled to mirror the bd-army-server Mongoose models.
 * Lives outside `lib/api/` so server components can import without pulling
 * in the arc-next client (which is browser-only).
 */

export type PlatformRole = "admin" | "trainer" | "viewer";

/**
 * Server-side User (apps/server/src/resources/user/user.model.ts).
 * `role` is a comma-separated string — see lib/auth/roles.ts for parsing.
 */
export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Shooter {
  _id: string;
  shooter_id: string;
  name: string;
  rank?: string;
  unit?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Weapon {
  _id: string;
  weapon_code: string;
  type: "rifle" | "pistol" | "smg" | "lmg";
  model: string;
  caliber: string;
  createdAt: string;
  updatedAt: string;
}

export interface TargetRing {
  ring: number;
  radius_cm: number;
  points: number;
  is_bullseye: boolean;
}

export interface Target {
  _id: string;
  target_code: string;
  name: string;
  distance_meters: number;
  dimensions: { width_cm: number; height_cm: number };
  rings: TargetRing[];
  reference_image_media_id?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type SessionStatus = "active" | "completed" | "aborted";

export interface RangeSession {
  _id: string;
  session_code: string;
  shooter_id: string;
  weapon_id?: string;
  target_id: string;
  status: SessionStatus;
  started_at: string;
  ended_at?: string | null;
  shots_count?: number;
  score?: number;
  accuracy?: number;
  bullseyes?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Shot wire shape — mirrors the backend Mongoose model. Hit metrics live
 * under `.hit` (the controller derives them from `(hit_x_cm, hit_y_cm)`
 * via the target geometry). UI components read through helpers in
 * `lib/format.ts` rather than poking the nested fields directly.
 */
export interface ShotHit {
  is_hit: boolean;
  is_bullseye: boolean;
  coordinates: { x_cm: number; y_cm: number };
  deviation_cm: number;
  ring_hit?: number;
  points?: number;
}

export interface Shot {
  _id: string;
  session_id: string;
  shot_number: number;
  fired_at: string;
  hit: ShotHit;
  flagged?: boolean;
  notes?: string;
  laser_data?: unknown;
  camera_data?: { media_id?: string; image_url?: string } | null;
  raw_hardware_payload?: unknown;
  createdAt: string;
  updatedAt: string;
}

export type DeviceType = "laser" | "camera";
export type DeviceStatus = "online" | "offline" | "error";

export interface LeaderboardRow {
  shooter: Shooter | null;
  sessions: number;
  shots: number;
  hits: number;
  accuracy_percent: number;
  total_score: number;
  max_possible_score: number;
  score_percent: number;
  bullseyes: number;
}

export interface ShooterAggregate {
  total_sessions: number;
  completed_sessions: number;
  total_shots: number;
  total_hits: number;
  total_score: number;
  max_possible_score: number;
  accuracy_percent: number;
  score_percent: number;
  bullseyes: number;
  best_session_score: number;
}

export interface ShooterReportSession {
  _id: string;
  session_code: string;
  status: SessionStatus;
  started_at: string;
  ended_at?: string | null;
  stats: {
    total_shots?: number;
    hits?: number;
    misses?: number;
    total_score?: number;
    max_possible_score?: number;
    accuracy_percent?: number;
    avg_deviation_cm?: number;
    grouping_cm?: number;
    bullseyes?: number;
  };
}

export interface ShooterReport {
  shooter: Shooter;
  aggregate: ShooterAggregate;
  sessions: ShooterReportSession[];
}

export interface HardwareDevice {
  _id: string;
  device_id: string;
  type: DeviceType;
  status: DeviceStatus;
  ip_address?: string;
  port?: number;
  protocol?: string;
  location?: string;
  last_heartbeat?: string | null;
  config?: Record<string, unknown>;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
