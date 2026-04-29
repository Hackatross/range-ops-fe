"use client";

import { Loader2, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDeviceHeartbeat } from "@/lib/api/devices";
import type { HardwareDevice } from "@/lib/types/domain";

/**
 * Manual heartbeat trigger — useful in dev / commissioning to nudge a
 * freshly registered device online without waiting for the hardware to
 * start beating. Production hardware POSTs to the same endpoint on a
 * 5–30 s interval.
 */
export function DeviceHeartbeatButton({
  device,
}: {
  device: HardwareDevice;
}) {
  const heartbeat = useDeviceHeartbeat();
  const pending = heartbeat.isPending;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={pending}
            onClick={() =>
              heartbeat.mutate({
                id: device._id,
                data: { status: "online" },
              })
            }
          >
            {pending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Radio className="size-3.5" />
            )}
            <span className="sr-only">Send heartbeat</span>
          </Button>
        }
      />
      <TooltipContent side="top">Send heartbeat</TooltipContent>
    </Tooltip>
  );
}
