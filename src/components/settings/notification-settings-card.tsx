"use client";

import { useActionState } from "react";
import { BellRing, ShieldCheck, Users } from "lucide-react";
import {
  INITIAL_SETTINGS_ACTION_STATE,
  toggleNotificationSettingAction,
} from "@/app/admin/settings/actions";
import { Card } from "@/components/ui";
import type { ChurchSettingsData } from "@/lib/church-settings";

type NotificationSettingsCardProps = {
  settings: ChurchSettingsData;
};

type NotificationItem = {
  key: "dailyDigestEnabled" | "newMemberAlertsEnabled" | "lowBudgetWarningEnabled";
  title: string;
  description: string;
  enabled: boolean;
  icon: typeof BellRing;
  iconClassName: string;
};

function Switch({ checked }: { checked: boolean }) {
  return (
    <span
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-surface-raised"
      }`}
      aria-hidden
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full border border-border bg-white transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </span>
  );
}

export function NotificationSettingsCard({
  settings,
}: NotificationSettingsCardProps) {
  const [state, action, isPending] = useActionState(
    toggleNotificationSettingAction,
    INITIAL_SETTINGS_ACTION_STATE,
  );

  const items: NotificationItem[] = [
    {
      key: "dailyDigestEnabled",
      title: "Daily Digest",
      description:
        "Get a summary of new attendance and giving every morning at 8:00 AM.",
      enabled: settings.dailyDigestEnabled,
      icon: BellRing,
      iconClassName: "bg-primary/10 text-primary",
    },
    {
      key: "newMemberAlertsEnabled",
      title: "New Member Alerts",
      description:
        "Immediate email notification when a new visitor fills out a connect card.",
      enabled: settings.newMemberAlertsEnabled,
      icon: Users,
      iconClassName: "bg-warning/10 text-warning",
    },
    {
      key: "lowBudgetWarningEnabled",
      title: "Low Budget Warning",
      description:
        "Notification if an expense category exceeds 90% of its monthly allocation.",
      enabled: settings.lowBudgetWarningEnabled,
      icon: ShieldCheck,
      iconClassName: "bg-surface-raised text-text-secondary",
    },
  ];

  return (
    <Card className="overflow-hidden rounded-xl p-0">
      {items.map((item, index) => {
        const Icon = item.icon;

        return (
          <form key={item.key} action={action}>
            <input type="hidden" name="key" value={item.key} />
            <input type="hidden" name="value" value={String(!item.enabled)} />
            <button
              type="submit"
              className={`flex w-full flex-col gap-4 px-6 py-5 text-left transition-colors hover:bg-primary/5 md:flex-row md:items-center md:justify-between ${
                index > 0 ? "border-t border-border" : ""
              }`}
              disabled={isPending}
            >
              <div className="flex gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${item.iconClassName}`}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <p className="font-semibold text-text-primary">{item.title}</p>
                  <p className="mt-1 max-w-2xl text-sm text-text-secondary">
                    {item.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold tracking-widest text-text-secondary uppercase">
                  {isPending ? "Saving" : item.enabled ? "On" : "Off"}
                </span>
                <Switch checked={item.enabled} />
              </div>
            </button>
          </form>
        );
      })}
      {state.status === "error" && state.message ? (
        <div className="border-t border-border px-6 py-3 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}
    </Card>
  );
}
