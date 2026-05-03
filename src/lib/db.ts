import Database from "better-sqlite3";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

const databasePath =
  process.env.SQLITE_DATABASE_PATH ??
  path.join(process.cwd(), "data", "church-management.sqlite");

const schemaPath = path.join(process.cwd(), "db", "schema.sql");

declare global {
  var __sqlite: Database.Database | undefined;
}

function openDatabase() {
  const databaseDirectory = path.dirname(databasePath);

  if (!existsSync(databaseDirectory)) {
    mkdirSync(databaseDirectory, { recursive: true });
  }

  const db = new Database(databasePath);

  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(readFileSync(schemaPath, "utf8"));

  return db;
}

export const db = globalThis.__sqlite ?? openDatabase();

if (process.env.NODE_ENV !== "production") {
  globalThis.__sqlite = db;
}
