import { MembersPage } from "@/components/members";
import { getAdminViewerData } from "@/app/admin/_lib/admin-viewer";

type AdminMembersPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function AdminMembersPage({
  searchParams,
}: AdminMembersPageProps) {
  const { page } = await searchParams;
  const { currentUser, activeUsers } = await getAdminViewerData();

  return (
    <MembersPage
      page={Math.max(1, Number(page ?? "1") || 1)}
      currentUser={currentUser}
      activeUsers={activeUsers}
    />
  );
}
