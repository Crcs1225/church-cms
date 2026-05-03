"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button, Input, Label, Modal } from "@/components/ui";

type ModalButtonProps = {
  floating?: boolean;
  label?: string;
};

function modalButtonClassName(floating?: boolean) {
  return floating
    ? "fixed right-8 bottom-8 z-50 h-14 w-14 rounded-full p-0 shadow-2xl"
    : undefined;
}

export function AddEventDialogButton({
  floating,
  label = "Create Event",
}: ModalButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    setError(null);
    setIsSubmitting(true);

    const response = await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: formData.get("title"),
        description: formData.get("description"),
        location: formData.get("location"),
        startsAt: formData.get("startsAt"),
        endsAt: formData.get("endsAt") || null,
      }),
    });

    const payload = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(payload?.error?.message ?? "Unable to create event.");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button
        size={floating ? "md" : "lg"}
        className={modalButtonClassName(floating)}
        aria-label={floating ? label : undefined}
        onClick={() => setOpen(true)}
      >
        {floating ? (
          <Plus className="h-6 w-6" aria-hidden />
        ) : (
          <>
            <Plus className="h-5 w-5" aria-hidden />
            {label}
          </>
        )}
      </Button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Create New Event"
        description="Add a new event to the church calendar."
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" form="event-create-form" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Event"}
            </Button>
          </>
        }
      >
        <form id="event-create-form" className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="event-title">Event Title *</Label>
            <Input
              id="event-title"
              name="title"
              placeholder="e.g., Sunday Worship Service"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-description">Description</Label>
            <textarea
              id="event-description"
              name="description"
              placeholder="What is this event about?"
              className="w-full h-24 px-3 py-2 rounded-md border border-border bg-surface text-base focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-primary"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="event-start">Start Date & Time *</Label>
              <Input
                id="event-start"
                name="startsAt"
                type="datetime-local"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-end">End Date & Time</Label>
              <Input
                id="event-end"
                name="endsAt"
                type="datetime-local"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-location">Location</Label>
            <Input
              id="event-location"
              name="location"
              placeholder="e.g., Main Sanctuary, Community Center"
            />
          </div>

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </form>
      </Modal>
    </>
  );
}
