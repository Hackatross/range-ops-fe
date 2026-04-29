"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MonoCode } from "@/components/system";
import { formatAccuracy, formatScore } from "@/lib/format";
import type { ShooterReportSession } from "@/lib/types/domain";

interface Props {
  sessions: ShooterReportSession[];
}

/**
 * Accuracy + score over time. Sessions render oldest-to-newest left-to-right
 * so trends read naturally; the X axis shows session_code so the user knows
 * which session each point came from.
 */
export function PerformanceChart({ sessions }: Props) {
  const data = useMemo(
    () =>
      [...sessions]
        .sort(
          (a, b) =>
            new Date(a.started_at).getTime() -
            new Date(b.started_at).getTime(),
        )
        .map((s) => ({
          code: s.session_code,
          accuracy: Math.round((s.stats.accuracy_percent ?? 0) * 10) / 10,
          score: s.stats.total_score ?? 0,
          bullseyes: s.stats.bullseyes ?? 0,
        })),
    [sessions],
  );

  if (data.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
        No completed sessions yet.
      </div>
    );
  }

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 12, right: 16, bottom: 12, left: 0 }}
        >
          <CartesianGrid stroke="var(--color-grid-line)" strokeDasharray="2 2" />
          <XAxis
            dataKey="code"
            stroke="var(--color-muted-foreground)"
            tick={{
              fill: "var(--color-muted-foreground)",
              fontSize: 10,
              fontFamily: "var(--font-mono)",
            }}
            tickLine={false}
            axisLine={{ stroke: "var(--color-border)" }}
          />
          <YAxis
            yAxisId="acc"
            domain={[0, 100]}
            stroke="var(--color-primary)"
            tick={{
              fill: "var(--color-primary)",
              fontSize: 10,
              fontFamily: "var(--font-mono)",
            }}
            tickLine={false}
            axisLine={{ stroke: "var(--color-border)" }}
            width={36}
          />
          <YAxis
            yAxisId="score"
            orientation="right"
            stroke="var(--color-bullseye)"
            tick={{
              fill: "var(--color-bullseye)",
              fontSize: 10,
              fontFamily: "var(--font-mono)",
            }}
            tickLine={false}
            axisLine={{ stroke: "var(--color-border)" }}
            width={36}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--color-pulse)" }} />
          <Line
            yAxisId="acc"
            type="monotone"
            dataKey="accuracy"
            stroke="var(--color-primary)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--color-primary)" }}
            activeDot={{ r: 5 }}
          />
          <Line
            yAxisId="score"
            type="monotone"
            dataKey="score"
            stroke="var(--color-bullseye)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--color-bullseye)" }}
            activeDot={{ r: 5 }}
            strokeDasharray="4 4"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface TooltipPayload {
  payload: {
    code: string;
    accuracy: number;
    score: number;
    bullseyes: number;
  };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload?.[0]) return null;
  const { code, accuracy, score, bullseyes } = payload[0].payload;
  return (
    <div className="rounded-md border border-border/60 bg-card/95 px-3 py-2 text-xs shadow-md backdrop-blur-sm">
      <MonoCode size="xs" tone="primary">
        {code}
      </MonoCode>
      <div className="mt-1 grid gap-0.5">
        <span>
          Accuracy <MonoCode size="xs">{formatAccuracy(accuracy)}</MonoCode>
        </span>
        <span>
          Score <MonoCode size="xs">{formatScore(score)}</MonoCode>
        </span>
        <span>
          Bullseyes <MonoCode size="xs">{bullseyes}</MonoCode>
        </span>
      </div>
    </div>
  );
}
