import { ShootersClient } from "@/components/shooters/shooters-client";

export const metadata = {
  title: "Shooters · RangeOps",
  description: "Personnel registered to the range.",
};

export default function ShootersPage() {
  return (
    <div className="flex-1">
      <ShootersClient />
    </div>
  );
}
