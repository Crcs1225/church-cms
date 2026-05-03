"use client";

import { useState, useEffect } from "react";
import { LayoutList, Calendar as CalendarIcon } from "lucide-react";
import { AdminShell } from "@/components/admin";
import { EventTable, EventCalendar, AddEventDialogButton } from "@/components/events";
import { Button } from "@/components/ui";

type Event = {
  publicId: string;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
};

function EventsPageContent() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"list" | "calendar">("calendar");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadEvents();
  }, [currentMonth, view]);

  async function loadEvents() {
    setIsLoading(true);
    try {
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();

      const params = new URLSearchParams({
        month: String(month),
        year: String(year),
        pageSize: "100",
      });

      const response = await fetch(`/api/events?${params}`);
      const data = await response.json();

      if (response.ok) {
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-lg">
      {/* Header */}
      <div className="flex flex-col gap-lg md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-text-primary">
            Events
          </h1>
          <p className="text-text-secondary mt-1">
            Manage spiritual gatherings and community events
          </p>
        </div>

        <div className="flex items-center gap-md">
          {/* View toggle */}
          <div className="flex items-center gap-xs bg-surface-container rounded-lg p-xs border border-border">
            <Button
              variant={view === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("calendar")}
              className="flex items-center gap-2"
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </Button>
            <Button
              variant={view === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("list")}
              className="flex items-center gap-2"
            >
              <LayoutList className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </Button>
          </div>

          <AddEventDialogButton label="Create Event" />
        </div>
      </div>

      {/* Content */}
      <div>
        {view === "calendar" ? (
          <EventCalendar
            events={events}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
          />
        ) : (
          <EventTable events={events} isLoading={isLoading} />
        )}
      </div>

      {/* Floating action button for mobile */}
      <AddEventDialogButton floating label="Create Event" />
    </div>
  );
}

export default function EventsPage() {
  return (
    <AdminShell activeSection="Events">
      <div className="space-y-6 p-6">
        <EventsPageContent />
      </div>
    </AdminShell>
  );
}
