"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui";

type EventRow = {
  publicId: string;
  title: string;
  startsAt: string;
};

type Props = {
  events: EventRow[];
  currentMonth?: Date;
  onMonthChange?: (date: Date) => void;
};

export function EventCalendar({
  events,
  currentMonth = new Date(),
  onMonthChange,
}: Props) {
  const [displayMonth, setDisplayMonth] = useState(currentMonth);

  const handlePrevMonth = () => {
    const prev = new Date(displayMonth);
    prev.setMonth(prev.getMonth() - 1);
    setDisplayMonth(prev);
    onMonthChange?.(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(displayMonth);
    next.setMonth(next.getMonth() + 1);
    setDisplayMonth(next);
    onMonthChange?.(next);
  };

  const year = displayMonth.getFullYear();
  const month = displayMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const monthName = displayMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  // Group events by day
  const eventsByDay: Record<number, EventRow[]> = {};
  events.forEach((event) => {
    const eventDate = new Date(event.startsAt);
    if (
      eventDate.getFullYear() === year &&
      eventDate.getMonth() === month
    ) {
      const day = eventDate.getDate();
      if (!eventsByDay[day]) {
        eventsByDay[day] = [];
      }
      eventsByDay[day].push(event);
    }
  });

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">{monthName}</h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-px mb-2">
        {dayLabels.map((label) => (
          <div
            key={label}
            className="text-xs font-semibold text-text-secondary text-center py-2"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-border rounded overflow-hidden border border-border">
        {days.map((day, idx) => {
          const dayEvents = day ? eventsByDay[day] || [] : [];
          const isOtherMonth = day === null;

          return (
            <div
              key={idx}
              className={`min-h-24 p-2 ${
                isOtherMonth
                  ? "bg-surface-container opacity-40"
                  : "bg-surface-container-lowest"
              }`}
            >
              {day && (
                <>
                  <div className="text-xs font-semibold text-text-primary mb-1">
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <a
                        key={event.publicId}
                        href={`/admin/events/${event.publicId}`}
                        className="block px-1 py-0.5 text-xs bg-primary-container text-white rounded truncate hover:opacity-80 transition-opacity"
                        title={event.title}
                      >
                        {event.title}
                      </a>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-text-secondary px-1">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
