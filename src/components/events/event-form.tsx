"use client";

import { useState } from "react";
import { Button, Input, Label } from "@/components/ui";
import Link from "next/link";

type EventFormValues = {
  title: string;
  description: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
};

type EventFormProps = {
  initialData?: Partial<EventFormValues>;
  onSubmit: (values: EventFormValues) => Promise<{ ok: boolean; data?: any; error?: string }>;
  submitLabel?: string;
  cancelHref?: string;
};

export default function EventForm({
  initialData,
  onSubmit,
  submitLabel = "Save",
  cancelHref = "/admin/events",
}: EventFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const values: EventFormValues = {
      title: String(formData.get("title") || ""),
      description: (formData.get("description") as string) || null,
      location: (formData.get("location") as string) || null,
      startsAt: String(formData.get("startsAt") || ""),
      endsAt: (formData.get("endsAt") as string) || null,
    };

    try {
      const res = await onSubmit(values);
      if (!res.ok) {
        setError(res.error || "An error occurred");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-lg">
      <div className="bg-surface border border-border rounded-xl p-lg space-y-lg">
        <div>
          <Label htmlFor="title">Event Title *</Label>
          <Input
            id="title"
            name="title"
            defaultValue={initialData?.title ?? ""}
            placeholder="e.g., Sunday Worship Service, Youth Group Meeting"
            required
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            defaultValue={initialData?.description ?? ""}
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
              defaultValue={initialData?.startsAt ?? ""}
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
              defaultValue={initialData?.endsAt ?? ""}
              className="mt-2"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            defaultValue={initialData?.location ?? ""}
            placeholder="e.g., Main Sanctuary, Community Center, Online"
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
        <Link href={cancelHref}>
          <Button variant="secondary">Cancel</Button>
        </Link>
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
