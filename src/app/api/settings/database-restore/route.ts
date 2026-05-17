import { NextRequest, NextResponse } from "next/server";
import { requireRequestPermission } from "@/lib/admin-access";
import {
  cleanupTemporarySqliteBackup,
  createPreRestoreSafetyBackup,
  replaceSqliteDatabaseFromBackupFile,
  resolveSqliteDatabasePath,
  validateSqliteBackupFile,
  writeRestoreActivityLog,
  writeUploadedBackupToTempFile,
} from "@/lib/sqlite-backup";
import { prisma } from "@/lib/prisma";

function redirectToSettings(request: NextRequest, status: "success" | "error", message: string) {
  const url = new URL("/admin/settings", request.url);
  url.searchParams.set("backupRestoreStatus", status);
  url.searchParams.set("backupRestoreMessage", message);

  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: NextRequest) {
  const permission = await requireRequestPermission(
    request,
    "settings:backup-restore",
  );

  if (permission.response) {
    return permission.response;
  }

  const formData = await request.formData();
  const confirmation = String(formData.get("confirmation") ?? "").trim();
  const file = formData.get("backupFile");

  if (confirmation !== "RESTORE") {
    return redirectToSettings(
      request,
      "error",
      'Type "RESTORE" to confirm database replacement.',
    );
  }

  if (!(file instanceof File) || file.size === 0) {
    return redirectToSettings(request, "error", "A SQLite backup file is required.");
  }

  const tempPath = await writeUploadedBackupToTempFile(file);
  const validation = validateSqliteBackupFile(tempPath);

  if (!validation.ok) {
    await cleanupTemporarySqliteBackup(tempPath);
    return redirectToSettings(
      request,
      "error",
      validation.message ?? "Backup file is invalid.",
    );
  }

  const safetyBackupPath = await createPreRestoreSafetyBackup();

  try {
    await prisma.$disconnect();
    await replaceSqliteDatabaseFromBackupFile(tempPath);

    const restoredValidation = validateSqliteBackupFile(resolveSqliteDatabasePath());

    if (!restoredValidation.ok) {
      return redirectToSettings(
        request,
        "error",
        "Restore completed, but the restored database failed validation.",
      );
    }

    writeRestoreActivityLog({
      restoredFromFilename: file.name,
      safetyBackupPath,
    });
  } finally {
    await cleanupTemporarySqliteBackup(tempPath);
  }

  return redirectToSettings(
    request,
    "success",
    `Database restored successfully. A safety backup was saved before restore: ${safetyBackupPath}`,
  );
}
