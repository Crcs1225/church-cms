import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { apiError, getPagination, parseDate } from "@/lib/api-utils";
import { requireRequestPermission } from "@/lib/admin-access";
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

export async function GET(request: NextRequest) {
  const permission = await requireRequestPermission(request, "events:view");

  if (permission.response) {
    return permission.response;
  }

  const { searchParams } = new URL(request.url);
  const { page, pageSize, skip } = getPagination(searchParams);
  const query = searchParams.get("query")?.trim();
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  const where: Prisma.EventWhereInput = {};

  if (query) {
    where.OR = [
      { title: { contains: query } },
      { description: { contains: query } },
      { location: { contains: query } },
    ];
  }

  if (month && year) {
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);

    where.startsAt = {
      gte: startDate,
      lte: endDate,
    };
  }

  const [events, total] = await prisma.$transaction([
    prisma.event.findMany({
      where,
      orderBy: [{ startsAt: "desc" }, { id: "desc" }],
      skip,
      take: pageSize,
    }),
    prisma.event.count({ where }),
  ]);

  return NextResponse.json({
    events: events.map(formatEvent),
    pagination: {
      page,
      pageSize,
      total,
      pageCount: Math.ceil(total / pageSize),
    },
  });
}

export async function POST(request: NextRequest) {
  const permission = await requireRequestPermission(request, "events:manage");

  if (permission.response) {
    return permission.response;
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return apiError("Request body must be valid JSON.");
  }

  const title =
    "title" in body && typeof body.title === "string" ? body.title.trim() : "";
  const description =
    "description" in body && typeof body.description === "string"
      ? body.description.trim() || null
      : null;
  const location =
    "location" in body && typeof body.location === "string"
      ? body.location.trim() || null
      : null;
  const startsAt = parseDate("startsAt" in body ? body.startsAt : null);
  const endsAt = parseDate("endsAt" in body ? body.endsAt : null, null);

  if (!title) {
    return apiError("Event title is required.");
  }

  if (!startsAt) {
    return apiError("Event start date must be valid.");
  }

  if (endsAt && endsAt < startsAt) {
    return apiError("End date must be after start date.");
  }

  try {
    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        startsAt,
        endsAt,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "EVENT_CREATE",
        entityType: "event",
        entityPublicId: event.publicId,
        description: `Created event: ${title}`,
      },
    });

    return NextResponse.json({ event: formatEvent(event) }, { status: 201 });
  } catch (error) {
    throw error;
  }
}
