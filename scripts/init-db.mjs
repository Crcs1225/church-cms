import Database from "better-sqlite3";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

const databasePath =
  process.env.SQLITE_DATABASE_PATH ??
  path.join(process.cwd(), "data", "church-management.sqlite");

const schemaPath = path.join(process.cwd(), "db", "schema.sql");
const databaseDirectory = path.dirname(databasePath);

if (!existsSync(databaseDirectory)) {
  mkdirSync(databaseDirectory, { recursive: true });
}

const db = new Database(databasePath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(readFileSync(schemaPath, "utf8"));
db.close();

console.log(`SQLite database initialized at ${databasePath}`);
