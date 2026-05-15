export const APP_USER_COOKIE = "app_user_public_id";

export type Permission =
  | "dashboard:view"
  | "members:view"
  | "members:manage"
  | "finances:view"
  | "finances:manage"
  | "reports:view"
  | "events:view"
  | "events:manage"
  | "settings:view"
  | "settings:manage"
  | "settings:users"
  | "settings:finance";

export type AppRoleSlug =
  | "lead-pastor"
  | "admin"
  | "finance-lead"
  | "secretary"
  | "auditor"
  | "unknown";

const permissionMap: Record<AppRoleSlug, Permission[]> = {
  "lead-pastor": [
    "dashboard:view",
    "members:view",
    "members:manage",
    "finances:view",
    "finances:manage",
    "reports:view",
    "events:view",
    "events:manage",
    "settings:view",
    "settings:manage",
    "settings:users",
    "settings:finance",
  ],
  admin: [
    "dashboard:view",
    "members:view",
    "members:manage",
    "finances:view",
    "finances:manage",
    "reports:view",
    "events:view",
    "events:manage",
    "settings:view",
    "settings:manage",
    "settings:users",
    "settings:finance",
  ],
  "finance-lead": [
    "dashboard:view",
    "finances:view",
    "finances:manage",
    "reports:view",
    "settings:view",
    "settings:finance",
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
    "reports:view",
  ],
  unknown: [],
};

export function normalizeRole(role: string): AppRoleSlug {
  const normalized = role.trim().toLowerCase();

  switch (normalized) {
    case "lead pastor":
      return "lead-pastor";
    case "admin":
      return "admin";
    case "finance lead":
      return "finance-lead";
    case "secretary":
      return "secretary";
    case "auditor":
      return "auditor";
    default:
      return "unknown";
  }
}

export function hasPermission(role: string, permission: Permission) {
  const normalizedRole = normalizeRole(role);
  return permissionMap[normalizedRole].includes(permission);
}

export function getRequiredPermissionForPath(pathname: string): Permission | null {
  if (pathname === "/admin" || pathname.startsWith("/admin?")) {
    return "dashboard:view";
  }

  if (pathname.startsWith("/admin/settings")) {
    return "settings:view";
  }

  if (pathname.startsWith("/admin/members")) {
    return pathname === "/admin/members" || pathname.includes("/members/")
      ? "members:view"
      : "members:manage";
  }

  if (pathname.startsWith("/admin/finances/reports")) {
    return "reports:view";
  }

  if (pathname.startsWith("/admin/finances")) {
    return "finances:view";
  }

  if (pathname.startsWith("/admin/events")) {
    return "events:view";
  }

  return null;
}
