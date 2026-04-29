import { DevicesClient } from "@/components/devices/devices-client";

export const metadata = {
  title: "Devices · RangeOps",
  description: "Range hardware status and management.",
};

export default function DevicesPage() {
  return (
    <div className="flex-1">
      <DevicesClient />
    </div>
  );
}
