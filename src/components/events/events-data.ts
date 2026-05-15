import { prisma } from "@/lib/prisma";

export type EventListRow = {
  publicId: string;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
};

export type EventsListData = {
  events: EventListRow[];
  totalEvents: number;
  upcomingEvents: number;
};

export async function getEventsListData(): Promise<EventsListData> {
  const now = new Date();
  const [events, totalEvents, upcomingEvents] = await prisma.$transaction([
    prisma.event.findMany({
      orderBy: [{ startsAt: "asc" }, { id: "asc" }],
      take: 50,
      select: {
        publicId: true,
        title: true,
        description: true,
        location: true,
        startsAt: true,
        endsAt: true,
      },
    }),
    prisma.event.count(),
    prisma.event.count({
      where: {
        startsAt: {
          gte: now,
        },
      },
    }),
  ]);

  return {
    events: events.map((event: (typeof events)[number]) => ({
      publicId: event.publicId,
      title: event.title,
      description: event.description,
      location: event.location,
      startsAt: event.startsAt.toISOString(),
      endsAt: event.endsAt?.toISOString() ?? null,
    })),
    totalEvents,
    upcomingEvents,
  };
}
