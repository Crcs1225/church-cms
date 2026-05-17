import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminShell } from "@/components/admin";
import type { AdminUserAccess } from "@/lib/admin-access";
import { getMemberFormData } from "./members-data";
import { MemberForm } from "./member-form";

type EditMemberPageProps = {
  memberId: string;
  from?: string;
  currentUser: AdminUserAccess | null;
  activeUsers: AdminUserAccess[];
};

export async function EditMemberPage({
  memberId,
  from,
  currentUser,
  activeUsers,
}: EditMemberPageProps) {
  const member = await getMemberFormData(memberId);

  if (!member) {
    notFound();
  }

  const backHref =
    from === "list"
      ? "/admin/members"
      : `/admin/members/${member.publicId}`;

  return (
    <AdminShell
      activeSection="Members"
      currentUser={currentUser}
      activeUsers={activeUsers}
      showQuickCreate={false}
    >
      <main className="mx-auto max-w-300 px-6 py-8">
        <Link
          href={backHref}
          className="mb-6 inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
          aria-label={from === "list" ? "Back to members" : "Back to member profile"}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {from === "list" ? "Back to members" : "Back to profile"}
        </Link>

        <MemberForm mode="edit" initialValues={member} cancelHref={backHref} />
      </main>
    </AdminShell>
  );
}
