import { headers } from "next/headers";
import type { ReactNode } from "react";
import { AdminAccessDenied } from "@/components/admin/admin-access-denied";
import { getAdminViewerData } from "@/app/admin/_lib/admin-viewer";
import { canAccessAdminPath } from "@/lib/admin-access";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [headerStore, viewer] = await Promise.all([headers(), getAdminViewerData()]);
  const pathname = headerStore.get("x-pathname") ?? "/admin";
  const { currentUser, activeUsers: users } = viewer;

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
