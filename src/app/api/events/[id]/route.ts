import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

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
  { params }: { params: { id: string } }
) {
  const { id } = params;

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
  { params }: { params: { id: string } }
) {
  const { id } = params;
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

  const updateData: any = {};
  if ("title" in body && typeof body.title === "string") {
    updateData.title = body.title.trim();
  }
  if ("description" in body) {
    updateData.description =
      typeof body.description === "string" ? body.description.trim() || null : null;
  }
  if ("location" in body) {
    updateData.location =
      typeof body.location === "string" ? body.location.trim() || null : null;
  }
  if ("startsAt" in body && body.startsAt) {
    updateData.startsAt = new Date(body.startsAt);
  }
  if ("endsAt" in body) {
    updateData.endsAt = body.endsAt ? new Date(body.endsAt) : null;
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
  { params }: { params: { id: string } }
) {
  const { id } = params;

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
