"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Camera,
  Info,
  Mail,
  MapPin,
  Phone,
  UploadCloud,
} from "lucide-react";
import { Avatar, Button, Card, Input, Label } from "@/components/ui";

export type MemberFormValues = {
  publicId?: string;
  name: string;
  email: string;
  phone: string;
  birthday: string;
  memberType: string;
  address: string;
  notes: string;
};

type MemberFormProps = {
  mode?: "create" | "edit";
  initialValues?: MemberFormValues;
  cancelHref?: string;
};

const emptyValues: MemberFormValues = {
  name: "",
  email: "",
  phone: "",
  birthday: "",
  memberType: "",
  address: "",
  notes: "",
};

function normalizeValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export function MemberForm({
  mode = "create",
  initialValues = emptyValues,
  cancelHref,
}: MemberFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    setError(null);
    setIsSubmitting(true);

    const currentValues: MemberFormValues = {
      publicId: initialValues.publicId,
      name: normalizeValue(formData.get("name")),
      email: normalizeValue(formData.get("email")),
      phone: normalizeValue(formData.get("phone")),
      birthday: normalizeValue(formData.get("birthday")),
      memberType: normalizeValue(formData.get("memberType")),
      address: normalizeValue(formData.get("address")),
      notes: normalizeValue(formData.get("notes")),
    };

    const requestBody =
      mode === "edit"
        ? Object.fromEntries(
            Object.entries(currentValues).filter(([key, value]) => {
              if (key === "publicId") {
                return false;
              }

              return value !== initialValues[key as keyof MemberFormValues];
            }),
          )
        : {
            name: currentValues.name,
            email: currentValues.email,
            phone: currentValues.phone,
            birthday: currentValues.birthday,
            memberType: currentValues.memberType,
            address: currentValues.address,
            notes: currentValues.notes,
          };

    if (mode === "edit" && Object.keys(requestBody).length === 0) {
      setIsSubmitting(false);
      router.push(`/admin/members/${initialValues.publicId}`);
      return;
    }

    const response = await fetch(
      mode === "edit"
        ? `/api/members/${initialValues.publicId}`
        : "/api/members",
      {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      },
    );

    const payload = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(payload?.error?.message ?? "Unable to save member.");
      return;
    }

    router.push(`/admin/members/${payload.member.publicId}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="relative overflow-hidden p-0">
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-primary" />
        <div className="p-6">
          <div className="mb-8">
            <h3 className="mb-2 font-display text-3xl text-text-primary">
              Member Details
            </h3>
            <p className="text-text-secondary">
              {mode === "edit"
                ? "Update this member record. Only changed fields will be sent to the database."
                : "Create a new entry in the community registry. All fields marked with an asterisk are required."}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center">
              <Avatar name="New Member" className="h-20 w-20 text-xl" />
              <div className="flex-1">
                <Label htmlFor="member-photo">Profile Image</Label>
                <p className="mt-1 text-sm text-text-secondary">
                  Add a clear member photo for the directory.
                </p>
                <label
                  htmlFor="member-photo"
                  className="mt-3 inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-raised"
                >
                  <UploadCloud className="h-4 w-4" aria-hidden />
                  Choose image
                </label>
                <input
                  id="member-photo"
                  name="photo"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                />
              </div>
              <Camera className="hidden h-6 w-6 text-neutral sm:block" aria-hidden />
            </div>

            <div className="space-y-2">
              <Label htmlFor="member-name">Full Name *</Label>
              <Input
                id="member-name"
                name="name"
                defaultValue={initialValues.name}
                placeholder="E.g. Julian Stone"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="member-email">Email Address *</Label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral"
                    aria-hidden
                  />
                  <Input
                    id="member-email"
                    name="email"
                    className="pl-9"
                    defaultValue={initialValues.email}
                    placeholder="julian@example.com"
                    type="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="member-phone">Phone Number</Label>
                <div className="relative">
                  <Phone
                    className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral"
                    aria-hidden
                  />
                  <Input
                    id="member-phone"
                    name="phone"
                    className="pl-9"
                    defaultValue={initialValues.phone}
                    placeholder="+1 (555) 000-0000"
                    type="tel"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="member-birthday">Birthday</Label>
              <div className="relative">
                <CalendarDays
                  className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral"
                  aria-hidden
                />
                <Input
                  id="member-birthday"
                  name="birthday"
                  className="pl-9"
                  defaultValue={initialValues.birthday}
                  type="date"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="member-type">Member Type</Label>
              <select
                id="member-type"
                name="memberType"
                defaultValue={initialValues.memberType}
                aria-label="Select member type"
                title="Select member type"
                className="h-10 w-full rounded-md border border-border bg-surface px-3 text-base text-text-primary outline-none transition-all focus:border-primary focus:ring-3 focus:ring-focus-ring"
              >
                <option value="">Select member type</option>
                <option value="youth">Youth</option>
                <option value="children">Children</option>
                <option value="women">Women</option>
                <option value="men">Men</option>
              </select>
              <p className="text-xs text-text-secondary">
                Used for ministry grouping, filters, and reports.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="member-address">Home Address</Label>
              <div className="relative">
                <MapPin
                  className="pointer-events-none absolute top-3 left-3 h-4 w-4 text-neutral"
                  aria-hidden
                />
                <textarea
                  id="member-address"
                  name="address"
                  defaultValue={initialValues.address}
                  className="min-h-20 w-full resize-none rounded-md border border-border bg-surface py-3 pr-4 pl-9 text-base text-text-primary outline-none transition-all placeholder:text-neutral focus:border-primary focus:ring-3 focus:ring-focus-ring"
                  placeholder="Street, City, State, ZIP"
                  rows={2}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="member-notes">Internal Notes</Label>
              <textarea
                id="member-notes"
                name="notes"
                defaultValue={initialValues.notes}
                className="min-h-32 w-full resize-none rounded-md border border-border bg-surface px-3 py-3 text-base text-text-primary outline-none transition-all placeholder:text-neutral focus:border-primary focus:ring-3 focus:ring-focus-ring"
                placeholder="Add any relevant community details or history..."
                rows={4}
              />
            </div>

            {error ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 md:flex-row md:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  cancelHref ? router.push(cancelHref) : router.back()
                }
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? mode === "edit"
                    ? "Updating..."
                    : "Saving..."
                  : mode === "edit"
                    ? "Update Member"
                    : "Save Member"}
              </Button>
            </div>
          </form>
        </div>
      </Card>

      <div className="mt-8 flex items-start gap-4 rounded-lg border border-orange-100 bg-orange-50 p-4">
        <Info className="h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div>
          <h4 className="text-sm font-semibold text-orange-950">Privacy Notice</h4>
          <p className="mt-1 text-xs leading-relaxed text-orange-900/80">
            Data entered here will be stored in accordance with the church
            privacy policy. Ensure you have the member&apos;s consent before
            adding personal contact information.
          </p>
        </div>
      </div>
    </div>
  );
}
