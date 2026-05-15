import Link from "next/link";
import { Lock, ShieldAlert } from "lucide-react";
import { ActiveAdminUserSwitcher } from "./active-admin-user-switcher";
import { Button, Card } from "@/components/ui";
import {
  canAccessAdminPath,
  getDefaultAdminPath,
  type AdminUserAccess,
} from "@/lib/admin-access";

const navLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/finances", label: "Finances" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/settings", label: "Settings" },
];

type AdminAccessDeniedProps = {
  currentUser: AdminUserAccess | null;
  users: AdminUserAccess[];
  pathname: string;
};

export function AdminAccessDenied({
  currentUser,
  users,
  pathname,
}: AdminAccessDeniedProps) {
  const fallbackHref = getDefaultAdminPath(currentUser);
  const canOpenSettings = canAccessAdminPath(currentUser, "/admin/settings");
  const allowedLinks = navLinks.filter((item) =>
    canAccessAdminPath(currentUser, item.href),
  );

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <Card className="rounded-2xl border border-border p-8">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
            <div>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-error/10 text-error">
                <ShieldAlert className="h-6 w-6" aria-hidden />
              </div>
              <p className="mb-2 text-[11px] font-semibold tracking-[0.24em] text-error uppercase">
                Access Blocked
              </p>
              <h1 className="font-display text-4xl leading-tight text-text-primary">
                {currentUser?.role ?? "Current role"} cannot open this admin section
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-text-secondary">
                The active admin user does not have permission to access{" "}
                <span className="font-semibold text-text-primary">{pathname}</span>.
                Switch to another admin role or continue to an allowed section.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={fallbackHref}>
                  <Button>Go To Allowed Section</Button>
                </Link>
                {canOpenSettings ? (
                  <Link href="/admin/settings">
                    <Button variant="secondary">Open Settings</Button>
                  </Link>
                ) : null}
              </div>

              <div className="mt-8 rounded-xl border border-border bg-surface-raised p-5">
                <p className="mb-3 text-sm font-semibold text-text-primary">
                  Sections allowed for this user
                </p>
                <div className="flex flex-wrap gap-2">
                  {allowedLinks.length > 0 ? (
                    allowedLinks.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
                      >
                        {item.label}
                      </Link>
                    ))
                  ) : (
                    <span className="text-sm text-text-secondary">
                      No sections are available for this role.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <Card className="rounded-2xl border border-border p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Lock className="h-5 w-5" aria-hidden />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      Active admin user
                    </p>
                    <p className="text-xs text-text-secondary">
                      Role-based session for this browser
                    </p>
                  </div>
                </div>

                {currentUser ? (
                  <div className="mb-4 rounded-xl border border-border bg-surface px-4 py-3">
                    <p className="text-sm font-semibold text-text-primary">
                      {currentUser.fullName}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {currentUser.role}
                    </p>
                  </div>
                ) : null}

                <ActiveAdminUserSwitcher
                  currentUserPublicId={currentUser?.publicId ?? null}
                  users={users}
                />
              </Card>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
