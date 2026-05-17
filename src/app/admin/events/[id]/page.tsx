import { getAdminViewerData } from "@/app/admin/_lib/admin-viewer";
import { AdminShell } from "@/components/admin";
import { EventDetailPageClient } from "./event-detail-page-client";

export default async function EventDetailPage({
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
      <div className="space-y-6 p-6">
        <EventDetailPageClient id={id} />
      </div>
    </AdminShell>
  );
}
