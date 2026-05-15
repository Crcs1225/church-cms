import type { ReactNode } from "react";
import { Suspense } from "react";
import {
  CircleHelp,
  CreditCard,
} from "lucide-react";
import { AdminShell } from "@/components/admin";
import { Card, LoadingScreen } from "@/components/ui";
import { AppUsersManager } from "@/components/settings/app-users-manager";
import { ChurchProfileCard } from "@/components/settings/church-profile-card";
import { FinanceCategoriesManager } from "@/components/settings/finance-categories-manager";
import { NotificationSettingsCard } from "@/components/settings/notification-settings-card";
import { ReportSignatoriesManager } from "@/components/settings/report-signatories-manager";
import { getCurrentAppUser, hasPermission } from "@/lib/admin-access";
import { getAppUsers } from "@/lib/app-users";
import { getChurchSettings } from "@/lib/church-settings";
import { getReportSignatories } from "@/lib/report-signatories";
import { getSettingsFinanceCategories } from "@/lib/settings-finance-categories";

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="grid grid-cols-1 gap-6 border-t border-border pt-10 first:border-t-0 first:pt-0 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <h2 className="mb-2 font-display text-3xl leading-tight text-text-primary">
          {title}
        </h2>
        <p className="max-w-md text-sm leading-6 text-text-secondary">
          {description}
        </p>
      </div>
      <div className="lg:col-span-8">{children}</div>
    </section>
  );
}

function SettingsSectionFallback({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <SettingsSection title={title} description={description}>
      <Card className="rounded-xl p-6">
        <div className="space-y-4">
          <div className="h-3 w-32 animate-pulse rounded-full bg-surface-raised" />
          <div className="h-9 w-56 animate-pulse rounded-full bg-surface-raised" />
          <div className="h-3 w-full animate-pulse rounded-full bg-surface-raised" />
          <div className="h-3 w-5/6 animate-pulse rounded-full bg-surface-raised" />
        </div>
      </Card>
    </SettingsSection>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <LoadingScreen
          compact
          className="px-6 py-10"
          title="Loading Settings"
          description="Fetching church profile, signatories, users, categories, and role-aware settings controls."
        />
      }
    >
      <SettingsPageContent />
    </Suspense>
  );
}

async function SettingsPageContent() {
  const [churchSettings, currentUser] = await Promise.all([
    getChurchSettings(),
    getCurrentAppUser(),
  ]);
  const canManageChurchProfile = hasPermission(
    currentUser,
    "settings:church-profile",
  );
  const canManageUsers = hasPermission(currentUser, "settings:users");
  const canManageCategories = hasPermission(currentUser, "settings:categories");
  const canManageNotifications = hasPermission(
    currentUser,
    "settings:notifications",
  );
  const canManageSignatories = hasPermission(
    currentUser,
    "settings:signatories",
  );

  return (
    <AdminShell activeSection="">
      <div className="mx-auto max-w-[1200px] px-6 py-10">
        <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-semibold tracking-[0.24em] text-primary uppercase">
              Settings
            </p>
            <h1 className="font-display text-5xl leading-tight text-text-primary">
              Management Settings
            </h1>
            <p className="mt-3 max-w-2xl text-base text-text-secondary">
              Operational settings for {churchSettings.shortName}. Core profile
              and report signature records are now persisted in the database.
            </p>
          </div>
          <div className="rounded-lg border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
            Church profile and report signatories save to the database.
          </div>
        </header>

        <div className="space-y-10">
          <SettingsSection
            title="Church Profile"
            description="Update organizational details and visual identity across the management console."
          >
            {canManageChurchProfile ? (
              <ChurchProfileCard settings={churchSettings} />
            ) : (
              <Card className="rounded-xl p-6 text-sm text-text-secondary">
                Your current role can view settings, but it cannot edit church profile
                records.
              </Card>
            )}
          </SettingsSection>

          {canManageUsers ? (
            <Suspense
              fallback={
                <SettingsSectionFallback
                  title="User Management"
                  description="Control who has access to the administrative dashboard and manage their permission levels."
                />
              }
            >
              <UserManagementSection />
            </Suspense>
          ) : null}

          <Suspense
            fallback={
              <SettingsSectionFallback
                title="Financial Settings"
                description="Define categories for tithes, offerings, and operational expenses to keep accounting organized."
              />
            }
          >
            <FinancialSettingsSection canManageCategories={canManageCategories} />
          </Suspense>

          <SettingsSection
            title="Notifications"
            description="Manage alerts so the admin team stays informed about important church activity and finance milestones."
          >
            {canManageNotifications ? (
              <NotificationSettingsCard settings={churchSettings} />
            ) : (
              <Card className="rounded-xl p-6 text-sm text-text-secondary">
                Your current role cannot change notification delivery settings.
              </Card>
            )}

            <Card className="mt-6 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <CircleHelp className="mt-0.5 h-5 w-5 text-text-secondary" aria-hidden />
                <div>
                  <p className="font-semibold text-text-primary">
                    Next settings step
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">
                    Logo uploads and role-based settings access are now live.
                    Remaining settings work is deeper validation and optional
                    storage cleanup.
                  </p>
                </div>
              </div>
            </Card>
          </SettingsSection>

          {canManageSignatories ? (
            <Suspense
              fallback={
                <SettingsSectionFallback
                  title="Report Signatories"
                  description="These roles are stored in the database and used for finance report signature blocks."
                />
              }
            >
              <ReportSignatoriesSection />
            </Suspense>
          ) : null}
        </div>
      </div>
    </AdminShell>
  );
}

async function UserManagementSection() {
  const appUsers = await getAppUsers();

  return (
    <SettingsSection
      title="User Management"
      description="Control who has access to the administrative dashboard and manage their permission levels."
    >
      <AppUsersManager users={appUsers} />
    </SettingsSection>
  );
}

async function FinancialSettingsSection({
  canManageCategories,
}: {
  canManageCategories: boolean;
}) {
  const financeCategories = canManageCategories
    ? await getSettingsFinanceCategories()
    : null;

  return (
    <SettingsSection
      title="Financial Settings"
      description="Define categories for tithes, offerings, and operational expenses to keep accounting organized."
    >
      {canManageCategories && financeCategories ? (
        <FinanceCategoriesManager
          givingCategories={financeCategories.givingCategories}
          expenseCategories={financeCategories.expenseCategories}
        />
      ) : (
        <Card className="rounded-xl p-6 text-sm text-text-secondary">
          Your current role cannot change giving or expense categories.
        </Card>
      )}

      <Card className="mt-6 rounded-xl border-l-4 border-l-accent p-6">
        <div className="flex items-start gap-3">
          <CreditCard className="mt-0.5 h-5 w-5 text-primary" aria-hidden />
          <div>
            <p className="font-semibold text-text-primary">
              Finance settings status
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Category changes here immediately affect the finance screens,
              API validation, and CSV/PDF reporting filters.
            </p>
          </div>
        </div>
      </Card>
    </SettingsSection>
  );
}

async function ReportSignatoriesSection() {
  const signatories = await getReportSignatories();

  return (
    <SettingsSection
      title="Report Signatories"
      description="These roles are stored in the database and used for finance report signature blocks."
    >
      <ReportSignatoriesManager signatories={signatories} />
    </SettingsSection>
  );
}
