import type { ComponentType } from "react";
import Link from "next/link";
import type { LucideProps } from "lucide-react";

type QuickActionCardProps = {
  label: string;
  href: string;
  icon: ComponentType<LucideProps>;
};

export function QuickActionCard({ label, href, icon: Icon }: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="group flex min-h-32 flex-col items-center justify-center gap-2 rounded-md border border-border bg-background p-6 text-center transition-all duration-150 hover:-translate-y-1 hover:shadow-[0_4px_16px_rgba(28,25,23,0.06)]"
    >
      <Icon
        className="h-8 w-8 text-primary transition-transform group-hover:scale-110"
        aria-hidden
      />
      <span className="text-sm font-semibold">{label}</span>
    </Link>
  );
}
