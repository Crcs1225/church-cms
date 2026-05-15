const baseUrl = process.env.API_BASE_URL ?? "http://127.0.0.1:3000";

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
