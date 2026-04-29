import { TargetsClient } from "@/components/targets/targets-client";

export const metadata = {
  title: "Targets · RangeOps",
  description: "Range targets and ring scoring.",
};

export default function TargetsPage() {
  return (
    <div className="flex-1">
      <TargetsClient />
    </div>
  );
}
