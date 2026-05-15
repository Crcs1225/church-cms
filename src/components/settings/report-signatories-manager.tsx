"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Pencil, Signature } from "lucide-react";
import { saveReportSignatoryAction } from "@/app/admin/settings/actions";
import { Badge, Button, Card, Input, Label, Modal } from "@/components/ui";
import type { ReportSignatoryItem } from "@/lib/report-signatories";

type ReportSignatoriesManagerProps = {
  signatories: ReportSignatoryItem[];
};

export function ReportSignatoriesManager({
  signatories,
}: ReportSignatoriesManagerProps) {
  const [editingSignatory, setEditingSignatory] =
    useState<ReportSignatoryItem | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingSignatory) {
      return;
    }

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await saveReportSignatoryAction(
        { status: "idle", message: null },
        formData,
      );

      if (result.status === "error") {
        setError(result.message ?? "Unable to update report signatory.");
        return;
      }

      setError(null);
      setEditingSignatory(null);
    });
  }

  return (
    <>
      <Card className="rounded-xl p-0">
        <div className="border-b border-border bg-surface-raised px-6 py-4">
          <p className="font-semibold text-text-primary">
            {signatories.length} configured signatories
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Pastor, treasurer, auditor, and secretary are used in finance report signature blocks.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
          {signatories.map((signatory) => (
            <div
              key={signatory.publicId}
              className="rounded-xl border border-border bg-background p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <Badge>{signatory.roleName}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Edit ${signatory.roleName} signatory`}
                  onClick={() => {
                    setEditingSignatory(signatory);
                  }}
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                </Button>
              </div>
              <p className="font-semibold text-text-primary">
                {signatory.fullName}
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                {signatory.title ?? signatory.roleName}
              </p>
              <div className="mt-4 space-y-1 text-xs text-text-secondary">
                <p>{signatory.email ?? "No email recorded"}</p>
                <p>{signatory.phone ?? "No phone recorded"}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal
        open={editingSignatory !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingSignatory(null);
          }
        }}
        title={editingSignatory ? `Edit ${editingSignatory.roleName}` : "Edit signatory"}
        description="Changes here are saved to the database and used in report signatures."
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setEditingSignatory(null);
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="report-signatory-form"
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </>
        }
      >
        {editingSignatory ? (
          <form
            id="report-signatory-form"
            className="space-y-5"
            onSubmit={handleSubmit}
          >
            <input type="hidden" name="publicId" value={editingSignatory.publicId} />
            <div className="flex items-start gap-3 rounded-lg border border-border bg-surface-raised px-4 py-3">
              <Signature className="mt-0.5 h-5 w-5 text-text-secondary" aria-hidden />
              <div>
                <p className="font-semibold text-text-primary">
                  {editingSignatory.roleName}
                </p>
                <p className="text-sm text-text-secondary">
                  This signatory appears in finance print and PDF reports.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signatory-full-name">Full Name</Label>
              <Input
                id="signatory-full-name"
                name="fullName"
                defaultValue={editingSignatory.fullName}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signatory-title">Title</Label>
              <Input
                id="signatory-title"
                name="title"
                defaultValue={editingSignatory.title ?? ""}
                placeholder={`e.g. ${editingSignatory.roleName}`}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="signatory-email">Email</Label>
                <Input
                  id="signatory-email"
                  name="email"
                  type="email"
                  defaultValue={editingSignatory.email ?? ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signatory-phone">Phone</Label>
                <Input
                  id="signatory-phone"
                  name="phone"
                  defaultValue={editingSignatory.phone ?? ""}
                />
              </div>
            </div>

            {error ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}
          </form>
        ) : null}
      </Modal>
    </>
  );
}
