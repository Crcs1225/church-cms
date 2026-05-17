import Database from "better-sqlite3";
import path from "node:path";

const baseUrl = process.env.API_BASE_URL ?? "http://127.0.0.1:3000";
const databasePath =
  process.env.SQLITE_DATABASE_PATH ??
  path.join(process.cwd(), "data", "church-management.sqlite");

function getBackupAuthorizedCookie() {
  const db = new Database(databasePath, { readonly: true });

  try {
    const user = db
      .prepare(`
        SELECT public_id AS publicId
        FROM app_users
        WHERE status = 'active' AND lower(role) IN ('admin', 'lead pastor')
        ORDER BY role ASC, full_name ASC
        LIMIT 1
      `)
      .get();

    if (!user?.publicId) {
      throw new Error("Could not find an active admin user for backup smoke testing.");
    }

    return user.publicId;
  } finally {
    db.close();
  }
}

function getBackupUnauthorizedUserPublicId() {
  const db = new Database(databasePath, { readonly: true });

  try {
    const user = db
      .prepare(`
        SELECT public_id AS publicId
        FROM app_users
        WHERE status = 'active' AND lower(role) IN ('finance lead', 'auditor', 'secretary')
        ORDER BY role ASC, full_name ASC
        LIMIT 1
      `)
      .get();

    if (!user?.publicId) {
      throw new Error("Could not find an active non-privileged admin user for backup denial testing.");
    }

    return user.publicId;
  } finally {
    db.close();
  }
}

const checks = [
  {
    path: "/api/member-types",
    key: "memberTypes",
  },
  {
    path: "/api/members",
    key: "members",
  },
  {
    path: "/api/finances/categories",
    key: "givingCategories",
  },
  {
    path: "/api/finances/income",
    key: "contributions",
  },
  {
    path: "/api/finances/expenses",
    key: "expenses",
  },
  {
    path: "/api/finances/summary",
    key: "totals",
  },
];

for (const check of checks) {
  const response = await fetch(`${baseUrl}${check.path}`);

  if (!response.ok) {
    throw new Error(`${check.path} returned ${response.status}.`);
  }

  const payload = await response.json();

  if (!(check.key in payload)) {
    throw new Error(`${check.path} did not include "${check.key}".`);
  }

  console.log(`${check.path} ok`);
}

const backupUserPublicId = getBackupAuthorizedCookie();
const unauthorizedBackupUserPublicId = getBackupUnauthorizedUserPublicId();
const selectActiveUserResponse = await fetch(`${baseUrl}/api/settings/active-user`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    publicId: backupUserPublicId,
  }),
});

if (!selectActiveUserResponse.ok) {
  throw new Error(
    `/api/settings/active-user POST returned ${selectActiveUserResponse.status}.`,
  );
}

const activeUserCookie = selectActiveUserResponse.headers.get("set-cookie");

if (!activeUserCookie?.includes("active_admin_user=")) {
  throw new Error("Selecting the active admin user did not return the expected cookie.");
}

const backupResponse = await fetch(`${baseUrl}/api/settings/database-backup`, {
  headers: {
    cookie: activeUserCookie,
  },
});

if (!backupResponse.ok) {
  throw new Error(
    `/api/settings/database-backup returned ${backupResponse.status}.`,
  );
}

const backupContentType = backupResponse.headers.get("content-type") ?? "";
const backupDisposition = backupResponse.headers.get("content-disposition") ?? "";
const backupFile = Buffer.from(await backupResponse.arrayBuffer());

if (!backupContentType.includes("application/x-sqlite3")) {
  throw new Error("Database backup did not return a SQLite content type.");
}

if (!backupDisposition.includes("attachment;")) {
  throw new Error("Database backup did not return as a downloadable attachment.");
}

if (!backupDisposition.includes(".sqlite")) {
  throw new Error("Database backup filename did not include the .sqlite extension.");
}

if (backupFile.byteLength === 0) {
  throw new Error("Database backup response was empty.");
}

console.log("/api/settings/database-backup download ok");

const selectUnauthorizedUserResponse = await fetch(`${baseUrl}/api/settings/active-user`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    publicId: unauthorizedBackupUserPublicId,
  }),
});

if (!selectUnauthorizedUserResponse.ok) {
  throw new Error(
    `/api/settings/active-user POST for unauthorized backup user returned ${selectUnauthorizedUserResponse.status}.`,
  );
}

const unauthorizedActiveUserCookie = selectUnauthorizedUserResponse.headers.get("set-cookie");

if (!unauthorizedActiveUserCookie?.includes("active_admin_user=")) {
  throw new Error(
    "Selecting the unauthorized backup test user did not return the expected cookie.",
  );
}

const deniedBackupResponse = await fetch(`${baseUrl}/api/settings/database-backup`, {
  headers: {
    cookie: unauthorizedActiveUserCookie,
  },
});

