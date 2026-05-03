import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import path from "node:path";

const databasePath =
  process.env.SQLITE_DATABASE_PATH ??
  path.join(process.cwd(), "data", "church-management.sqlite");

const db = new Database(databasePath);
db.pragma("foreign_keys = ON");

const requiredLookups = [
  ["member_types", 4],
  ["giving_categories", 8],
  ["expense_categories", 6],
  ["funds", 6],
];

for (const [table, minimum] of requiredLookups) {
  const { count } = db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get();

  if (count < minimum) {
    throw new Error(`${table} has ${count} rows. Expected at least ${minimum}.`);
  }
}

db.exec("BEGIN");

try {
  const now = new Date().toISOString();
  const memberType = db
    .prepare("SELECT id FROM member_types WHERE slug = ?")
    .get("youth");
  const givingCategory = db
    .prepare("SELECT id FROM giving_categories WHERE slug = ?")
    .get("tithe");
  const expenseCategory = db
    .prepare("SELECT id FROM expense_categories WHERE slug = ?")
    .get("utilities");

  if (!memberType || !givingCategory || !expenseCategory) {
    throw new Error("Required lookup rows are missing.");
  }

  const memberPublicId = randomUUID();
  const contributionPublicId = randomUUID();
  const expensePublicId = randomUUID();

  const member = db
    .prepare(
      `
        INSERT INTO members (
          public_id,
          first_name,
          last_name,
          email,
          phone,
          status,
          synced,
          member_type_id,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .run(
      memberPublicId,
      "Smoke",
      "Member",
      `smoke-${Date.now()}@example.com`,
      "+1 555 000 0000",
      "active",
      0,
      memberType.id,
      now,
      now,
    );

  db.prepare(
    `
      INSERT INTO contributions (
        public_id,
        member_id,
        category_id,
        amount_cents,
        payment_method,
        received_at,
        synced,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  ).run(
    contributionPublicId,
    member.lastInsertRowid,
    givingCategory.id,
    2500,
    "cash",
    now,
    0,
    now,
    now,
  );

  db.prepare(
    `
      INSERT INTO expenses (
        public_id,
        category_id,
        vendor,
        description,
        amount_cents,
        paid_at,
        synced,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  ).run(
    expensePublicId,
    expenseCategory.id,
    "Smoke Vendor",
    "Smoke test expense",
    1250,
    now,
    0,
    now,
    now,
  );

  const contribution = db
    .prepare(
      `
        SELECT c.amount_cents, m.public_id AS member_public_id, g.slug
        FROM contributions c
        JOIN members m ON m.id = c.member_id
        JOIN giving_categories g ON g.id = c.category_id
        WHERE c.public_id = ?
      `,
    )
    .get(contributionPublicId);

  const expense = db
    .prepare(
      `
        SELECT e.amount_cents, x.slug
        FROM expenses e
        JOIN expense_categories x ON x.id = e.category_id
        WHERE e.public_id = ?
      `,
    )
    .get(expensePublicId);

  if (
    contribution?.amount_cents !== 2500 ||
    contribution?.member_public_id !== memberPublicId ||
    contribution?.slug !== "tithe"
  ) {
    throw new Error("Contribution relation smoke test failed.");
  }

  if (expense?.amount_cents !== 1250 || expense?.slug !== "utilities") {
    throw new Error("Expense relation smoke test failed.");
  }

  db.exec("ROLLBACK");
  console.log("Data smoke test passed.");
} catch (error) {
  db.exec("ROLLBACK");
  throw error;
} finally {
  db.close();
}
