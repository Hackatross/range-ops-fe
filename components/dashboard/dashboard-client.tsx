"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Cpu,
  Crosshair,
  Plus,
  Target,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  KpiGrid,
  PageHeader,
  SectionCard,
  StatCard,
} from "@/components/system";
import { useDevicesFeed } from "@/lib/ws/devices-feed";
import { useSessionsList } from "@/lib/api/sessions";
import { useDevicesList } from "@/lib/api/devices";
import { useShootersList } from "@/lib/api/shooters";
import { useWeaponsList } from "@/lib/api/weapons";
import { useTargetsList } from "@/lib/api/targets";
import { useRecentShots } from "@/lib/api/shots";
import { useLeaderboard } from "@/lib/api/reports";
import { useAuthToken } from "@/lib/auth/use-auth-token";
import { isHeartbeatFresh, formatAccuracy, formatCount } from "@/lib/format";
import type {
  HardwareDevice,
  RangeSession,
  Shot,
} from "@/lib/types/domain";
import { ActiveSessionsStrip } from "./active-sessions-strip";
import { DeviceHealthGrid } from "./device-health-grid";
import { RecentShotsTicker } from "./recent-shots-ticker";
import { TopPerformers } from "./top-performers";
import { SetupChecklist } from "./setup-checklist";

/**
 * Range command center.
 *
 * Single-screen overview built around four live signals: active sessions,
 * device health, recent shots, top performers. Each panel deep-links into
 * its full-fidelity destination so this page acts as a launchpad and a
 * status board simultaneously. Heartbeat WS keeps device tiles live; the
 * `/shots` endpoint is polled every 30 s so the recent ticker stays warm.
 */
