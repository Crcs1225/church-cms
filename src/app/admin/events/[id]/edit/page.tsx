"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminShell } from "@/components/admin";
import { Button } from "@/components/ui";
import EventForm from "@/components/events/event-form";

type Event = {
  publicId: string;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
};

function EditEventContent({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [params.id]);

  async function loadEvent() {
    try {
      const response = await fetch(`/api/events/${params.id}`);
      const data = await response.json();

      if (response.ok) {
        const evt = data.event;
        // Convert ISO strings to datetime-local format
        const start = new Date(evt.startsAt);
        const end = evt.endsAt ? new Date(evt.endsAt) : null;

        setEvent({
          ...evt,
          startsAt: start.toISOString().slice(0, 16),
          endsAt: end ? end.toISOString().slice(0, 16) : "",
        });
      } else {
        setError("Event not found");
      }
    } catch (err) {
      setError("Failed to load event");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!event) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const response = await fetch(`/api/events/${event.publicId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.get("title"),
          description: formData.get("description") || null,
          location: formData.get("location") || null,
          startsAt: formData.get("startsAt"),
          endsAt: formData.get("endsAt") || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/admin/events/${event.publicId}`);
      } else {
        setError(data?.error?.message || "Failed to update event");
      }
    } catch (err) {
      setError("Failed to update event");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-lg animate-pulse">
        <div className="h-8 bg-surface rounded w-32" />
        <div className="h-64 bg-surface rounded" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary mb-4">{error || "Event not found"}</p>
        <Link href="/admin/events">
          <Button variant="secondary">Back to Events</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-lg">
      {/* Back button */}
      <Link href={`/admin/events/${event.publicId}`}>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Event
        </Button>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-serif text-text-primary">Edit Event</h1>
        <p className="text-text-secondary mt-2">Update event details</p>
      </div>

      {/* Reusable form */}
      <EventForm
        initialData={{
          title: event.title,
          description: event.description || "",
          location: event.location || "",
          startsAt: event.startsAt,
          endsAt: event.endsAt || "",
        }}
        cancelHref={`/admin/events/${event.publicId}`}
        submitLabel={isSubmitting ? "Saving..." : "Save Changes"}
        onSubmit={async (values) => {
          setIsSubmitting(true);
          try {
            const response = await fetch(`/api/events/${event.publicId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(values),
            });

            const data = await response.json();
            if (response.ok) {
              // navigate back to event
              router.push(`/admin/events/${event.publicId}`);
              return { ok: true, data };
            }
            return { ok: false, error: data?.error?.message || "Failed to update event" };
          } catch (err) {
            return { ok: false, error: "Failed to update event" };
          } finally {
            setIsSubmitting(false);
          }
        }}
      />
    </div>
  );
}

export default function EditEventPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <AdminShell activeSection="Events">
      <div className="space-y-lg p-lg">
        <EditEventContent params={params} />
      </div>
    </AdminShell>
  );
}
