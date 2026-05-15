import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

type LoadingScreenProps = {
  title?: string;
  description?: string;
  className?: string;
  compact?: boolean;
};

export function LoadingScreen({
  title = "Loading",
  description = "Preparing the latest records and interface state.",
  className,
  compact = false,
}: LoadingScreenProps) {
  return (
    <section
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex w-full items-center justify-center",
        compact ? "min-h-[40vh]" : "min-h-screen bg-background px-6 py-10",
        className,
      )}
    >
      <div className="w-full max-w-xl">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_18px_48px_rgba(28,25,23,0.06)]">
          <div className="bg-[linear-gradient(135deg,rgba(194,65,12,0.12)_0%,rgba(251,146,60,0.08)_48%,rgba(255,255,255,0.9)_100%)] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_10px_24px_rgba(194,65,12,0.22)]">
                <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden />
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-[0.24em] text-primary uppercase">
                  Please Wait
                </p>
                <h2 className="font-display text-3xl leading-tight text-text-primary">
                  {title}
                </h2>
              </div>
            </div>
            <p className="mt-4 max-w-lg text-sm leading-6 text-text-secondary">
              {description}
            </p>
          </div>

          <div className="space-y-4 px-6 py-6">
            <div className="grid gap-3 md:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-border bg-background px-4 py-4"
                >
                  <div className="h-2.5 w-20 animate-pulse rounded-full bg-surface-raised" />
                  <div className="mt-4 h-7 w-24 animate-pulse rounded-full bg-surface-raised" />
                  <div className="mt-3 h-2.5 w-full animate-pulse rounded-full bg-surface-raised" />
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-border bg-background px-4 py-4">
              <div className="mb-4 h-2.5 w-36 animate-pulse rounded-full bg-surface-raised" />
              <div className="space-y-3">
                {[0, 1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="h-9 w-9 animate-pulse rounded-full bg-surface-raised" />
                    <div className="flex-1 space-y-2">
                      <div className="h-2.5 w-40 animate-pulse rounded-full bg-surface-raised" />
                      <div className="h-2.5 w-28 animate-pulse rounded-full bg-surface-raised" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
