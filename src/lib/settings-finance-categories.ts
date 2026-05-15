import { prisma } from "@/lib/prisma";

export type SettingsCategoryItem = {
  publicId: string;
  name: string;
  slug: string;
  usageCount: number;
  restricted?: boolean;
};

export type SettingsFinanceCategoriesData = {
  givingCategories: SettingsCategoryItem[];
  expenseCategories: SettingsCategoryItem[];
};

export async function getSettingsFinanceCategories(): Promise<SettingsFinanceCategoriesData> {
  const [givingCategories, expenseCategories] = await prisma.$transaction([
    prisma.givingCategory.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            contributions: true,
          },
        },
      },
    }),
    prisma.expenseCategory.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            expenses: true,
          },
        },
      },
    }),
  ]);

  return {
    givingCategories: givingCategories.map((category: (typeof givingCategories)[number]) => ({
      publicId: category.publicId,
      name: category.name,
      slug: category.slug,
      usageCount: category._count.contributions,
      restricted: category.isRestricted,
    })),
    expenseCategories: expenseCategories.map((category: (typeof expenseCategories)[number]) => ({
      publicId: category.publicId,
      name: category.name,
      slug: category.slug,
      usageCount: category._count.expenses,
    })),
  };
}
