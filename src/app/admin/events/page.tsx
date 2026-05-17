import { Suspense } from "react";
import Link from "next/link";
import { getAdminViewerData } from "@/app/admin/_lib/admin-viewer";
import { getEventsListData } from "@/components/events";
import { AdminShell } from "@/components/admin";
import { EventTable } from "@/components/events";
import { Button, Card } from "@/components/ui";
import { Plus, Calendar as CalendarIcon } from "lucide-react";

export default async function EventsPage() {
  const { currentUser, activeUsers } = await getAdminViewerData();

  return (
    <AdminShell
      activeSection="Events"
      currentUser={currentUser}
      activeUsers={activeUsers}
    >
      <div className="space-y-lg p-lg">
        {/* Header */}
        <div className="flex flex-col gap-lg md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold font-serif text-text-primary">
              Events
            </h1>
            <p className="text-text-secondary mt-2">
              Manage spiritual gatherings and community events
            </p>
          </div>

          <div className="flex gap-md flex-wrap">
            <Link href="/admin/events/calendar">
              <Button variant="secondary" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>View Calendar</span>
              </Button>
            </Link>
            <Link href="/admin/events/create">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Create Event</span>
              </Button>
            </Link>
          </div>
        </div>

        <Suspense fallback={<EventsSectionFallback />}>
          <EventsListSection />
        </Suspense>
      </div>
    </AdminShell>
  );
}

function EventsSectionFallback() {
  return (
    <Card className="rounded-xl p-6">
      <div className="space-y-3">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-16 animate-pulse rounded-lg bg-surface-raised" />
        ))}
      </div>
    </Card>
  );
}

async function EventsListSection() {
  const { events } = await getEventsListData();

  return <EventTable events={events} />;
}
