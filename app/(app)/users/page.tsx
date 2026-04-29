import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { isAdmin } from "@/lib/auth/roles";
import { UsersClient } from "@/components/users/users-client";

export const metadata = {
  title: "Users · RangeOps",
  description: "Console account management.",
};

export default async function UsersPage() {
  // Server-side admin gate — the sidebar already hides this nav item for
  // non-admins, but a deep link should be rejected too. The backend's
  // permissions: adminOnlyPermissions would 403 anyway; redirecting here
  // gives a friendlier UX than a list-page error toast.
  const session = await auth();
  if (!isAdmin(session?.user?.role)) {
    redirect("/sessions");
  }
  return (
    <div className="flex-1">
      <UsersClient />
    </div>
  );
}
