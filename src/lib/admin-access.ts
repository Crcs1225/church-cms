import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { apiError, type ApiErrorCode } from "@/lib/api-utils";
import { APP_ROLE_OPTIONS, type AppRole } from "@/lib/app-roles";
import { prisma } from "@/lib/prisma";

export const ACTIVE_APP_USER_COOKIE = "active_admin_user";

export type AppPermission =
  | "dashboard:view"
  | "members:view"
  | "members:manage"
  | "finances:view"
  | "finances:manage"
  | "finances:export"
  | "events:view"
  | "events:manage"
  | "settings:view"
  | "settings:church-profile"
  | "settings:notifications"
  | "settings:signatories"
  | "settings:categories"
  | "settings:users";

export type AdminUserAccess = {
  publicId: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
};

type PermissionFailure = {
  message: string;
  status: number;
  code: ApiErrorCode;
};

const rolePermissionMap: Record<string, AppPermission[]> = {
  lead_pastor: [
    "dashboard:view",
    "members:view",
    "members:manage",
    "finances:view",
    "finances:manage",
    "finances:export",
    "events:view",
    "events:manage",
    "settings:view",
    "settings:church-profile",
    "settings:notifications",
    "settings:signatories",
    "settings:categories",
    "settings:users",
  ],
  admin: [
    "dashboard:view",
    "members:view",
    "members:manage",
    "finances:view",
    "finances:manage",
    "finances:export",
    "events:view",
    "events:manage",
    "settings:view",
    "settings:church-profile",
    "settings:notifications",
    "settings:signatories",
    "settings:categories",
    "settings:users",
  ],
  finance_lead: [
    "dashboard:view",
    "finances:view",
    "finances:manage",
    "finances:export",
    "settings:view",
    "settings:signatories",
    "settings:categories",
  ],
  secretary: [
    "dashboard:view",
    "members:view",
    "members:manage",
    "events:view",
    "events:manage",
  ],
  auditor: [
    "dashboard:view",
    "finances:view",
    "finances:export",
  ],
};

function appUserSelect() {
  return {
    publicId: true,
    fullName: true,
    email: true,
    role: true,
    status: true,
  } as const;
}

export function normalizeRole(role: string) {
  return role
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function isValidAppRole(role: string): role is AppRole {
  return APP_ROLE_OPTIONS.includes(role as AppRole);
}

export function getPermissionsForRole(role: string) {
  return rolePermissionMap[normalizeRole(role)] ?? [];
}

export function hasPermission(
  user: Pick<AdminUserAccess, "role" | "status"> | null,
  permission: AppPermission,
) {
  if (!user || user.status !== "active") {
    return false;
  }

  return getPermissionsForRole(user.role).includes(permission);
}

export function canAccessAdminPath(
  user: Pick<AdminUserAccess, "role" | "status"> | null,
  pathname: string,
) {
  if (!user || user.status !== "active") {
    return false;
  }

  if (
    pathname === "/admin" ||
    pathname.startsWith("/admin?")
  ) {
    return hasPermission(user, "dashboard:view");
  }

  if (pathname.startsWith("/admin/members")) {
    return hasPermission(user, "members:view");
  }

  if (pathname.startsWith("/admin/finances")) {
    return hasPermission(user, "finances:view");
  }

  if (pathname.startsWith("/admin/events")) {
    return hasPermission(user, "events:view");
  }

  if (pathname.startsWith("/admin/settings")) {
    return hasPermission(user, "settings:view");
  }

  return false;
}

export function getDefaultAdminPath(
  user: Pick<AdminUserAccess, "role" | "status"> | null,
) {
  if (hasPermission(user, "dashboard:view")) {
    return "/admin";
  }

  if (hasPermission(user, "members:view")) {
    return "/admin/members";
  }

  if (hasPermission(user, "finances:view")) {
    return "/admin/finances";
  }

  if (hasPermission(user, "events:view")) {
    return "/admin/events";
  }

  if (hasPermission(user, "settings:view")) {
    return "/admin/settings";
  }

  return "/admin";
}

export async function getActiveAppUsers(): Promise<AdminUserAccess[]> {
  return prisma.appUser.findMany({
    where: {
      status: "active",
    },
    orderBy: [{ role: "asc" }, { fullName: "asc" }],
    select: appUserSelect(),
  });
}

async function findFallbackAppUser() {
  return prisma.appUser.findFirst({
    where: {
      status: "active",
    },
    orderBy: [{ role: "asc" }, { fullName: "asc" }],
    select: appUserSelect(),
  });
}

async function findAppUserByPublicId(publicId: string) {
  return prisma.appUser.findUnique({
    where: { publicId },
    select: appUserSelect(),
  });
}

async function resolveCurrentUserByPublicId(publicId: string | null) {
  if (publicId) {
    const user = await findAppUserByPublicId(publicId);

    if (user?.status === "active") {
      return user;
    }
  }

  return findFallbackAppUser();
}

export async function getCurrentAppUser(): Promise<AdminUserAccess | null> {
  const cookieStore = await cookies();
  const publicId = cookieStore.get(ACTIVE_APP_USER_COOKIE)?.value ?? null;

  return resolveCurrentUserByPublicId(publicId);
}

export async function resolveRequestAppUser(
  request: NextRequest,
): Promise<AdminUserAccess | null> {
  const publicId = request.cookies.get(ACTIVE_APP_USER_COOKIE)?.value ?? null;

  return resolveCurrentUserByPublicId(publicId);
}

function permissionDeniedMessage(permission: AppPermission) {
  switch (permission) {
    case "members:view":
    case "members:manage":
      return "Your role does not allow member management.";
    case "finances:view":
    case "finances:manage":
    case "finances:export":
      return "Your role does not allow finance access.";
    case "events:view":
    case "events:manage":
      return "Your role does not allow event management.";
    case "settings:view":
    case "settings:church-profile":
    case "settings:notifications":
    case "settings:signatories":
    case "settings:categories":
    case "settings:users":
      return "Your role does not allow this settings action.";
    default:
      return "Your role does not allow this action.";
  }
}

function getPermissionFailure(
  user: AdminUserAccess | null,
  permission: AppPermission,
): PermissionFailure | null {
  if (!user) {
    return {
      message: "No active admin user is available.",
      status: 403,
      code: "SERVER_ERROR",
    };
  }

  if (user.status !== "active") {
    return {
      message: "The selected admin user is inactive.",
      status: 403,
      code: "BAD_REQUEST",
    };
  }

  if (!hasPermission(user, permission)) {
    return {
      message: permissionDeniedMessage(permission),
      status: 403,
      code: "BAD_REQUEST",
    };
  }

  return null;
}

export async function requireRequestPermission(
  request: NextRequest,
  permission: AppPermission,
) {
  const user = await resolveRequestAppUser(request);
  const failure = getPermissionFailure(user, permission);

  if (failure) {
    return {
      user: null,
      response: apiError(failure.message, failure.status, failure.code),
    };
  }

  return {
    user,
    response: null,
  };
}

export function jsonWithActiveUserCookie(
  body: object,
  publicId: string,
  init?: ResponseInit,
) {
  const response = NextResponse.json(body, init);
  response.cookies.set(ACTIVE_APP_USER_COOKIE, publicId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

export function clearActiveUserCookie(response: NextResponse) {
  response.cookies.set(ACTIVE_APP_USER_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
