import { createCrudApi } from "@classytic/arc-next/api";
import { createCrudHooks } from "@classytic/arc-next/hooks";
import { arcRequest } from "./request";
import type { HardwareDevice } from "@/lib/types/domain";

/**
 * Hardware devices live under `/hardware/devices` on the Arc backend
 * (apps/server/src/resources/hardware/hardware.resource.ts).
 *
 * Pass `basePath: "/hardware"` so arc-next builds `/hardware/devices`
 * — the resource entity name on the wire is `devices`, the registered
 * prefix is `/hardware/devices`.
 */
export type DeviceCreate = Omit<
  HardwareDevice,
  "_id" | "status" | "last_heartbeat" | "deletedAt" | "createdAt" | "updatedAt"
>;
export type DeviceUpdate = Partial<DeviceCreate>;

export const devicesApi = createCrudApi<
  HardwareDevice,
  DeviceCreate,
  DeviceUpdate
>("devices", { basePath: "/hardware" });

export const {
  KEYS: DEVICES_KEYS,
  cache: devicesCache,
  useList: useDevicesList,
  useDetail: useDevice,
  useActions: useDeviceActions,
  useNavigation: useDeviceNavigation,
  useCustomMutation: useDeviceCustomMutation,
} = createCrudHooks<HardwareDevice, DeviceCreate, DeviceUpdate>({
  api: devicesApi,
  entityKey: "devices",
  singular: "Device",
  plural: "Devices",
});

/**
 * `POST /hardware/devices/:id/heartbeat` — bumps `last_heartbeat` and
 * flips status. Used in dev to manually nudge a device online from the
 * console. Production hardware POSTs the same shape on a 5–30 s interval.
 */
export interface HeartbeatPayload {
  status?: "online" | "offline" | "error";
  config?: Record<string, unknown>;
}

export async function postDeviceHeartbeat(
  id: string,
  data: HeartbeatPayload = {},
): Promise<{ success: boolean; data: HardwareDevice }> {
  return arcRequest("POST", `/hardware/devices/${id}/heartbeat`, {
    body: data,
  });
}

export function useDeviceHeartbeat() {
  return useDeviceCustomMutation<
    { success: boolean; data: HardwareDevice },
    { id: string; data?: HeartbeatPayload }
  >({
    mutationFn: ({ id, data }) => postDeviceHeartbeat(id, data),
    invalidateQueries: [DEVICES_KEYS.lists(), DEVICES_KEYS.details()],
    messages: {
      success: "Heartbeat recorded.",
      error: "Could not record heartbeat.",
    },
  });
}
