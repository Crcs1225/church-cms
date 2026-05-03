import type { ReactNode } from "react";
import Link from "next/link";
import {
  Bell,
  CalendarDays,
  Church,
  Gauge,
  Mic,
  ReceiptText,
  Search,
  Settings,
  Users,
  WalletCards,
  RefreshCw,
} from "lucide-react";
import { Avatar, Button, Input } from "@/components/ui";
import { cn } from "@/lib/cn";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: Gauge },
  { label: "Members", href: "/admin/members", icon: Users },
  { label: "Finances", href: "/admin/finances", icon: WalletCards },
  { label: "Sermons", href: "/admin/sermons", icon: Mic },
  { label: "Events", href: "/admin/events", icon: CalendarDays },
];

type AdminShellProps = {
  children: ReactNode;
  activeSection?: string;
  showQuickCreate?: boolean;
};

export function AdminShell({
  children,
  activeSection = "Dashboard",
  showQuickCreate = false,
}: AdminShellProps) {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-sidebar flex-col border-r border-border bg-surface pt-4 pb-8 md:flex">
        <div className="mb-8 flex items-center gap-3 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-white">
            <Church className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h1 className="font-display text-lg leading-none text-primary">
              Grace Community
            </h1>
            <p className="text-xs text-text-secondary">Admin Portal</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
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
          <div className="flex items-center gap-3">
            <Avatar name="Admin User" />
            <div>
              <p className="text-sm font-semibold">Admin User</p>
              <p className="text-xs text-text-secondary">System Admin</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-h-screen md:ml-sidebar">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-6">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative w-full max-w-md">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral"
                aria-hidden
              />
              <Input
                className="bg-surface pl-9"
                placeholder="Search members, transactions, or records..."
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" aria-label="Sync">
              <RefreshCw className="h-4 w-4" aria-hidden />
            </Button>
            <Button variant="ghost" size="sm" aria-label="Notifications">
              <Bell className="h-4 w-4" aria-hidden />
            </Button>
            <Button variant="ghost" size="sm" aria-label="Settings">
              <Settings className="h-4 w-4" aria-hidden />
            </Button>
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
