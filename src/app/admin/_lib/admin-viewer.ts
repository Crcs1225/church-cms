import { cookies } from "next/headers";
import {
  ACTIVE_APP_USER_COOKIE,
  getActiveAppUsers,
  resolveCurrentUserByPublicId,
} from "@/lib/admin-access";

export async function getAdminViewerData() {
  const cookieStore = await cookies();
  const publicId = cookieStore.get(ACTIVE_APP_USER_COOKIE)?.value ?? null;
  const [currentUser, activeUsers] = await Promise.all([
    resolveCurrentUserByPublicId(publicId),
    getActiveAppUsers(),
  ]);

  return {
    currentUser,
    activeUsers,
  };
}
