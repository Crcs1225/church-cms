import { MemberProfilePage } from "@/components/members";
import { getAdminViewerData } from "@/app/admin/_lib/admin-viewer";

type AdminMemberProfilePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminMemberProfilePage({
  params,
}: AdminMemberProfilePageProps) {
  const { id } = await params;
  const { currentUser, activeUsers } = await getAdminViewerData();

  return (
    <MemberProfilePage
      memberId={id}
      currentUser={currentUser}
      activeUsers={activeUsers}
    />
  );
}
