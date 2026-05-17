"use client";

import { useSearchParams } from "next/navigation";
import { AlertTriangle, DatabaseBackup, Download, RotateCcw } from "lucide-react";
import { Button, Card, Input, Label } from "@/components/ui";

export function BackupRestoreCard() {
  const searchParams = useSearchParams();
  const restoreStatus = searchParams.get("backupRestoreStatus");
  const restoreMessage = searchParams.get("backupRestoreMessage");

  return (
    <Card className="rounded-xl p-6">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <DatabaseBackup className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="font-semibold text-text-primary">Database Backup</p>
                <p className="text-sm text-text-secondary">
                  Download a full SQLite snapshot of the current local system state.
                </p>
              </div>
            </div>
          </div>
          <a
            href="/api/settings/database-backup"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-transparent px-4 text-sm font-semibold text-text-primary transition-all duration-150 hover:bg-surface-raised"
          >
            <Download className="h-4 w-4" aria-hidden />
            Download Backup
          </a>
        </div>

        <form
          className="space-y-4"
          action="/api/settings/database-restore"
          method="post"
          encType="multipart/form-data"
        >
          <div>
            <p className="font-semibold text-text-primary">Restore Database</p>
            <p className="mt-1 text-sm text-text-secondary">
              Upload a previously downloaded SQLite backup to replace the current local database.
            </p>
          </div>

          <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <p>
                Restore is destructive. Current local records will be replaced. A safety backup
                is created automatically before restore starts.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-backup-file">Backup File</Label>
            <Input
              id="settings-backup-file"
              name="backupFile"
              type="file"
              accept=".sqlite,.db,application/x-sqlite3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-restore-confirmation">
              Type RESTORE to confirm
            </Label>
            <Input
              id="settings-restore-confirmation"
              name="confirmation"
              placeholder="RESTORE"
              autoComplete="off"
            />
          </div>

          {restoreStatus === "error" && restoreMessage ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {restoreMessage}
            </p>
          ) : null}

          {restoreStatus === "success" && restoreMessage ? (
            <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {restoreMessage}
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" variant="destructive">
              <RotateCcw className="h-4 w-4" aria-hidden />
              Restore Backup
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
