import { LeaderboardClient } from "@/components/reports/leaderboard/leaderboard-client";

export const metadata = {
  title: "Leaderboard · RangeOps",
};

export default function LeaderboardPage() {
  return (
    <div className="flex-1">
      <LeaderboardClient />
    </div>
  );
}
