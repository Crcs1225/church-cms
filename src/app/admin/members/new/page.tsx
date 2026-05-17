import { NewMemberPage } from "@/components/members";
import { getAdminViewerData } from "@/app/admin/_lib/admin-viewer";

export default async function AdminNewMemberPage() {
  const { currentUser, activeUsers } = await getAdminViewerData();

  return <NewMemberPage currentUser={currentUser} activeUsers={activeUsers} />;
}
