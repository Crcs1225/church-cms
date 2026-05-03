import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "CONFLICT"
  | "NOT_FOUND"
  | "SERVER_ERROR";

export function apiError(
  message: string,
  status = 400,
  code: ApiErrorCode = "BAD_REQUEST",
) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export function parseAmountToCents(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value * 100);
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.replace(/[$,\s]/g, "");
  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return Math.round(amount * 100);
}

export function parseDate(value: unknown, fallback: Date | null = new Date()) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return fallback;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function getPagination(searchParams: URLSearchParams) {
  const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
  const pageSize = Math.min(
    Math.max(Number(searchParams.get("pageSize") ?? 10), 1),
    100,
  );

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
  };
}

export function splitFullName(name: unknown) {
  if (typeof name !== "string") {
    return null;
  }

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return null;
  }

  if (parts.length === 1) {
    return {
      firstName: parts[0],
      lastName: "",
    };
  }

  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts.at(-1) ?? "",
  };
}
