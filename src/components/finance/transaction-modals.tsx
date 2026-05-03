"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { HandCoins, Pencil, Plus, ReceiptText, Search, UploadCloud } from "lucide-react";
import { Button, Input, Label, Modal } from "@/components/ui";

type ModalButtonProps = {
  floating?: boolean;
  label?: string;
  memberPublicId?: string;
  memberLabel?: string;
  triggerVariant?: "button" | "icon";
};

type IncomeDialogButtonProps = {
  mode?: "create" | "edit";
  floating?: boolean;
  label?: string;
  memberPublicId?: string;
  memberLabel?: string;
  contributionPublicId?: string;
  triggerVariant?: "button" | "icon" | "edit";
  initialValues?: {
    memberPublicId?: string | null;
    memberLabel?: string | null;
    category?: string;
    amount?: string;
    receivedAt?: string;
    paymentMethod?: string;
  };
  lockMember?: boolean;
};

const incomeCategoryOptions = [
  { value: "tithe", label: "Tithe" },
  { value: "offering", label: "Offering" },
  { value: "missions", label: "Missions" },
  { value: "building-fund", label: "Building Fund" },
];

const paymentMethodOptions = [
  { value: "check", label: "Check" },
  { value: "credit-card", label: "Credit Card" },
  { value: "cash", label: "Cash" },
  { value: "online-transfer", label: "Online Transfer" },
];

function modalButtonClassName(floating?: boolean) {
  return floating
    ? "fixed right-8 bottom-8 z-50 h-14 w-14 rounded-full p-0 shadow-2xl"
    : undefined;
}

function IncomeDialogButton({
  mode = "create",
  floating,
  label,
  memberPublicId,
  memberLabel,
  contributionPublicId,
  triggerVariant = "button",
  initialValues,
  lockMember = false,
}: IncomeDialogButtonProps) {
  const resolvedMemberPublicId =
    initialValues?.memberPublicId ?? memberPublicId ?? "";
  const resolvedMemberLabel = initialValues?.memberLabel ?? memberLabel ?? "";
  const shouldLockMember = lockMember && Boolean(resolvedMemberPublicId && resolvedMemberLabel);
  const resolvedLabel =
    label ?? (mode === "edit" ? "Edit Income" : "Add Income");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    setError(null);
    setIsSubmitting(true);

    const response = await fetch(
      mode === "edit" && contributionPublicId
        ? `/api/finances/income/${contributionPublicId}`
        : "/api/finances/income",
      {
      method: mode === "edit" ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        memberPublicId: formData.get("memberPublicId"),
        category: formData.get("category"),
        amount: formData.get("amount"),
        receivedAt: formData.get("receivedAt"),
        paymentMethod: formData.get("paymentMethod"),
      }),
    });

    const payload = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(
        payload?.error?.message ??
          (mode === "edit" ? "Unable to update income." : "Unable to record income."),
      );
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <>
      {floating ? (
        <Button
          size="md"
          className={modalButtonClassName(true)}
          aria-label={resolvedLabel}
          onClick={() => setOpen(true)}
        >
          <ReceiptText className="h-6 w-6" aria-hidden />
        </Button>
      ) : triggerVariant === "icon" ? (
        <Button
          variant="ghost"
          size="sm"
          aria-label={
            resolvedLabel ||
            (resolvedMemberLabel
              ? `Add giving record for ${resolvedMemberLabel}`
              : "Add giving record")
          }
          onClick={() => setOpen(true)}
        >
          <HandCoins className="h-4 w-4 text-success" aria-hidden />
        </Button>
      ) : triggerVariant === "edit" ? (
        <Button
          variant="ghost"
          size="sm"
          aria-label={resolvedLabel}
          onClick={() => setOpen(true)}
        >
          <Pencil className="h-4 w-4" aria-hidden />
        </Button>
      ) : (
        <Button
          size="lg"
          aria-label={resolvedLabel}
          onClick={() => setOpen(true)}
        >
          <Plus className="h-5 w-5" aria-hidden />
          {resolvedLabel}
        </Button>
      )}

      <Modal
        open={open}
        onOpenChange={setOpen}
        title={mode === "edit" ? "Edit Income" : "Record New Income"}
        description={
          mode === "edit"
            ? "Update this contribution record."
            : "Add a contribution, pledge, or other income record."
        }
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" form="income-create-form" disabled={isSubmitting}>
              {isSubmitting
                ? mode === "edit"
                  ? "Saving..."
                  : "Recording..."
                : mode === "edit"
                  ? "Save Changes"
                  : "Record Income"}
            </Button>
          </>
        }
      >
        <form id="income-create-form" className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="income-member">Member</Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral"
                aria-hidden
              />
              {shouldLockMember ? (
                <>
                  <Input
                    id="income-member"
                    value={resolvedMemberLabel}
                    readOnly
                    className="bg-background pl-9"
                  />
                  <input
                    type="hidden"
                    name="memberPublicId"
                    value={resolvedMemberPublicId}
                  />
                </>
              ) : (
                <Input
                  id="income-member"
                  name="memberPublicId"
                  className="pl-9"
                  defaultValue={resolvedMemberPublicId}
                  placeholder="Optional member public ID"
                />
              )}
            </div>
            <p className="text-xs text-text-secondary">
              {shouldLockMember
                ? "Income will be attached to this member automatically."
                : "Leave blank for anonymous income, or paste a member ID to link it."}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="income-modal-type">Income Type</Label>
              <select
                id="income-modal-type"
                name="category"
                aria-label="Select income type"
                title="Select income type"
                className="h-10 w-full rounded-md border border-border bg-surface px-3 text-base outline-none focus:border-primary focus:ring-3 focus:ring-focus-ring"
                defaultValue={initialValues?.category ?? "tithe"}
              >
                {incomeCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="income-modal-amount">Amount</Label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral">
                  $
                </span>
                <Input
                  id="income-modal-amount"
                  name="amount"
                  className="pl-7"
                  placeholder="0.00"
                  type="number"
                  defaultValue={initialValues?.amount}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="income-modal-date">Date</Label>
              <Input
                id="income-modal-date"
                name="receivedAt"
                type="date"
                defaultValue={initialValues?.receivedAt}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="income-modal-payment-method">Payment Method</Label>
              <select
                id="income-modal-payment-method"
                name="paymentMethod"
                aria-label="Select income payment method"
                title="Select income payment method"
                className="h-10 w-full rounded-md border border-border bg-surface px-3 text-base outline-none focus:border-primary focus:ring-3 focus:ring-focus-ring"
                defaultValue={initialValues?.paymentMethod ?? "cash"}
              >
                {paymentMethodOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </form>
      </Modal>
    </>
  );
}

