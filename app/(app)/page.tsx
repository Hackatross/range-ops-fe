import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const metadata = {
  title: "Command center · RangeOps",
  description:
    "Live overview — active sessions, device health, recent shots, and top performers.",
};

export default function DashboardPage() {
  return (
    <div className="flex-1">
      <DashboardClient />
    </div>
  );
}
