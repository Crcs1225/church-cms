import { EditMemberPage } from "@/components/members";
import { getAdminViewerData } from "@/app/admin/_lib/admin-viewer";

type AdminEditMemberPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    from?: string;
  }>;
};

export default async function AdminEditMemberPage({
  params,
  searchParams,
}: AdminEditMemberPageProps) {
  const { id } = await params;
  const { from } = await searchParams;
  const { currentUser, activeUsers } = await getAdminViewerData();

  return (
    <EditMemberPage
      memberId={id}
      from={from}
      currentUser={currentUser}
      activeUsers={activeUsers}
    />
  );
}
