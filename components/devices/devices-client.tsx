"use client";

import { Cpu, Plus } from "lucide-react";
import {
  ResourceDashboard,
  type ResourceConfig,
} from "@/components/system";
import { useDeviceActions, useDevicesList } from "@/lib/api/devices";
import { useDevicesFeed } from "@/lib/ws/devices-feed";
import type { HardwareDevice } from "@/lib/types/domain";
import { deviceColumns } from "./device-columns";
import { DeviceSheet } from "./device-sheet";
import { DevicesLiveBar } from "./devices-live-bar";
import { DevicesStationGrid } from "./devices-station-grid";

const devicesConfig: ResourceConfig<HardwareDevice> = {
  entityName: "device",
  basePath: "/devices",
  icon: Cpu,
  title: "Hardware stations",
  description:
    "Range hardware — laser sensors and cameras. Each device is a station; status updates push live over the devices room.",
  useList: useDevicesList,
  useActions: useDeviceActions,
  // Columns still drive the underlying state (sheet/delete plumbing) even
  // though the body is the card grid; ResourceDashboard reuses them when
  // a future "Table view" toggle is added.
  columns: deviceColumns,
  defaultSort: "device_id",
  defaultLimit: 12,
  sheet: { component: DeviceSheet },
  headerActions: [
    {
      icon: Plus,
      text: "Register device",
      size: "sm",
      role: "create",
      requiredRoles: ["admin"],
    },
  ],
  permissions: { deleteRoles: ["admin"] },
  renderAboveTable: DevicesLiveBar,
};

export function DevicesClient() {
  // Mounted at the page level so the WS subscription persists for the
  // whole `/devices` lifetime even when the body re-renders.
  useDevicesFeed();
  return (
    <ResourceDashboard
      config={devicesConfig}
      body={(args) => <DevicesStationGrid {...args} />}
    />
  );
}
