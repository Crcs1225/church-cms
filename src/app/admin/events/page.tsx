"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin";
import { EventTable } from "@/components/events";
import { Button } from "@/components/ui";
import { Plus, Calendar as CalendarIcon } from "lucide-react";

type Event = {
  publicId: string;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        pageSize: "50",
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
    <AdminShell activeSection="Events">
      <div className="space-y-lg p-lg">
        {/* Header */}
        <div className="flex flex-col gap-lg md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold font-serif text-text-primary">
              Events
            </h1>
            <p className="text-text-secondary mt-2">
              Manage spiritual gatherings and community events
            </p>
          </div>

          <div className="flex gap-md flex-wrap">
            <Link href="/admin/events/calendar">
              <Button variant="outline" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>View Calendar</span>
              </Button>
            </Link>
            <Link href="/admin/events/create">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Create Event</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Events list */}
        <div>
          <EventTable events={events} isLoading={isLoading} />
        </div>
      </div>
    </AdminShell>
  );
}
