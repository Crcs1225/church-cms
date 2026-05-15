"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin";
import { EventCalendar } from "@/components/events";
import { Button } from "@/components/ui";
import { CHURCH_NAME_SHORT } from "@/lib/branding";
import { ArrowLeft, Plus } from "lucide-react";

type Event = {
  publicId: string;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
};

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    void (async () => {
      setIsLoading(true);
      try {
        const month = currentMonth.getMonth() + 1;
        const year = currentMonth.getFullYear();

        const params = new URLSearchParams({
          month: String(month),
          year: String(year),
          pageSize: "200",
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
    })();
  }, [currentMonth]);

  return (
    <AdminShell activeSection="Events">
      <div className="space-y-lg p-lg">
        {/* Back button */}
        <Link href="/admin/events">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Button>
        </Link>

        {/* Header */}
        <div className="flex flex-col gap-md md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold font-serif text-text-primary">
              Event Calendar
            </h1>
            <p className="text-text-secondary mt-2">
              Full month view of {CHURCH_NAME_SHORT} events
            </p>
          </div>

          <Link href="/admin/events/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </Link>
        </div>

        {/* Calendar */}
        <div className="max-w-5xl">
          {isLoading ? (
            <div className="h-96 bg-surface border border-border rounded-lg animate-pulse" />
          ) : (
            <EventCalendar
              events={events}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
            />
          )}
        </div>
      </div>
    </AdminShell>
  );
}
