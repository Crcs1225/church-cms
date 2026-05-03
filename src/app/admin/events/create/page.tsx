"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminShell } from "@/components/admin";
import { Button, Input, Label } from "@/components/ui";
import { useState, FormEvent } from "react";

export default function CreateEventPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const response = await fetch("/api/events", {
        method: "POST",
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
        router.push(`/admin/events/${data.event.publicId}`);
      } else {
        setError(data?.error?.message || "Failed to create event");
      }
    } catch (err) {
      setError("Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  }

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
        <div>
          <h1 className="text-3xl font-bold font-serif text-text-primary">
            Create New Event
          </h1>
          <p className="text-text-secondary mt-2">
            Add a gathering or activity to the Grace Community calendar
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-lg">
          <div className="bg-surface border border-border rounded-xl p-lg space-y-lg">
            {/* Event title */}
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Sunday Worship Service, Youth Group Meeting"
                required
                className="mt-2"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                placeholder="What is this event about? Include any relevant details or context."
                rows={5}
                className="w-full px-3 py-2 rounded-md border border-border bg-white text-base focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-primary mt-2 font-body"
              />
            </div>

            {/* Date and time */}
            <div className="grid gap-lg md:grid-cols-2">
              <div>
                <Label htmlFor="startsAt">Start Date & Time *</Label>
                <Input
                  id="startsAt"
                  name="startsAt"
                  type="datetime-local"
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
                  className="mt-2"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="e.g., Main Sanctuary, Community Center, Online"
                className="mt-2"
              />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-md rounded-md border border-red-200 bg-red-50 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Form actions */}
          <div className="flex gap-md">
            <Link href="/admin/events">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting} size="lg">
              {isSubmitting ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
