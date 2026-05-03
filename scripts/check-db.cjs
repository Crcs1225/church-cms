(async () => {
  const { default: Database } = await import("better-sqlite3");
  const fs = await import("node:fs");
  const path = await import("node:path");

  const dbPath = process.env.DATABASE_URL
    ? process.env.DATABASE_URL.replace(/^file:\/\//, "").replace(/^file:/, "")
    : path.join(process.cwd(), "data", "church-management.sqlite");

  const resolved = path.isAbsolute(dbPath)
    ? dbPath
    : path.resolve(process.cwd(), dbPath);

  if (!fs.existsSync(resolved)) {
    console.error("Database file not found at", resolved);
    process.exit(2);
  }

  const stats = fs.statSync(resolved);
  console.log("DB file:", resolved);
  console.log("Size (bytes):", stats.size);
  console.log("Last modified:", stats.mtime.toISOString());

  const db = new Database(resolved, { readonly: true });

  function safeCount(table) {
    try {
      const row = db.prepare(`SELECT COUNT(*) as c FROM ${table}`).get();
      return row ? row.c : null;
    } catch (error) {
      return `error: ${String(error.message)}`;
    }
  }

  console.log("members:", safeCount("members"));
  console.log("expenses:", safeCount("expenses"));
  console.log("activity_logs:", safeCount("activity_logs"));

  db.close();
})();
