import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import { requireRequestPermission } from "@/lib/admin-access";
import {
  cleanupTemporarySqliteBackup,
  createTemporarySqliteBackup,
  readSqliteBackupFile,
} from "@/lib/sqlite-backup";

export async function GET(request: NextRequest) {
  const permission = await requireRequestPermission(
    request,
    "settings:backup-restore",
  );

  if (permission.response) {
    return permission.response;
  }

  const backupPath = await createTemporarySqliteBackup();

  try {
    const backupFile = await readSqliteBackupFile(backupPath);

    return new NextResponse(backupFile, {
      status: 200,
      headers: {
        "Content-Type": "application/x-sqlite3",
        "Content-Disposition": `attachment; filename="${path.basename(backupPath)}"`,
        "Cache-Control": "no-store",
      },
    });
  } finally {
    await cleanupTemporarySqliteBackup(backupPath);
  }
}
