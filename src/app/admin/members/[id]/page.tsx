import { MemberProfilePage } from "@/components/members";

type AdminMemberProfilePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminMemberProfilePage({
  params,
}: AdminMemberProfilePageProps) {
  const { id } = await params;

  return <MemberProfilePage memberId={id} />;
}
