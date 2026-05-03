import { HandHeart } from "lucide-react";
import { Button } from "@/components/ui";

export function MemberContributionCard() {
  return (
    <section className="col-span-1 flex flex-col items-center justify-center rounded-lg border border-primary bg-primary p-6 text-center text-white shadow-[0_4px_12px_rgba(194,65,12,0.25)] md:col-span-4">
      <HandHeart className="mb-4 h-10 w-10" aria-hidden />
      <h3 className="mb-2 font-display text-xl">Manage Contributions</h3>
      <p className="mb-6 text-xs text-orange-100">
        Quickly log tithes, offerings, or special donations to this member&apos;s
        profile.
      </p>
      <Button variant="inverse" className="w-full">
        Record Contribution
      </Button>
    </section>
  );
}
