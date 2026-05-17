import { getAdminViewerData } from "@/app/admin/_lib/admin-viewer";
import { AdminShell } from "@/components/admin";
import { CreateEventPageClient } from "./create-event-page-client";

export default async function CreateEventPage() {
  const { currentUser, activeUsers } = await getAdminViewerData();

  return (
    <AdminShell
      activeSection="Events"
      currentUser={currentUser}
      activeUsers={activeUsers}
    >
      <CreateEventPageClient />
    </AdminShell>
  );
}
