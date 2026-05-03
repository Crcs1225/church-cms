import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Tabs({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center gap-1 border-b border-border", className)}
      {...props}
    />
  );
}

type TabProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export function Tab({ active, className, type = "button", ...props }: TabProps) {
  return (
    <button
      type={type}
      className={cn(
        "border-b-2 px-3 py-2 text-sm font-semibold transition-colors",
        active
          ? "border-primary text-primary"
          : "border-transparent text-text-secondary hover:bg-surface-raised hover:text-text-primary",
        className,
      )}
      {...props}
    />
  );
}
