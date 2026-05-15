"use client";

import { useActionState } from "react";
import Image from "next/image";
import { Building2, LoaderCircle, Mail, MapPin, Phone, Upload } from "lucide-react";
import {
  INITIAL_SETTINGS_ACTION_STATE,
  saveChurchProfileAction,
  uploadChurchLogoAction,
} from "@/app/admin/settings/actions";
import { Button, Card, Input, Label } from "@/components/ui";
import type { ChurchSettingsData } from "@/lib/church-settings";

type ChurchProfileCardProps = {
  settings: ChurchSettingsData;
};

export function ChurchProfileCard({ settings }: ChurchProfileCardProps) {
  const [profileState, profileAction, isProfilePending] = useActionState(
    saveChurchProfileAction,
    INITIAL_SETTINGS_ACTION_STATE,
  );
  const [logoState, logoAction, isLogoPending] = useActionState(
    uploadChurchLogoAction,
    INITIAL_SETTINGS_ACTION_STATE,
  );

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

        <form className="space-y-3 border-b border-border pb-6" action={logoAction}>
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

          {logoState.status === "error" && logoState.message ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {logoState.message}
            </p>
          ) : null}

          {logoState.status === "success" && logoState.message ? (
            <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {logoState.message}
            </p>
          ) : null}
        </form>

        <form className="space-y-6" action={profileAction}>
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

          {profileState.status === "error" && profileState.message ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {profileState.message}
            </p>
          ) : null}

          {profileState.status === "success" && profileState.message ? (
            <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {profileState.message}
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
