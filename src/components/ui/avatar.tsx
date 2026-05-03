import { cn } from "@/lib/cn";

type AvatarProps = {
  name: string;
  className?: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Avatar({ name, className }: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-surface bg-surface-raised text-xs font-semibold text-primary",
        className,
      )}
      aria-label={name}
    >
      {getInitials(name)}
    </span>
  );
}
