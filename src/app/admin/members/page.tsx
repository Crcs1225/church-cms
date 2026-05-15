import { MembersPage } from "@/components/members";

type AdminMembersPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function AdminMembersPage({
  searchParams,
}: AdminMembersPageProps) {
  const { page } = await searchParams;

  return <MembersPage page={Math.max(1, Number(page ?? "1") || 1)} />;
}
