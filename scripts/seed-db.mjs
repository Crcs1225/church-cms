import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const databasePath =
  process.env.SQLITE_DATABASE_PATH ??
  path.join(process.cwd(), "data", "church-management.sqlite");

const databaseDirectory = path.dirname(databasePath);

if (!existsSync(databaseDirectory)) {
  mkdirSync(databaseDirectory, { recursive: true });
}

const db = new Database(databasePath);

db.pragma("foreign_keys = ON");

const withPublicId = (row) => ({
  publicId: randomUUID(),
  ...row,
});

const insertLookup = db.transaction((table, rows) => {
  const statement = db.prepare(`
    INSERT INTO ${table} (public_id, name, slug, created_at, updated_at)
    VALUES (@publicId, @name, @slug, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(slug) DO UPDATE SET
      name = excluded.name,
      updated_at = CURRENT_TIMESTAMP
  `);

  for (const row of rows) {
    statement.run(withPublicId(row));
  }
});

const insertGivingCategories = db.transaction((rows) => {
  const statement = db.prepare(`
    INSERT INTO giving_categories (public_id, name, slug, is_restricted, created_at, updated_at)
    VALUES (@publicId, @name, @slug, @isRestricted, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(slug) DO UPDATE SET
      name = excluded.name,
      is_restricted = excluded.is_restricted,
      updated_at = CURRENT_TIMESTAMP
  `);

  for (const row of rows) {
    statement.run(withPublicId(row));
  }
});

const insertFunds = db.transaction((rows) => {
  const statement = db.prepare(`
    INSERT INTO funds (public_id, name, slug, description, target_cents, created_at, updated_at)
    VALUES (@publicId, @name, @slug, @description, @targetCents, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(slug) DO UPDATE SET
      name = excluded.name,
      description = excluded.description,
      target_cents = excluded.target_cents,
      updated_at = CURRENT_TIMESTAMP
  `);

  for (const row of rows) {
    statement.run(withPublicId(row));
  }
});

const insertReportSignatories = db.transaction((rows) => {
  const statement = db.prepare(`
    INSERT INTO report_signatories (
      public_id,
      role_slug,
      role_name,
      full_name,
      title,
      email,
      phone,
      sort_order,
      created_at,
      updated_at
    )
    VALUES (
      @publicId,
      @roleSlug,
      @roleName,
      @fullName,
      @title,
      @email,
      @phone,
      @sortOrder,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
    ON CONFLICT(role_slug) DO UPDATE SET
      role_name = excluded.role_name,
      full_name = excluded.full_name,
      title = excluded.title,
      email = excluded.email,
      phone = excluded.phone,
      sort_order = excluded.sort_order,
      updated_at = CURRENT_TIMESTAMP
  `);

  for (const row of rows) {
    statement.run(withPublicId(row));
  }
});

const insertChurchSettings = db.transaction((row) => {
  const statement = db.prepare(`
    INSERT INTO church_settings (
      public_id,
      singleton_key,
      church_name,
      short_name,
      contact_email,
      address,
      phone,
      logo_path,
      daily_digest_enabled,
      new_member_alerts_enabled,
      low_budget_warning_enabled,
      created_at,
      updated_at
    )
    VALUES (
      @publicId,
      @singletonKey,
      @churchName,
      @shortName,
      @contactEmail,
      @address,
      @phone,
      @logoPath,
      @dailyDigestEnabled,
      @newMemberAlertsEnabled,
      @lowBudgetWarningEnabled,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
    ON CONFLICT(singleton_key) DO UPDATE SET
      church_name = excluded.church_name,
      short_name = excluded.short_name,
      contact_email = excluded.contact_email,
      address = excluded.address,
      phone = excluded.phone,
      logo_path = excluded.logo_path,
      daily_digest_enabled = excluded.daily_digest_enabled,
      new_member_alerts_enabled = excluded.new_member_alerts_enabled,
      low_budget_warning_enabled = excluded.low_budget_warning_enabled,
      updated_at = CURRENT_TIMESTAMP
  `);

  statement.run(withPublicId(row));
});

const insertAppUsers = db.transaction((rows) => {
  const statement = db.prepare(`
    INSERT INTO app_users (
      public_id,
      full_name,
      email,
      role,
      status,
      created_at,
      updated_at
    )
    VALUES (
      @publicId,
      @fullName,
      @email,
      @role,
      @status,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
    ON CONFLICT(email) DO UPDATE SET
      full_name = excluded.full_name,
      role = excluded.role,
      status = excluded.status,
      updated_at = CURRENT_TIMESTAMP
  `);

  for (const row of rows) {
    statement.run(withPublicId(row));
  }
});

