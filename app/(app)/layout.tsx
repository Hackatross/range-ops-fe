import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  Crosshair as CrosshairIcon,
  Cpu,
  FlaskConical,
  Gauge,
  LayoutDashboard,
  ScrollText,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { auth, signOut } from "@/lib/auth/config";
import { fetchMe } from "@/lib/api/server";
import { isAdmin, isOperator } from "@/lib/auth/roles";
import type { User } from "@/lib/types/domain";
import { Button } from "@/components/ui/button";
import { PatchEmblem } from "@/components/illustrations/patch-emblem";
import { MonoCode, RolePills, StatusPill } from "@/components/system";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  show: (role: string) => boolean;
};

const NAV: NavItem[] = [
  {
    href: "/",
    label: "Command center",
    icon: <LayoutDashboard size={16} />,
    show: () => true,
  },
  {
    href: "/sessions",
    label: "Sessions",
    icon: <Activity size={16} />,
    show: isOperator,
  },
  {
    href: "/shooters",
    label: "Shooters",
    icon: <Users size={16} />,
    show: isOperator,
  },
  {
    href: "/weapons",
    label: "Weapons",
    icon: <CrosshairIcon size={16} />,
    show: isOperator,
  },
  {
    href: "/targets",
    label: "Targets",
    icon: <Target size={16} />,
    show: isOperator,
  },
  {
    href: "/devices",
    label: "Devices",
    icon: <Cpu size={16} />,
    show: isOperator,
  },
  {
    href: "/playground",
    label: "Playground",
    icon: <FlaskConical size={16} />,
    show: isOperator,
  },
  {
    href: "/reports/leaderboard",
    label: "Leaderboard",
    icon: <Trophy size={16} />,
    show: () => true,
  },
  {
    href: "/users",
    label: "Users",
    icon: <ScrollText size={16} />,
    show: isAdmin,
  },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.error === "RefreshFailed") {
    // Refresh round-trip failed (token revoked, server restarted). Force a
    // fresh sign-in instead of letting every page hit a 401.
    redirect("/login?error=session-expired");
  }

  const role = session.user.role;
  // Validate the bearer end-to-end via /auth/me. Tolerates failure so dev
  // without the backend running still renders the shell.
  const me = await fetchMe<User>().catch(() => null);
  const items = NAV.filter((n) => n.show(role));

  return (
    <div className="grid min-h-svh grid-cols-1 md:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className="hidden flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-4">
          <PatchEmblem className="text-sidebar-primary" size={28} />
          <div className="leading-tight">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-sidebar-foreground/60">
              RangeOps
            </p>
            <p className="text-sm font-semibold tracking-tight">
              Command Console
            </p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-2 py-4">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="group inline-flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <span className="text-sidebar-primary group-hover:scale-110 transition-transform">
                {it.icon}
              </span>
              {it.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-sidebar-border px-4 py-3 font-mono text-[0.6rem] uppercase tracking-[0.25em] text-sidebar-foreground/50">
          v0.1 · RangeOps
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-h-svh flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border bg-background/80 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <Gauge size={16} className="text-primary" />
            <MonoCode size="xs" tone="muted">
              Console
            </MonoCode>
            {session.error ? (
              <StatusPill tone="danger" size="sm">
                token issue
              </StatusPill>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-xs text-muted-foreground">
                {me?.name ?? session.user.name ?? session.user.email}
              </span>
              <RolePills role={role} />
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <Button variant="outline" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
