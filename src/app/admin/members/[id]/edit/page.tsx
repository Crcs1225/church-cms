import { EditMemberPage } from "@/components/members";

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

  return <EditMemberPage memberId={id} from={from} />;
}