export function AddIncomeDialogButton(props: ModalButtonProps) {
  return <IncomeDialogButton {...props} lockMember={Boolean(props.memberPublicId && props.memberLabel)} />;
}

type EditIncomeDialogButtonProps = {
  contributionPublicId: string;
  memberPublicId?: string | null;
  memberLabel?: string | null;
  category: string;
  amount: string;
  receivedAt: string;
  paymentMethod: string;
};

export function EditIncomeDialogButton({
  contributionPublicId,
  memberPublicId,
  memberLabel,
  category,
  amount,
  receivedAt,
  paymentMethod,
}: EditIncomeDialogButtonProps) {
  return (
    <IncomeDialogButton
      mode="edit"
      label="Edit income"
      triggerVariant="edit"
      contributionPublicId={contributionPublicId}
      initialValues={{
        memberPublicId,
        memberLabel,
        category,
        amount,
        receivedAt,
        paymentMethod,
      }}
    />
  );
}

export function AddExpenseDialogButton({
  floating,
  label = "Add Expense",
}: ModalButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    setError(null);
    setIsSubmitting(true);

    const response = await fetch("/api/finances/expenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vendor: formData.get("vendor"),
        category: formData.get("category"),
        amount: formData.get("amount"),
        paidAt: formData.get("paidAt"),
        reference: formData.get("reference"),
        description: formData.get("description"),
      }),
    });

    const payload = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(payload?.error?.message ?? "Unable to record expense.");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button
        size={floating ? "md" : "lg"}
        className={modalButtonClassName(floating)}
        aria-label={floating ? label : undefined}
        onClick={() => setOpen(true)}
      >
        {floating ? (
          <ReceiptText className="h-6 w-6" aria-hidden />
        ) : (
          <>
            <Plus className="h-5 w-5" aria-hidden />
            {label}
          </>
        )}
      </Button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Record New Expense"
        description="Capture an expense, vendor payment, or receipt."
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" form="expense-create-form" disabled={isSubmitting}>
              {isSubmitting ? "Recording..." : "Record Expense"}
            </Button>
          </>
        }
      >
        <form id="expense-create-form" className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="expense-payee">Vendor/Payee</Label>
            <Input
              id="expense-payee"
              name="vendor"
              placeholder="Who are you paying?"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="expense-modal-category">Category</Label>
              <select
                id="expense-modal-category"
                name="category"
                aria-label="Select expense category"
                title="Select expense category"
                className="h-10 w-full rounded-md border border-border bg-surface px-3 text-base outline-none focus:border-primary focus:ring-3 focus:ring-focus-ring"
              >
                <option value="utilities">Utilities</option>
                <option value="salaries">Salaries</option>
                <option value="maintenance">Maintenance</option>
                <option value="events">Events</option>
                <option value="outreach">Outreach</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-amount">Amount</Label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral">
                  $
                </span>
                <Input
                  id="expense-amount"
                  name="amount"
                  className="pl-7"
                  placeholder="0.00"
                  type="number"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="expense-date">Date</Label>
              <Input id="expense-date" name="paidAt" type="date" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-reference">Reference/Invoice #</Label>
              <Input
                id="expense-reference"
                name="reference"
                placeholder="e.g. INV-2026-001"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-description">Description</Label>
            <Input
              id="expense-description"
              name="description"
              placeholder="What was this expense for?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-receipt">Upload Receipt</Label>
            <label
              htmlFor="expense-receipt"
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-background p-8 text-center transition-colors hover:bg-surface"
            >
              <UploadCloud className="mb-2 h-10 w-10 text-neutral" aria-hidden />
              <span className="text-sm font-semibold text-text-secondary">
                Click to upload or drag and drop
              </span>
              <span className="mt-1 text-xs text-neutral">
                PDF, PNG, JPG (Max. 5MB)
              </span>
            </label>
            <input id="expense-receipt" type="file" className="sr-only" />
          </div>

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </form>
      </Modal>
    </>
  );
}
