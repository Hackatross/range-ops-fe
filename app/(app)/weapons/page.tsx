import { WeaponsClient } from "@/components/weapons/weapons-client";

export const metadata = {
  title: "Weapons · RangeOps",
  description: "Armoury management.",
};

export default function WeaponsPage() {
  return (
    <div className="flex-1">
      <WeaponsClient />
    </div>
  );
}
