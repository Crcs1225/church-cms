"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Clock, Edit2, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin";
import { Button } from "@/components/ui";

type Event = {
  publicId: string;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function EventDetailContent({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [params.id]);

  async function loadEvent() {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/events/${params.id}`);
      const data = await response.json();

      if (response.ok) {
        setEvent(data.event);
      } else {
        setError(data?.error?.message || "Event not found");
      }
    } catch (err) {
      setError("Failed to load event");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!event || !confirm("Are you sure you want to delete this event?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/events/${event.publicId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/admin/events");
      } else {
        setError("Failed to delete event");
      }
    } catch (err) {
      setError("Failed to delete event");
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-lg animate-pulse">
        <div className="h-8 bg-surface rounded w-32" />
        <div className="h-32 bg-surface rounded" />
        <div className="h-64 bg-surface rounded" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary mb-4">{error || "Event not found"}</p>
        <Link href="/admin/events">
          <Button variant="outline">Back to Events</Button>
        </Link>
      </div>
    );
  }

  const startDate = new Date(event.startsAt);
  const endDate = event.endsAt ? new Date(event.endsAt) : null;

  const formattedStart = startDate.toLocaleDateString("default", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const formattedEnd = endDate
    ? endDate.toLocaleDateString("default", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="space-y-lg">
      {/* Navigation buttons */}
      <div className="flex gap-md">
        <Link href="/admin/events">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Button>
        </Link>
        <Link href="/admin/events/calendar">
          <Button variant="ghost" size="sm">
            View Calendar
          </Button>
        </Link>
      </div>

      {/* Header with actions */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif text-text-primary">
            {event.title}
          </h1>
          <p className="text-text-secondary mt-2">
            Last updated {new Date(event.updatedAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex gap-md">
          <Link href={`/admin/events/${event.publicId}/edit`}>
            <Button variant="outline" className="flex items-center gap-2">
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Event details grid */}
      <div className="grid gap-lg md:grid-cols-3">
        {/* Main info */}
        <div className="md:col-span-2 space-y-lg">
          {/* Description */}
          {event.description && (
            <div className="bg-surface border border-border rounded-lg p-lg">
              <h2 className="text-lg font-semibold text-text-primary mb-md">
                Description
              </h2>
              <p className="text-text-secondary whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}

          {/* Date & Time */}
          <div className="bg-surface border border-border rounded-lg p-lg">
            <h2 className="text-lg font-semibold text-text-primary mb-md flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Date &amp; Time
            </h2>
            <div className="space-y-2 text-text-secondary">
              <div>
                <p className="text-sm font-semibold text-text-primary">Start</p>
                <p>{formattedStart}</p>
              </div>
              {formattedEnd && (
                <div>
                  <p className="text-sm font-semibold text-text-primary">End</p>
                  <p>{formattedEnd}</p>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="bg-surface border border-border rounded-lg p-lg">
              <h2 className="text-lg font-semibold text-text-primary mb-md flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Location
              </h2>
              <p className="text-text-secondary">{event.location}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-lg">
          {/* Stats card */}
          <div className="bg-primary-container/10 border border-primary/20 rounded-lg p-lg">
            <h3 className="font-semibold text-text-primary mb-md">Event Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-text-secondary mb-1">Public ID</p>
                <p className="font-mono text-xs text-text-primary break-all">
                  {event.publicId}
                </p>
              </div>
              <div>
                <p className="text-text-secondary mb-1">Created</p>
                <p className="text-text-primary">
                  {new Date(event.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <AdminShell activeSection="Events">
      <div className="space-y-6 p-6">
        <EventDetailContent params={params} />
      </div>
    </AdminShell>
  );
}
