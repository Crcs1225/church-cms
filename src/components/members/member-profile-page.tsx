import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Banknote, CalendarDays, Pencil, TrendingUp } from "lucide-react";
import { AdminShell } from "@/components/admin";
import { getMemberProfileData } from "./members-data";
import { MemberContributionCard } from "./member-contribution-card";
import { MemberEngagement } from "./member-engagement";
import { MemberGivingHistory } from "./member-giving-history";
import { MemberIdentityCard } from "./member-identity-card";
import { MemberProfileSummary } from "./member-profile-summary";

type MemberProfilePageProps = {
  memberId: string;
};

export async function MemberProfilePage({ memberId }: MemberProfilePageProps) {
  const member = await getMemberProfileData(memberId);

  if (!member) {
    notFound();
  }

  return (
    <AdminShell activeSection="Members" showQuickCreate={false}>
      <main className="mx-auto max-w-[1200px] space-y-6 px-6 py-6">
        <Link
          href="/admin/members"
          className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
          aria-label="Back to members"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to members
        </Link>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <MemberIdentityCard
            name={member.name}
            email={member.email}
            phone={member.phone}
            birthday={member.birthday}
            address={member.address}
            statusLabel={member.statusLabel}
          />
          <MemberContributionCard />
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <MemberProfileSummary
            label="Total Contributions"
            value={member.totalContributions}
            icon={Banknote}
            iconClassName="bg-orange-100 text-primary"
          />
          <MemberProfileSummary
            label="This Month's Giving"
            value={member.thisMonthGiving}
            icon={TrendingUp}
            iconClassName="bg-emerald-100 text-success"
          />
          <MemberProfileSummary
            label="Last Donation Date"
            value={member.lastDonationDate}
            icon={CalendarDays}
            iconClassName="bg-stone-100 text-stone-700"
          />
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <MemberGivingHistory givingRows={member.givingRows} />
          <MemberEngagement />
        </section>
      </main>

      <Link
        href={`/admin/members/${member.publicId}/edit?from=profile`}
        className="fixed right-6 bottom-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-md bg-primary text-white shadow-2xl transition-all duration-150 hover:bg-primary-hover hover:shadow-[0_4px_12px_rgba(194,65,12,0.25)] active:scale-[0.98]"
        aria-label={`Edit ${member.name}`}
      >
        <Pencil className="h-5 w-5" aria-hidden />
      </Link>
    </AdminShell>
  );
}