if (deniedBackupResponse.status !== 403) {
  throw new Error(
    `/api/settings/database-backup denial check returned ${deniedBackupResponse.status} instead of 403.`,
  );
}

const deniedBackupPayload = await deniedBackupResponse.json();

if (
  typeof deniedBackupPayload.error?.message !== "string" ||
  !deniedBackupPayload.error.message.includes("role does not allow")
) {
  throw new Error("Database backup denial check did not return the expected error payload.");
}

console.log("/api/settings/database-backup permission denied ok");

const membersResponse = await fetch(`${baseUrl}/api/members?pageSize=1`);

if (!membersResponse.ok) {
  throw new Error(`/api/members?pageSize=1 returned ${membersResponse.status}.`);
}

const membersPayload = await membersResponse.json();
const testMember = membersPayload.members?.[0];

if (!testMember?.publicId || !testMember?.fullName) {
  throw new Error("Could not load a member for linked income smoke testing.");
}

const createIncomeResponse = await fetch(`${baseUrl}/api/finances/income`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    memberPublicId: testMember.publicId,
    category: "offering",
    amount: "1.23",
    receivedAt: "2026-05-03",
    paymentMethod: "cash",
    reference: `API-SMOKE-${Date.now()}`,
  }),
});

if (!createIncomeResponse.ok) {
  throw new Error(
    `/api/finances/income POST returned ${createIncomeResponse.status}.`,
  );
}

const createIncomePayload = await createIncomeResponse.json();

if (
  createIncomePayload.contribution?.member?.publicId !== testMember.publicId
) {
  throw new Error("Linked income POST did not return the expected member.");
}

const linkedIncomeResponse = await fetch(
  `${baseUrl}/api/finances/income?member=${encodeURIComponent(testMember.publicId)}`,
);

if (!linkedIncomeResponse.ok) {
  throw new Error(
    `/api/finances/income?member=... returned ${linkedIncomeResponse.status}.`,
  );
}

const linkedIncomePayload = await linkedIncomeResponse.json();
const linkedContribution = linkedIncomePayload.contributions?.find(
  (contribution) => contribution.publicId === createIncomePayload.contribution.publicId,
);

if (!linkedContribution) {
  throw new Error("Linked income search did not return the created contribution.");
}

if (linkedContribution.member?.fullName !== testMember.fullName) {
  throw new Error("Linked income search did not return the giver name.");
}

console.log("/api/finances/income linked member create/search ok");

const createExpenseResponse = await fetch(`${baseUrl}/api/finances/expenses`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    vendor: "API Smoke Vendor",
    category: "utilities",
    amount: "4.56",
    paidAt: "2026-05-04",
    reference: `API-EXP-${Date.now()}`,
    description: "API smoke expense",
  }),
});

if (!createExpenseResponse.ok) {
  throw new Error(
    `/api/finances/expenses POST returned ${createExpenseResponse.status}.`,
  );
}

const createExpensePayload = await createExpenseResponse.json();
const createdExpense = createExpensePayload.expense;

if (
  !createdExpense?.publicId ||
  createdExpense.amountCents !== 456 ||
  createdExpense.category?.slug !== "utilities"
) {
  throw new Error("Expense POST did not return the expected payload.");
}

const updateExpenseResponse = await fetch(
  `${baseUrl}/api/finances/expenses/${createdExpense.publicId}`,
  {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      category: "maintenance",
      amount: "7.89",
      vendor: "Updated Smoke Vendor",
      description: "Updated API smoke expense",
      paidAt: "2026-05-05",
      notes: "updated by smoke test",
    }),
  },
);

if (!updateExpenseResponse.ok) {
  throw new Error(
    `/api/finances/expenses/[id] PATCH returned ${updateExpenseResponse.status}.`,
  );
}

const updateExpensePayload = await updateExpenseResponse.json();

if (
  updateExpensePayload.expense?.amountCents !== 789 ||
  updateExpensePayload.expense?.category?.slug !== "maintenance" ||
  updateExpensePayload.expense?.vendor !== "Updated Smoke Vendor"
) {
  throw new Error("Expense PATCH did not persist the expected changes.");
}

const deleteExpenseResponse = await fetch(
  `${baseUrl}/api/finances/expenses/${createdExpense.publicId}`,
  {
    method: "DELETE",
  },
);

if (!deleteExpenseResponse.ok) {
  throw new Error(
    `/api/finances/expenses/[id] DELETE returned ${deleteExpenseResponse.status}.`,
  );
}

const deleteExpensePayload = await deleteExpenseResponse.json();

if (!deleteExpensePayload.deleted) {
  throw new Error("Expense DELETE did not return a success payload.");
}

console.log("/api/finances/expenses create/update/delete ok");

console.log(`API smoke test passed against ${baseUrl}.`);
