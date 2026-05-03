import { prisma } from "@/lib/prisma";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatCurrency(cents: number) {
  return currencyFormatter.format(cents / 100);
}

function formatDate(date: Date) {
  return dateFormatter.format(date);
}

export type MemberTableRow = {
  publicId: string;
  name: string;
  group: string;
  status: string;
  email: string;
  phone: string;
  contribution: string | null;
  contributionDate: string | null;
  totalGiving: string;
  active: boolean;
};

export type MembersPageData = {
  members: MemberTableRow[];
  totalMembers: number;
  activeMembers: number;
  newMembersLast30Days: number;
};

export type MemberGivingRow = {
  publicId: string;
  date: string;
  type: string;
  method: string;
  amount: string;
  badgeClassName: string;
};

export type MemberProfileData = {
  publicId: string;
  name: string;
  email: string;
  phone: string;
  birthday: string;
  address: string;
  status: string;
  statusLabel: string;
  totalContributions: string;
  thisMonthGiving: string;
  lastDonationDate: string;
  givingRows: MemberGivingRow[];
};

export type MemberFormData = {
  publicId: string;
  name: string;
  email: string;
  phone: string;
  birthday: string;
  memberType: string;
  address: string;
  notes: string;
};

export async function getMembersPageData(): Promise<MembersPageData> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [members, totalMembers, activeMembers, newMembersLast30Days] =
    await prisma.$transaction([
      prisma.member.findMany({
        where: { deletedAt: null },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 10,
        include: {
          memberType: {
            select: {
              name: true,
            },
          },
          contributions: {
            orderBy: { receivedAt: "desc" },
            select: {
              amountCents: true,
              receivedAt: true,
            },
          },
        },
      }),
      prisma.member.count({
        where: { deletedAt: null },
      }),
      prisma.member.count({
        where: {
          deletedAt: null,
          status: "active",
        },
      }),
      prisma.member.count({
        where: {
          deletedAt: null,
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
    ]);

  return {
    members: members.map((member) => {
      const latestContribution = member.contributions[0] ?? null;
      const totalGivingCents = member.contributions.reduce(
        (sum, contribution) => sum + contribution.amountCents,
        0,
      );

      return {
        publicId: member.publicId,
        name: [member.firstName, member.lastName].filter(Boolean).join(" "),
        group: member.memberType?.name ?? "General",
        status: member.status,
        email: member.email ?? "No email",
        phone: member.phone ?? "No phone",
        contribution: latestContribution
          ? formatCurrency(latestContribution.amountCents)
          : null,
        contributionDate: latestContribution
          ? formatDate(latestContribution.receivedAt)
          : null,
        totalGiving: formatCurrency(totalGivingCents),
        active: member.status === "active",
      };
    }),
    totalMembers,
    activeMembers,
    newMembersLast30Days,
  };
}

function getContributionBadgeClassName(slug: string) {
  if (slug === "tithe") {
    return "bg-orange-100 text-orange-800 border-orange-200";
  }

  if (slug === "offering") {
    return "bg-blue-100 text-blue-800 border-blue-200";
  }

  if (slug === "missions" || slug === "pledge") {
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  }

  return "bg-stone-200 text-stone-800 border-stone-300";
}

function formatBirthday(date: Date | null) {
  if (!date) {
    return "No birthday";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export async function getMemberProfileData(
  publicId: string,
): Promise<MemberProfileData | null> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const member = await prisma.member.findFirst({
    where: {
      publicId,
      deletedAt: null,
    },
    include: {
      contributions: {
        orderBy: { receivedAt: "desc" },
        include: {
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  if (!member) {
    return null;
  }

  const totalContributionCents = member.contributions.reduce(
    (sum, contribution) => sum + contribution.amountCents,
    0,
  );
  const thisMonthContributionCents = member.contributions.reduce(
    (sum, contribution) =>
      contribution.receivedAt >= monthStart
        ? sum + contribution.amountCents
        : sum,
    0,
  );
  const latestContribution = member.contributions[0] ?? null;
  const name = [member.firstName, member.lastName].filter(Boolean).join(" ");

  return {
    publicId: member.publicId,
    name,
    email: member.email ?? "No email",
    phone: member.phone ?? "No phone",
    birthday: formatBirthday(member.birthday),
    address: member.address ?? "No address",
    status: member.status,
    statusLabel:
      member.status.charAt(0).toUpperCase() + member.status.slice(1) + " Member",
    totalContributions: formatCurrency(totalContributionCents),
    thisMonthGiving: formatCurrency(thisMonthContributionCents),
    lastDonationDate: latestContribution
      ? formatDate(latestContribution.receivedAt)
      : "No donations yet",
    givingRows: member.contributions.map((contribution) => ({
      publicId: contribution.publicId,
      date: formatDate(contribution.receivedAt),
      type: contribution.category.name,
      method: contribution.paymentMethod,
      amount: formatCurrency(contribution.amountCents),
      badgeClassName: getContributionBadgeClassName(contribution.category.slug),
    })),
  };
}

export async function getMemberFormData(
  publicId: string,
): Promise<MemberFormData | null> {
  const member = await prisma.member.findFirst({
    where: {
      publicId,
      deletedAt: null,
    },
    include: {
      memberType: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (!member) {
    return null;
  }

  return {
    publicId: member.publicId,
    name: [member.firstName, member.lastName].filter(Boolean).join(" "),
    email: member.email ?? "",
    phone: member.phone ?? "",
    birthday: member.birthday ? member.birthday.toISOString().slice(0, 10) : "",
    memberType: member.memberType?.slug ?? "",
    address: member.address ?? "",
    notes: member.notes ?? "",
  };
}
