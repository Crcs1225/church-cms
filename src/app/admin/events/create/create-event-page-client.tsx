"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import EventForm, { type EventFormValues } from "@/components/events/event-form";
import { Button } from "@/components/ui";
import { CHURCH_NAME_SHORT } from "@/lib/branding";

export function CreateEventPageClient() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(values: EventFormValues) {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/admin/events/${data.event.publicId}`);
        return { ok: true, data };
      }

      return {
        ok: false,
        error: data?.error?.message || "Failed to create event",
      };
    } catch {
      return { ok: false, error: "Failed to create event" };
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-lg p-lg">
      <Link href="/admin/events">
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold font-serif text-text-primary">
          Create New Event
        </h1>
        <p className="text-text-secondary mt-2">
          Add a gathering or activity to the {CHURCH_NAME_SHORT} calendar
        </p>
      </div>

      <EventForm
        onSubmit={handleSubmit}
        submitLabel={isSubmitting ? "Creating..." : "Create Event"}
        cancelHref="/admin/events"
      />
    </div>
  );
}
