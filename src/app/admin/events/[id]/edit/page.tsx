import { getAdminViewerData } from "@/app/admin/_lib/admin-viewer";
import { AdminShell } from "@/components/admin";
import { EditEventPageClient } from "./edit-event-page-client";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ currentUser, activeUsers }, { id }] = await Promise.all([
    getAdminViewerData(),
    params,
  ]);

  return (
    <AdminShell
      activeSection="Events"
      currentUser={currentUser}
      activeUsers={activeUsers}
    >
      <div className="space-y-lg p-lg">
        <EditEventPageClient id={id} />
      </div>
    </AdminShell>
  );
}
