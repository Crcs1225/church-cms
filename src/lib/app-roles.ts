export const APP_ROLE_OPTIONS = [
  "Lead Pastor",
  "Admin",
  "Finance Lead",
  "Secretary",
  "Auditor",
] as const;

export type AppRole = (typeof APP_ROLE_OPTIONS)[number];
