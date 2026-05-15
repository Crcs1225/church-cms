import { headers } from "next/headers";
import type { ReactNode } from "react";
import { AdminAccessDenied } from "@/components/admin/admin-access-denied";
import {
  canAccessAdminPath,
  getActiveAppUsers,
  getCurrentAppUser,
} from "@/lib/admin-access";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [headerStore, currentUser, users] = await Promise.all([
    headers(),
    getCurrentAppUser(),
    getActiveAppUsers(),
  ]);
  const pathname = headerStore.get("x-pathname") ?? "/admin";

  if (!canAccessAdminPath(currentUser, pathname)) {
    return (
      <AdminAccessDenied
        currentUser={currentUser}
        users={users}
        pathname={pathname}
      />
    );
  }

  return children;
}
