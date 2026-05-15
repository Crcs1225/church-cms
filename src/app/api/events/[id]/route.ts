import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { apiError, parseDate } from "@/lib/api-utils";
import { requireRequestPermission } from "@/lib/admin-access";
import { prisma } from "@/lib/prisma";

type EventRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function formatEvent(event: {
  publicId: string;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: Date;
  endsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    publicId: event.publicId,
    title: event.title,
    description: event.description,
    location: event.location,
    startsAt: event.startsAt.toISOString(),
    endsAt: event.endsAt?.toISOString() ?? null,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  };
}

export async function GET(
  request: NextRequest,
  { params }: EventRouteContext
) {
  const permission = await requireRequestPermission(request, "events:view");

  if (permission.response) {
    return permission.response;
  }

  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { publicId: id },
  });

  if (!event) {
    return apiError("Event not found.", 404, "NOT_FOUND");
  }

  return NextResponse.json({ event: formatEvent(event) });
}

export async function PATCH(
  request: NextRequest,
  { params }: EventRouteContext
) {
  const permission = await requireRequestPermission(request, "events:manage");

  if (permission.response) {
    return permission.response;
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return apiError("Request body must be valid JSON.");
  }

  const event = await prisma.event.findUnique({
    where: { publicId: id },
  });

  if (!event) {
    return apiError("Event not found.", 404, "NOT_FOUND");
  }

  const updateData: Prisma.EventUpdateInput = {};
  if ("title" in body && typeof body.title === "string") {
    const title = body.title.trim();

    if (!title) {
      return apiError("Event title is required.");
    }

    updateData.title = title;
  }
  if ("description" in body) {
    updateData.description =
      typeof body.description === "string" ? body.description.trim() || null : null;
  }
  if ("location" in body) {
    updateData.location =
      typeof body.location === "string" ? body.location.trim() || null : null;
  }
  if ("startsAt" in body) {
    const startsAt = parseDate(body.startsAt, null);

    if (!startsAt) {
      return apiError("Event start date must be valid.");
    }

    updateData.startsAt = startsAt;
  }
  if ("endsAt" in body) {
    const endsAt = parseDate(body.endsAt, null);

    if (body.endsAt && !endsAt) {
      return apiError("Event end date must be valid.");
    }

    updateData.endsAt = endsAt;
  }

  const nextStartsAt =
    updateData.startsAt instanceof Date ? updateData.startsAt : event.startsAt;
  const nextEndsAt =
    "endsAt" in updateData ? updateData.endsAt : event.endsAt;

  if (nextEndsAt && nextEndsAt < nextStartsAt) {
    return apiError("End date must be after start date.");
  }

  const updated = await prisma.event.update({
    where: { publicId: id },
    data: updateData,
  });

  await prisma.activityLog.create({
    data: {
      action: "EVENT_UPDATE",
      entityType: "event",
      entityPublicId: updated.publicId,
      description: `Updated event: ${updated.title}`,
    },
  });

  return NextResponse.json({ event: formatEvent(updated) });
}

export async function DELETE(
  request: NextRequest,
  { params }: EventRouteContext
) {
  const permission = await requireRequestPermission(request, "events:manage");

  if (permission.response) {
    return permission.response;
  }

  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { publicId: id },
  });

  if (!event) {
    return apiError("Event not found.", 404, "NOT_FOUND");
  }

  await prisma.event.delete({
    where: { publicId: id },
  });

  await prisma.activityLog.create({
    data: {
      action: "EVENT_DELETE",
      entityType: "event",
      entityPublicId: event.publicId,
      description: `Deleted event: ${event.title}`,
    },
  });

  return NextResponse.json(
    { message: "Event deleted successfully." },
    { status: 200 }
  );
}