export function DashboardClient() {
  // Live device-status pushes — mirrors `device:status` events into cache so
  // the health grid flips colour without polling.
  useDevicesFeed();

  // Subscribe to NextAuth so list hooks below re-evaluate `enabled: !!token`
  // once the bearer token cache fills (createCrudHooks gates internally).
  const { isReady } = useAuthToken();

  const sessionsQuery = useSessionsList(
    { status: "active", sort: "-started_at", limit: 6 },
    { enabled: isReady },
  );
  const devicesQuery = useDevicesList(
    { sort: "device_id", limit: 12 },
    { enabled: isReady },
  );
  const shootersQuery = useShootersList({ limit: 1 }, { enabled: isReady });
  const weaponsQuery = useWeaponsList({ limit: 1 }, { enabled: isReady });
  const targetsQuery = useTargetsList({ limit: 1 }, { enabled: isReady });
  const recentShotsQuery = useRecentShots(8);

  const todayIso = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }, []);

  const leaderboardTodayQuery = useLeaderboard({ from: todayIso, limit: 5 });

  const sessions = (sessionsQuery.items ?? []) as RangeSession[];
  const devices = (devicesQuery.items ?? []) as HardwareDevice[];
  const recentShots = recentShotsQuery.data ?? [];
  const topRows = leaderboardTodayQuery.data ?? [];

  const hasShooters = (shootersQuery.pagination?.total ?? 0) > 0;
  const hasWeapons = (weaponsQuery.pagination?.total ?? 0) > 0;
  const hasTargets = (targetsQuery.pagination?.total ?? 0) > 0;
  const hasDevices = (devicesQuery.pagination?.total ?? 0) > 0;
  const isProvisioned = hasShooters && hasWeapons && hasTargets && hasDevices;

  // KPIs derived from the same queries powering the panels — no second round-
  // trip just for the headline numbers.
  const activeCount = sessions.length;
  const onlineDevices = devices.filter(
    (d) => d.status === "online" && isHeartbeatFresh(d.last_heartbeat),
  ).length;
  const totalDevices = devices.length;
  const todayStart = new Date(todayIso).getTime();
  const shotsToday = recentShots.filter(
    (s: Shot) => new Date(s.fired_at).getTime() >= todayStart,
  ).length;
  const topAccuracy = topRows[0]?.accuracy_percent ?? null;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-10">
      <PageHeader
        eyebrow="Range command center"
        title="Live overview"
        description="Active sessions, device health, recent shots, and today's top performers — at a glance."
        actions={
          <Button
            nativeButton={false}
            render={
              <Link href="/sessions/new">
                <Plus className="size-4" />
                Start session
              </Link>
            }
          />
        }
      />

      {!isProvisioned ? (
        <SectionCard
          eyebrow="First-time setup"
          title="Get the range ready"
          description="Add at least one of each before starting your first session."
        >
          <SetupChecklist
            hasShooters={hasShooters}
            hasWeapons={hasWeapons}
            hasTargets={hasTargets}
            hasDevices={hasDevices}
          />
        </SectionCard>
      ) : null}

      <KpiGrid cols={4}>
        <StatCard
          icon={<Activity size={16} />}
          label="Active sessions"
          value={formatCount(activeCount)}
          tone={activeCount > 0 ? "accent" : "default"}
          hint={activeCount === 0 ? "Range is quiet" : "Live right now"}
        />
        <StatCard
          icon={<Cpu size={16} />}
          label="Devices online"
          value={
            totalDevices === 0 ? "—" : `${onlineDevices}/${totalDevices}`
          }
          tone={
            totalDevices === 0
              ? "default"
              : onlineDevices === totalDevices
                ? "accent"
                : onlineDevices === 0
                  ? "danger"
                  : "warning"
          }
          hint={
            totalDevices === 0 ? "No hardware registered" : "Heartbeat fresh"
          }
        />
        <StatCard
          icon={<Crosshair size={16} />}
          label="Shots today"
          value={formatCount(shotsToday)}
          hint="Across all sessions"
        />
        <StatCard
          icon={<Trophy size={16} />}
          label="Top accuracy"
          value={topAccuracy != null ? formatAccuracy(topAccuracy) : "—"}
          tone={topAccuracy != null ? "accent" : "default"}
          hint={
            topRows[0]?.shooter?.name
              ? topRows[0].shooter.name
              : "No completed sessions today"
          }
        />
      </KpiGrid>

      <SectionCard
        eyebrow="Live"
        title="Active sessions"
        actions={
          activeCount > 0 ? (
            <Button
              size="xs"
              variant="ghost"
              nativeButton={false}
              render={
                <Link href="/sessions">
                  All sessions <ArrowRight size={12} />
                </Link>
              }
            />
          ) : undefined
        }
      >
        <ActiveSessionsStrip
          sessions={sessions}
          isLoading={sessionsQuery.isLoading}
        />
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <SectionCard
          eyebrow="Hardware"
          title="Device health"
          actions={
            <Button
              size="xs"
              variant="ghost"
              nativeButton={false}
              render={
                <Link href="/devices">
                  Manage <ArrowRight size={12} />
                </Link>
              }
            />
          }
        >
          <DeviceHealthGrid
            devices={devices}
            isLoading={devicesQuery.isLoading}
          />
        </SectionCard>

        <SectionCard
          eyebrow="Today"
          title="Top performers"
          actions={
            <Button
              size="xs"
              variant="ghost"
              nativeButton={false}
              render={
                <Link href="/reports/leaderboard">
                  Full board <ArrowRight size={12} />
                </Link>
              }
            />
          }
        >
          <TopPerformers
            rows={topRows}
            isLoading={leaderboardTodayQuery.isLoading}
          />
        </SectionCard>
      </div>

      <SectionCard
        eyebrow="Activity"
        title="Recent shots"
        description="Last 8 shots across all sessions — tap a row to jump to the live view."
        actions={
          <Button
            size="xs"
            variant="ghost"
            nativeButton={false}
            render={
              <Link href="/sessions">
                All sessions <ArrowRight size={12} />
              </Link>
            }
          />
        }
      >
        <RecentShotsTicker
          shots={recentShots}
          isLoading={recentShotsQuery.isLoading}
        />
      </SectionCard>

      {/* Quick-jump: only shown when fully provisioned and quiet — gives the
          trainer fast paths to the most common follow-up actions. */}
      {isProvisioned && activeCount === 0 ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <QuickAction
            href="/sessions/new"
            icon={<Crosshair size={16} />}
            label="Start a session"
            description="Begin live shot tracking for a shooter."
            tone="primary"
          />
          <QuickAction
            href="/devices"
            icon={<Cpu size={16} />}
            label="Hardware status"
            description="Heartbeat, station assignment, config."
          />
          <QuickAction
            href="/reports/leaderboard"
            icon={<Target size={16} />}
            label="Performance reports"
            description="Leaderboard and per-shooter trends."
          />
        </div>
      ) : null}
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
  description,
  tone,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  tone?: "primary";
}) {
  return (
    <Link
      href={href}
      className={
        tone === "primary"
          ? "group flex items-start gap-3 rounded-lg border border-primary/40 bg-primary/5 p-4 transition-colors hover:border-primary/60 hover:bg-primary/10"
          : "group flex items-start gap-3 rounded-lg border border-border/60 bg-card/60 p-4 transition-colors hover:border-primary/40 hover:bg-card"
      }
    >
      <span
        className={
          tone === "primary"
            ? "flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary"
            : "flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary/40 text-foreground"
        }
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ArrowRight
        size={14}
        className="mt-1 text-muted-foreground transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}
