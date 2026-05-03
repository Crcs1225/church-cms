type EventItemProps = {
  month: string;
  day: string;
  title: string;
  details: string;
};

export function EventItem({ month, day, title, details }: EventItemProps) {
  return (
    <div className="flex gap-4">
      <div className="flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-md border border-border bg-surface">
        <span className="text-[10px] font-semibold tracking-widest text-primary uppercase">
          {month}
        </span>
        <span className="font-display text-xl leading-none">{day}</span>
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-text-secondary">{details}</p>
      </div>
    </div>
  );
}
