"use client";

import { cn } from "@/lib/utils";
import { MonoCode } from "@/components/system";
import { SignalStrength } from "@/components/illustrations";

interface Props {
  isConnected: boolean;
  messageCount: number;
  className?: string;
}

/**
 * Tiny status strip — shown in the page header when the session is live.
 * Tone of the SignalStrength bars derives from connection state and
 * message volume so the dashboard tells you at a glance whether the WS is
 * actually delivering events (vs being silently connected to a dead room).
 */
export function LiveStatusBar({
  isConnected,
  messageCount,
  className,
}: Props) {
  let tone = "text-muted-foreground";
  let strength: 0 | 1 | 2 | 3 | 4 = 0;
  let label = "Disconnected";

  if (isConnected) {
    if (messageCount === 0) {
      tone = "text-tactical";
      strength = 2;
      label = "Connected · idle";
    } else if (messageCount < 5) {
      tone = "text-tactical";
      strength = 3;
      label = "Connected";
    } else {
      tone = "text-hit";
      strength = 4;
      label = "Live";
    }
  } else {
    tone = "text-mission";
    strength = 0;
    label = "Disconnected";
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-2.5 py-1",
        className,
      )}
    >
      <span className={cn("flex items-center", tone)}>
        <SignalStrength strength={strength} size={14} />
      </span>
      <MonoCode size="xs" tone="muted">
        {label}
      </MonoCode>
      {messageCount > 0 ? (
        <MonoCode size="xs" tone="muted">
          · {messageCount}
        </MonoCode>
      ) : null}
    </div>
  );
}
