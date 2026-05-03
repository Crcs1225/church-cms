import { FinanceIncome } from "@/components/finance";

type FinanceIncomePageProps = {
  searchParams: Promise<{
    member?: string;
    category?: string;
  }>;
};

export default async function FinanceIncomePage({
  searchParams,
}: FinanceIncomePageProps) {
  const { member, category } = await searchParams;

  return <FinanceIncome memberQuery={member} categorySlug={category} />;
}