const insertSampleMembers = db.transaction((rows) => {
  const memberStatement = db.prepare(`
    INSERT INTO members (
      public_id,
      first_name,
      last_name,
      email,
      phone,
      birthday,
      address,
      notes,
      status,
      synced,
      member_type_id,
      created_at,
      updated_at
    )
    VALUES (
      @publicId,
      @firstName,
      @lastName,
      @email,
      @phone,
      @birthday,
      @address,
      @notes,
      @status,
      0,
      @memberTypeId,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
    ON CONFLICT(email) DO UPDATE SET
      first_name = excluded.first_name,
      last_name = excluded.last_name,
      phone = excluded.phone,
      birthday = excluded.birthday,
      address = excluded.address,
      notes = excluded.notes,
      status = excluded.status,
      member_type_id = excluded.member_type_id,
      updated_at = CURRENT_TIMESTAMP
  `);

  const contributionStatement = db.prepare(`
    INSERT INTO contributions (
      public_id,
      member_id,
      category_id,
      amount_cents,
      payment_method,
      received_at,
      reference,
      notes,
      synced,
      created_at,
      updated_at
    )
    SELECT
      @publicId,
      @memberId,
      @categoryId,
      @amountCents,
      @paymentMethod,
      @receivedAt,
      @reference,
      @notes,
      0,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    WHERE NOT EXISTS (
      SELECT 1
      FROM contributions
      WHERE member_id = @memberId
        AND category_id = @categoryId
        AND amount_cents = @amountCents
        AND received_at = @receivedAt
    )
  `);

  const getMemberType = db.prepare(
    "SELECT id FROM member_types WHERE slug = @memberType",
  );
  const getGivingCategory = db.prepare(
    "SELECT id FROM giving_categories WHERE slug = @givingCategory",
  );
  const getMember = db.prepare("SELECT id FROM members WHERE email = @email");

  for (const row of rows) {
    const memberType = getMemberType.get(row);

    if (!memberType) {
      throw new Error(`Missing member type: ${row.memberType}`);
    }

    memberStatement.run({
      publicId: randomUUID(),
      memberTypeId: memberType.id,
      ...row,
    });

    const member = getMember.get(row);
    const givingCategory = getGivingCategory.get(row);

    if (!member || !givingCategory) {
      throw new Error(`Missing sample relation for ${row.email}`);
    }

    contributionStatement.run({
      publicId: randomUUID(),
      memberId: member.id,
      categoryId: givingCategory.id,
      amountCents: row.amountCents,
      paymentMethod: row.paymentMethod,
      receivedAt: row.receivedAt,
      reference: row.reference,
      notes: row.contributionNotes,
    });
  }
});

insertLookup("member_types", [
  { name: "Youth", slug: "youth" },
  { name: "Children", slug: "children" },
  { name: "Women", slug: "women" },
  { name: "Men", slug: "men" },
]);

insertGivingCategories([
  { name: "Tithe", slug: "tithe", isRestricted: 0 },
  { name: "Offering", slug: "offering", isRestricted: 0 },
  { name: "Missions", slug: "missions", isRestricted: 1 },
  { name: "Building Fund", slug: "building-fund", isRestricted: 1 },
  { name: "Donation", slug: "donation", isRestricted: 0 },
  { name: "Pledge", slug: "pledge", isRestricted: 1 },
  { name: "Seed of Faith", slug: "seed-of-faith", isRestricted: 1 },
  { name: "Others", slug: "others", isRestricted: 0 },
]);

insertLookup("expense_categories", [
  { name: "Utilities", slug: "utilities" },
  { name: "Salaries", slug: "salaries" },
  { name: "Maintenance", slug: "maintenance" },
  { name: "Events", slug: "events" },
  { name: "Outreach", slug: "outreach" },
  { name: "Misc", slug: "misc" },
]);

insertFunds([
  {
    name: "General Fund",
    slug: "general-fund",
    description: "Unrestricted operating fund.",
    targetCents: null,
  },
  {
    name: "Building Fund",
    slug: "building-fund",
    description: "Capital improvements and building projects.",
    targetCents: 25000000,
  },
  {
    name: "Missions & Outreach",
    slug: "missions-outreach",
    description: "Mission work and community outreach programs.",
    targetCents: 15000000,
  },
  {
    name: "Youth Ministry",
    slug: "youth-ministry",
    description: "Youth events, camps, and ministry support.",
    targetCents: 6000000,
  },
  {
    name: "Benevolence Fund",
    slug: "benevolence-fund",
    description: "Assistance for members and community needs.",
    targetCents: 4000000,
  },
  {
    name: "Growth Project Fund",
    slug: "growth-project-fund",
    description: "Long-term church growth projects.",
    targetCents: 20000000,
  },
]);

