import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { isOperator } from "@/lib/auth/roles";

export default async function RootPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  // Anyone holding admin or trainer (incl. multi-role "admin,trainer")
  // lands on the operator dashboard. Pure viewers go to the read-only
  // leaderboard.
  if (isOperator(session.user.role)) redirect("/sessions");
  redirect("/reports/leaderboard");
}
