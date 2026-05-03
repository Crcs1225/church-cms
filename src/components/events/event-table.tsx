"use client";

import Link from "next/link";
import { Calendar, MapPin, Clock } from "lucide-react";

type EventRow = {
  publicId: string;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
};

type Props = {
  events: EventRow[];
  isLoading?: boolean;
};

export function EventTable({ events, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-surface rounded-lg border border-border" />
        ))}
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="text-center py-12 border border-dashed border-border rounded-lg">
        <Calendar className="mx-auto h-12 w-12 text-text-secondary mb-3 opacity-50" />
        <p className="text-text-secondary">No events scheduled yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => {
        const startDate = new Date(event.startsAt);
        const dayOfMonth = startDate.getDate();
        const month = startDate.toLocaleString("default", { month: "short" });
        const time = startDate.toLocaleTimeString("default", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        return (
          <Link
            key={event.publicId}
            href={`/admin/events/${event.publicId}`}
            className="block p-4 bg-surface border border-border rounded-lg hover:shadow-md hover:border-primary transition-all"
          >
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 text-center">
                <div className="text-xs font-semibold text-text-secondary uppercase">
                  {month}
                </div>
                <div className="text-xl font-bold text-primary">{dayOfMonth}</div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-text-primary truncate">
                  {event.title}
                </h3>
                {event.description && (
                  <p className="text-sm text-text-secondary line-clamp-1 mt-1">
                    {event.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-text-secondary">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{time}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
