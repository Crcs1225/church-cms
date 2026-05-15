"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import type { AdminUserAccess } from "@/lib/admin-access";

type ActiveAdminUserSwitcherProps = {
  currentUserPublicId: string | null;
  users: AdminUserAccess[];
  className?: string;
};

export function ActiveAdminUserSwitcher({
  currentUserPublicId,
  users,
  className,
}: ActiveAdminUserSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleChange(nextPublicId: string) {
    setError(null);

    const response = await fetch("/api/settings/active-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        publicId: nextPublicId,
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error?.message ?? "Unable to switch admin user.");
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className={cn("space-y-1", className)}>
      <div className="relative">
        <select
          aria-label="Switch active admin user"
          title="Switch active admin user"
          className="h-10 w-full appearance-none rounded-md border border-border bg-surface px-3 pr-9 text-sm text-text-primary outline-none transition-all focus:border-primary focus:ring-3 focus:ring-focus-ring disabled:opacity-60"
          defaultValue={currentUserPublicId ?? users[0]?.publicId ?? ""}
          disabled={isPending || users.length === 0}
          onChange={(event) => {
            void handleChange(event.currentTarget.value);
          }}
        >
          {users.map((user) => (
            <option key={user.publicId} value={user.publicId}>
              {user.fullName} ({user.role})
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-text-secondary"
          aria-hidden
        />
      </div>
      {error ? (
        <p className="text-xs text-error">{error}</p>
      ) : (
        <p className="text-xs text-text-secondary">
          {isPending ? "Switching user..." : "Local active admin session"}
        </p>
      )}
    </div>
  );
}
