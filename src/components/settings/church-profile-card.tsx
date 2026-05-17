"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Building2, LoaderCircle, Mail, MapPin, Phone, Upload } from "lucide-react";
import { Button, Card, Input, Label } from "@/components/ui";
import type { ChurchSettingsData } from "@/lib/church-settings";

type ChurchProfileCardProps = {
  settings: ChurchSettingsData;
};

export function ChurchProfileCard({ settings }: ChurchProfileCardProps) {
  const router = useRouter();
  const [isProfilePending, setIsProfilePending] = useState(false);
  const [isLogoPending, setIsLogoPending] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [logoMessage, setLogoMessage] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  async function handleLogoSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLogoPending(true);
    setLogoError(null);
    setLogoMessage(null);

    try {
      const response = await fetch("/api/settings/church-logo", {
        method: "POST",
        body: new FormData(event.currentTarget),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setLogoError(payload?.error?.message ?? "Unable to upload church logo.");
        return;
      }

      setLogoMessage("Church logo updated.");
      router.refresh();
      event.currentTarget.reset();
    } finally {
      setIsLogoPending(false);
    }
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsProfilePending(true);
    setProfileError(null);
    setProfileMessage(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/settings/church-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchName: String(formData.get("churchName") ?? ""),
          shortName: String(formData.get("shortName") ?? ""),
          contactEmail: String(formData.get("contactEmail") ?? ""),
          address: String(formData.get("address") ?? ""),
          phone: String(formData.get("phone") ?? ""),
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setProfileError(payload?.error?.message ?? "Unable to update church profile.");
        return;
      }

      setProfileMessage("Church profile updated.");
      router.refresh();
    } finally {
      setIsProfilePending(false);
    }
  }

  return (
    <Card className="rounded-xl p-6">
      <div className="space-y-6">
        <div className="flex flex-col gap-6 border-b border-border pb-6 md:flex-row md:items-start">
          <div className="space-y-3">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-surface-raised text-primary">
              {settings.logoPath ? (
                <Image
                  src={settings.logoPath}
                  alt={`${settings.shortName} logo`}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Building2 className="h-10 w-10" aria-hidden />
              )}
            </div>
          </div>
          <div>
            <p className="text-base font-semibold text-text-primary">
              Church Logo
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Upload a square PNG, JPG, or WEBP image up to 2 MB. The saved logo
              appears in the admin shell and finance reports.
            </p>
          </div>
        </div>

        <form
          className="space-y-3 border-b border-border pb-6"
          onSubmit={handleLogoSubmit}
        >
          <div className="max-w-md space-y-2">
            <Label htmlFor="settings-logo">Upload Logo</Label>
            <Input
              id="settings-logo"
              name="logo"
              type="file"
              accept="image/png,image/jpeg,image/webp"
            />
            <div className="flex justify-start">
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                disabled={isLogoPending}
              >
                {isLogoPending ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Upload className="h-4 w-4" aria-hidden />
                )}
                {isLogoPending ? "Uploading..." : "Upload Logo"}
              </Button>
            </div>
          </div>

          {logoError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {logoError}
            </p>
          ) : null}

          {logoMessage ? (
            <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {logoMessage}
            </p>
          ) : null}
        </form>

        <form className="space-y-6" onSubmit={handleProfileSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="settings-church-name">Church Name</Label>
              <Input
                id="settings-church-name"
                name="churchName"
                defaultValue={settings.churchName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-short-name">Short Name</Label>
              <Input
                id="settings-short-name"
                name="shortName"
                defaultValue={settings.shortName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-email">Contact Email</Label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral"
                  aria-hidden
                />
                <Input
                  id="settings-email"
                  name="contactEmail"
                  defaultValue={settings.contactEmail ?? ""}
                  className="pl-9"
                  type="email"
                />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="settings-address">Address</Label>
              <div className="relative">
                <MapPin
                  className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral"
                  aria-hidden
                />
                <Input
                  id="settings-address"
                  name="address"
                  defaultValue={settings.address ?? ""}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-phone">Phone</Label>
              <div className="relative">
                <Phone
                  className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral"
                  aria-hidden
                />
                <Input
                  id="settings-phone"
                  name="phone"
                  defaultValue={settings.phone ?? ""}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {profileError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {profileError}
            </p>
          ) : null}

          {profileMessage ? (
            <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {profileMessage}
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" disabled={isProfilePending}>
              {isProfilePending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
