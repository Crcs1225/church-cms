"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminShell } from "@/components/admin";
import { Button, Input, Label } from "@/components/ui";

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
          <Button variant="outline">Back to Events</Button>
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
        <h1 className="text-3xl font-bold font-serif text-text-primary">
          Edit Event
        </h1>
        <p className="text-text-secondary mt-2">Update event details</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-lg">
        <div className="bg-surface border border-border rounded-xl p-lg space-y-lg">
          <div>
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              name="title"
              defaultValue={event.title}
              required
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              defaultValue={event.description || ""}
              placeholder="What is this event about? Include any relevant details or context."
              rows={5}
              className="w-full px-3 py-2 rounded-md border border-border bg-white text-base focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-primary mt-2 font-body"
            />
          </div>

          <div className="grid gap-lg md:grid-cols-2">
            <div>
              <Label htmlFor="startsAt">Start Date & Time *</Label>
              <Input
                id="startsAt"
                name="startsAt"
                type="datetime-local"
                defaultValue={event.startsAt}
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="endsAt">End Date & Time</Label>
              <Input
                id="endsAt"
                name="endsAt"
                type="datetime-local"
                defaultValue={event.endsAt || ""}
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              defaultValue={event.location || ""}
              className="mt-2"
            />
          </div>
        </div>

        {error && (
          <div className="p-md rounded-md border border-red-200 bg-red-50 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-md">
          <Link href={`/admin/events/${event.publicId}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
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
