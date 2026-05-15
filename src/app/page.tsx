import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui";
import { CHURCH_NAME_FULL, CHURCH_NAME_SHORT } from "@/lib/branding";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-text-primary">
      <Card className="max-w-xl p-8 text-center">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">
          {CHURCH_NAME_SHORT}
        </p>
        <CardTitle className="mt-3 text-5xl">{CHURCH_NAME_SHORT}</CardTitle>
        <CardDescription className="mx-auto mt-3 max-w-md text-base">
          {CHURCH_NAME_FULL} local administration for members, giving, events,
          and reports.
        </CardDescription>
        <Link
          href="/admin"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition-all duration-150 hover:bg-primary-hover hover:shadow-[0_4px_12px_rgba(194,65,12,0.25)] active:scale-[0.98]"
        >
          Open Admin Dashboard
        </Link>
      </Card>
    </div>
  );
}
