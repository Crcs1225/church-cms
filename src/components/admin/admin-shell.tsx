import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bell,
  CalendarDays,
  Church,
  Gauge,
  Mic,
  ReceiptText,
  Settings,
  Users,
  WalletCards,
  RefreshCw,
} from "lucide-react";
import { ActiveAdminUserSwitcher } from "./active-admin-user-switcher";
import { GlobalAdminSearch } from "./global-admin-search";
import { Avatar, Button } from "@/components/ui";
import {
  type AdminUserAccess,
  canAccessAdminPath,
} from "@/lib/admin-access";
import { cn } from "@/lib/cn";
import { getChurchSettings } from "@/lib/church-settings";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: Gauge },
  { label: "Members", href: "/admin/members", icon: Users },
  { label: "Finances", href: "/admin/finances", icon: WalletCards },
  { label: "Sermons", href: "/admin/sermons", icon: Mic },
  { label: "Events", href: "/admin/events", icon: CalendarDays },
];

type AdminShellProps = {
  currentUser: AdminUserAccess | null;
  activeUsers: AdminUserAccess[];
  children: ReactNode;
  activeSection?: string;
  showQuickCreate?: boolean;
};

export async function AdminShell({
  currentUser,
  activeUsers,
  children,
  activeSection = "Dashboard",
  showQuickCreate = false,
}: AdminShellProps) {
  const churchSettings = await getChurchSettings();
  const visibleNavItems = navItems.filter((item) =>
    canAccessAdminPath(currentUser, item.href),
  );

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-sidebar flex-col border-r border-border bg-surface pt-4 pb-8 md:flex">
        <div className="mb-8 flex items-center gap-3 px-6">
          {churchSettings.logoPath ? (
            <Image
              src={churchSettings.logoPath}
              alt={`${churchSettings.shortName} logo`}
              width={40}
              height={40}
              className="h-10 w-10 rounded-md border border-border bg-white object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-white">
              <Church className="h-5 w-5" aria-hidden />
            </div>
          )}
          <div>
            <h1 className="font-display text-lg leading-none text-primary">
              {churchSettings.shortName}
            </h1>
            <p className="text-xs text-text-secondary">Admin Portal</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 text-sm font-semibold transition-all duration-150",
                  item.label === activeSection
                    ? "border-l-4 border-primary bg-background text-primary"
                    : "text-text-secondary hover:bg-surface-raised hover:text-text-primary",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border px-6 pt-4">
          <div className="flex items-start gap-3">
            <Avatar name={currentUser?.fullName ?? "Admin User"} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {currentUser?.fullName ?? "Admin User"}
              </p>
              <p className="text-xs text-text-secondary">
                {currentUser?.role ?? "No active role"}
              </p>
              <div className="mt-3">
                <ActiveAdminUserSwitcher
                  currentUserPublicId={currentUser?.publicId ?? null}
                  users={activeUsers}
                />
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-h-screen md:ml-sidebar">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-6">
          <div className="flex flex-1 items-center gap-4">
            <GlobalAdminSearch />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" aria-label="Sync">
              <RefreshCw className="h-4 w-4" aria-hidden />
            </Button>
            <Button variant="ghost" size="sm" aria-label="Notifications">
              <Bell className="h-4 w-4" aria-hidden />
            </Button>
            {canAccessAdminPath(currentUser, "/admin/settings") ? (
              <Link
                href="/admin/settings"
                aria-label="Settings"
                className="inline-flex h-8 items-center justify-center gap-2 rounded-md px-3 text-text-secondary transition-all duration-150 hover:bg-surface-raised hover:text-text-primary"
              >
                <Settings className="h-4 w-4" aria-hidden />
              </Link>
            ) : null}
          </div>
        </header>

        {children}
      </main>

      {showQuickCreate ? (
        <Button
          className="fixed right-6 bottom-6 z-50 h-14 w-14 rounded-full p-0 shadow-2xl"
          aria-label="Quick create"
        >
          <ReceiptText className="h-6 w-6" aria-hidden />
        </Button>
      ) : null}
    </div>
  );
}