insertChurchSettings({
  singletonKey: "default",
  churchName: "The New Testament Christian Church Global Ministry Incorporated",
  shortName: "NTCCGMI Ilog Malino",
  contactEmail: "admin@ntccgmi-ilogmalino.org",
  address: "Ilog Malino, Bolinao, Pangasinan",
  phone: "+63 917 000 0000",
  logoPath: null,
  dailyDigestEnabled: 1,
  newMemberAlertsEnabled: 1,
  lowBudgetWarningEnabled: 0,
});

insertAppUsers([
  {
    fullName: "John Doe",
    email: "john@ntccgmi-ilogmalino.org",
    role: "Lead Pastor",
    status: "active",
  },
  {
    fullName: "Sarah Roberts",
    email: "sarah@ntccgmi-ilogmalino.org",
    role: "Admin",
    status: "active",
  },
  {
    fullName: "Michael King",
    email: "m.king@ntccgmi-ilogmalino.org",
    role: "Finance Lead",
    status: "active",
  },
]);

insertReportSignatories([
  {
    roleSlug: "pastor",
    roleName: "Pastor",
    fullName: "John Doe",
    title: "Admin Pastor",
    email: "john@ntccgmi-ilogmalino.org",
    phone: "+63 917 100 1001",
    sortOrder: 1,
  },
  {
    roleSlug: "treasurer",
    roleName: "Treasurer",
    fullName: "Michael King",
    title: "Church Treasurer",
    email: "m.king@ntccgmi-ilogmalino.org",
    phone: "+63 917 100 1002",
    sortOrder: 2,
  },
  {
    roleSlug: "auditor",
    roleName: "Auditor",
    fullName: "Sarah Roberts",
    title: "Church Auditor",
    email: "sarah@ntccgmi-ilogmalino.org",
    phone: "+63 917 100 1003",
    sortOrder: 3,
  },
  {
    roleSlug: "secretary",
    roleName: "Secretary",
    fullName: "Anna Cruz",
    title: "Church Secretary",
    email: "anna@ntccgmi-ilogmalino.org",
    phone: "+63 917 100 1004",
    sortOrder: 4,
  },
]);

insertSampleMembers([
  {
    firstName: "Elias",
    lastName: "Thompson",
    email: "elias.t@church.com",
    phone: "(555) 124-5678",
    birthday: "1978-10-24T00:00:00.000Z",
    address: "12 Oak Lane, Stone Harbor",
    notes: "Worship team lead.",
    status: "active",
    memberType: "men",
    givingCategory: "tithe",
    amountCents: 25000,
    paymentMethod: "bank-transfer",
    receivedAt: "2026-10-14T00:00:00.000Z",
    reference: "SEED-ELIAS-001",
    contributionNotes: "Seed contribution for table preview.",
  },
  {
    firstName: "Sarah",
    lastName: "Jenkins",
    email: "sarah.j@webmail.org",
    phone: "(555) 987-6543",
    birthday: "2002-03-18T00:00:00.000Z",
    address: "44 River Street",
    notes: "Youth ministry volunteer.",
    status: "active",
    memberType: "youth",
    givingCategory: "offering",
    amountCents: 5000,
    paymentMethod: "cash",
    receivedAt: "2026-10-12T00:00:00.000Z",
    reference: "SEED-SARAH-001",
    contributionNotes: "Seed contribution for table preview.",
  },
  {
    firstName: "Diana",
    lastName: "Prince",
    email: "diana@outreach.org",
    phone: "(555) 777-8899",
    birthday: "1987-06-02T00:00:00.000Z",
    address: "9 Outreach Avenue",
    notes: "Community outreach coordinator.",
    status: "active",
    memberType: "women",
    givingCategory: "missions",
    amountCents: 120000,
    paymentMethod: "online-transfer",
    receivedAt: "2026-09-28T00:00:00.000Z",
    reference: "SEED-DIANA-001",
    contributionNotes: "Seed contribution for table preview.",
  },
]);

db.close();

console.log("Seeded member types, categories, funds, church settings, app users, report signatories, and sample members.");
