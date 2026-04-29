"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Crosshair,
  Loader2,
  Target as TargetIcon,
  Users,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ConfirmDialog,
  EmptyState,
  MonoCode,
  PageHeader,
  SectionCard,
  StatusPill,
} from "@/components/system";
import { useSession, useEndSession, useAbortSession } from "@/lib/api/sessions";
import { useShooter } from "@/lib/api/shooters";
import { useWeapon } from "@/lib/api/weapons";
import { useTarget } from "@/lib/api/targets";
import { useSessionShots } from "@/lib/api/shots";
import { useAuthToken } from "@/lib/auth/use-auth-token";
import { useLiveSessionFeed } from "@/lib/ws/session-feed";
import { sessionStatusSpec } from "@/lib/domain/status";
import { formatTime, formatDuration } from "@/lib/format";
import { NoResults } from "@/components/illustrations/no-results";
import { LiveTarget } from "./live-target";
import { ShotFeed } from "./shot-feed";
import { SessionStats } from "./session-stats";
import { LiveStatusBar } from "./live-status-bar";

interface Props {
  sessionId: string;
}

export function LiveSessionView({ sessionId }: Props) {
  const router = useRouter();
  const now = useNow(1_000);
  // Subscribe to NextAuth so list/detail hooks below re-run once the bearer
  // token cache fills (createCrudHooks gates on `!!token` internally).
  const { isReady } = useAuthToken();
  const { item: session, isLoading: loadingSession } = useSession(sessionId, {
    enabled: isReady,
  });
  const { isConnected, lastShot, messageCount } =
    useLiveSessionFeed(sessionId);
  const shotsQuery = useSessionShots(sessionId);
  const shots = shotsQuery.data ?? [];

  // Resolve referenced docs once we have the session — these refetch
  // automatically when the session loads.
  const { item: shooter } = useShooter(session?.shooter_id ?? null, {
    enabled: isReady,
  });
  const { item: weapon } = useWeapon(session?.weapon_id ?? null, {
    enabled: isReady,
  });
  const { item: target } = useTarget(session?.target_id ?? null, {
    enabled: isReady,
  });

  const endSession = useEndSession();
  const abortSession = useAbortSession();

  if (loadingSession) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6 sm:p-10">
        <Skeleton className="h-12 w-1/2" />
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="h-[420px] w-full" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto flex w-full max-w-3xl p-10">
        <EmptyState
          illustration={<NoResults size={140} />}
          title="Session not found"
          description="It may have been deleted or never existed. Head back to the list."
          action={
            <Button
              nativeButton={false}
              render={<Link href="/sessions">Back to sessions</Link>}
            />
          }
        />
      </div>
    );
  }

  const isActive = session.status === "active";
  const spec = sessionStatusSpec(session.status);
  const duration = session.ended_at
    ? new Date(session.ended_at).getTime() -
      new Date(session.started_at).getTime()
    : now - new Date(session.started_at).getTime();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6 sm:p-10">
      <PageHeader
        eyebrow={
          <span className="flex items-center gap-2">
            <Link
              href="/sessions"
              className="inline-flex items-center gap-1 hover:text-primary"
            >
              <ArrowLeft size={12} />
              Sessions
            </Link>
            <span>·</span>
            <span>{formatTime(session.started_at)}</span>
          </span>
        }
        title={
          <MonoCode size="2xl" weight="semibold">
            {session.session_code}
          </MonoCode>
        }
        badge={
          <span className="flex items-center gap-2">
            <StatusPill spec={spec} />
            {isActive ? (
              <LiveStatusBar
                isConnected={isConnected}
                messageCount={messageCount}
              />
            ) : null}
          </span>
        }
        actions={
          isActive ? (
            <span className="flex items-center gap-2">
              <ConfirmDialog
                trigger={
                  <Button variant="outline">
                    <XCircle className="size-4 text-mission" />
                    Abort
                  </Button>
                }
                tone="danger"
                title={`Abort ${session.session_code}?`}
                description="The session will stop accepting shots and be flagged for review."
                confirmLabel="Abort"
                onConfirm={async () => {
                  await abortSession.mutateAsync({ id: sessionId });
                  router.refresh();
                }}
              />
              <ConfirmDialog
                trigger={
                  <Button>
                    <CheckCircle2 className="size-4" />
                    End session
                  </Button>
                }
                tone="primary"
                title={`End ${session.session_code}?`}
                description="The final report will be locked and stats archived."
                confirmLabel="End session"
                onConfirm={async () => {
                  await endSession.mutateAsync({ id: sessionId });
                  router.refresh();
                }}
              />
            </span>
          ) : (
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href={`/sessions/${sessionId}/report`} />}
            >
              View report
            </Button>
          )
        }
      />

      {/* Context strip — shooter / weapon / target / duration */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ContextChip
          icon={<Users size={14} />}
          label="Shooter"
          primary={shooter?.name ?? "…"}
          secondary={shooter?.shooter_id}
        />
        <ContextChip
          icon={<Crosshair size={14} />}
          label="Weapon"
          primary={weapon?.model ?? "…"}
          secondary={weapon?.weapon_code}
        />
        <ContextChip
          icon={<TargetIcon size={14} />}
          label="Target"
          primary={target?.name ?? "…"}
          secondary={
            target ? `${target.distance_meters}m · ${target.target_code}` : ""
          }
        />
        <ContextChip
          icon={<Clock size={14} />}
          label={isActive ? "Elapsed" : "Duration"}
          primary={formatDuration(duration)}
          secondary={
            session.ended_at
              ? `Ended ${formatTime(session.ended_at)}`
              : `Started ${formatTime(session.started_at)}`
          }
        />
      </div>

      <SessionStats shots={shots} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
        <SectionCard
          eyebrow="Live"
          title="Target"
          description={
            target
              ? `${target.name} · ${target.distance_meters}m`
              : "Waiting for target metadata…"
          }
        >
          {target ? (
            <div className="relative flex min-h-[520px] items-center justify-center overflow-hidden rounded-lg bg-[radial-gradient(circle_at_center,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_58%)] py-6">
              <div
                aria-hidden
                className="absolute inset-x-8 top-4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
              />
              <LiveTarget
                target={target}
                shots={shots}
                flashShotId={lastShot?._id}
                size={520}
              />
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/50 bg-background/55 px-3 py-2 backdrop-blur">
                <MonoCode size="xs" tone="muted">
                  {shots.length} shots tracked
                </MonoCode>
                <MonoCode size="xs" tone="muted">
                  coordinate overlay · cm from center
                </MonoCode>
              </div>
            </div>
          ) : (
            <Skeleton className="aspect-square w-full" />
          )}
        </SectionCard>

        <SectionCard
          eyebrow="Stream"
          title="Shot feed"
          description={
            isActive
              ? "Live broadcast from the range — newest at the bottom."
              : "Final chronological log."
          }
          actions={
            shotsQuery.isLoading ? (
              <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
            ) : null
          }
        >
          <ShotFeed shots={shots} highlightShotId={lastShot?._id} />
        </SectionCard>
      </div>
    </div>
  );
}

function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => new Date().getTime());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date().getTime());
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);

  return now;
}

function ContextChip({
  icon,
  label,
  primary,
  secondary,
}: {
  icon: React.ReactNode;
  label: string;
  primary: React.ReactNode;
  secondary?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border/60 bg-card/60 px-3 py-2">
      <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <MonoCode size="xs" tone="muted">
          {label}
        </MonoCode>
        <span className="truncate text-sm font-medium">{primary}</span>
        {secondary ? (
          <MonoCode size="xs" tone="muted" className="truncate">
            {secondary}
          </MonoCode>
        ) : null}
      </div>
    </div>
  );
}
