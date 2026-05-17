import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";

const REQUIRED_TABLES = [
  "member_types",
  "members",
  "giving_categories",
  "contributions",
  "expense_categories",
  "expenses",
  "funds",
  "fund_allocations",
  "events",
  "activity_logs",
  "app_users",
  "church_settings",
  "report_signatories",
  "report_snapshots",
] as const;

function parseDatabaseUrl(databaseUrl: string) {
  return databaseUrl.replace(/^file:\/\//, "").replace(/^file:/, "");
}

export function resolveSqliteDatabasePath() {
  const configuredPath =
    process.env.SQLITE_DATABASE_PATH
    ?? (process.env.DATABASE_URL ? parseDatabaseUrl(process.env.DATABASE_URL) : null)
    ?? path.join("data", "church-management.sqlite");

  return path.isAbsolute(configuredPath)
    ? configuredPath
    : path.resolve(process.cwd(), configuredPath);
}

export function resolveSqliteBackupDirectory() {
  return path.join(path.dirname(resolveSqliteDatabasePath()), "backups");
}

function buildBackupFilename(prefix: string) {
  const now = new Date();
  const timestamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    "-",
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join("");

  return `${prefix}-${timestamp}.sqlite`;
}

export function buildDownloadBackupFilename() {
  return buildBackupFilename("church-management-backup");
}

export async function createSqliteBackup(destinationPath: string) {
  await mkdir(path.dirname(destinationPath), { recursive: true });

  const sourceDb = new Database(resolveSqliteDatabasePath(), { readonly: true });

  try {
    await sourceDb.backup(destinationPath);
  } finally {
    sourceDb.close();
  }
}

export async function createTemporarySqliteBackup() {
  const backupDirectory = resolveSqliteBackupDirectory();
  const backupPath = path.join(backupDirectory, buildDownloadBackupFilename());

  await createSqliteBackup(backupPath);

  return backupPath;
}

export async function cleanupTemporarySqliteBackup(backupPath: string) {
  await rm(backupPath, { force: true });
}

export function validateSqliteBackupFile(databasePath: string) {
  const db = new Database(databasePath, { readonly: true });

  try {
    const tables = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table'",
      )
      .all()
      .map((row) => String((row as { name: string }).name));

    const missingTables = REQUIRED_TABLES.filter((tableName) => !tables.includes(tableName));

    if (missingTables.length > 0) {
      return {
        ok: false as const,
        message: `Backup file is missing required tables: ${missingTables.join(", ")}.`,
      };
    }

    return { ok: true as const, message: null };
  } catch {
    return {
      ok: false as const,
      message: "Backup file could not be opened as a valid SQLite database.",
    };
  } finally {
    db.close();
  }
}

export async function writeUploadedBackupToTempFile(file: File) {
  const tempDirectory = path.join(resolveSqliteBackupDirectory(), ".restore-temp");
  const tempPath = path.join(tempDirectory, `${randomUUID()}.sqlite`);

  await mkdir(tempDirectory, { recursive: true });
  await writeFile(tempPath, Buffer.from(await file.arrayBuffer()));

  return tempPath;
}

export async function createPreRestoreSafetyBackup() {
  const backupDirectory = resolveSqliteBackupDirectory();
  const safetyBackupPath = path.join(
    backupDirectory,
    buildBackupFilename("church-management-pre-restore"),
  );

  await createSqliteBackup(safetyBackupPath);

  return safetyBackupPath;
}

export async function replaceSqliteDatabaseFromBackupFile(sourcePath: string) {
  const databasePath = resolveSqliteDatabasePath();

  await copyFile(sourcePath, databasePath);
  await rm(`${databasePath}-wal`, { force: true });
  await rm(`${databasePath}-shm`, { force: true });
  await rm(`${databasePath}-journal`, { force: true });
}

export async function readSqliteBackupFile(backupPath: string) {
  return readFile(backupPath);
}

export function writeRestoreActivityLog(metadata: {
  restoredFromFilename: string;
  safetyBackupPath: string;
}) {
  const db = new Database(resolveSqliteDatabasePath());

  try {
    db.prepare(
      `
        INSERT INTO activity_logs (
          public_id,
          action,
          entity_type,
          entity_public_id,
          description,
          metadata_json,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
    ).run(
      randomUUID(),
      "DATABASE_RESTORE",
      "system",
      null,
      "Restored the local SQLite database from an uploaded backup.",
      JSON.stringify(metadata),
      new Date().toISOString(),
    );
  } finally {
    db.close();
  }
}
