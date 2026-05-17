import { getAdminViewerData } from "@/app/admin/_lib/admin-viewer";
import { AdminShell } from "@/components/admin";
import { CalendarPageClient } from "./calendar-page-client";

export default async function CalendarPage() {
  const { currentUser, activeUsers } = await getAdminViewerData();

  return (
    <AdminShell
      activeSection="Events"
      currentUser={currentUser}
      activeUsers={activeUsers}
    >
      <CalendarPageClient />
    </AdminShell>
  );
}
