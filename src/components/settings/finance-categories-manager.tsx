"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { Badge, Button, Card, DeletionConfirmModal, Input, Label, Modal } from "@/components/ui";
import type { SettingsCategoryItem } from "@/lib/settings-finance-categories";

type FinanceCategoriesManagerProps = {
  givingCategories: SettingsCategoryItem[];
  expenseCategories: SettingsCategoryItem[];
};

type CategoryEditorState = {
  type: "giving" | "expense";
  category: SettingsCategoryItem | null;
};

export function FinanceCategoriesManager({
  givingCategories,
  expenseCategories,
}: FinanceCategoriesManagerProps) {
  const router = useRouter();
  const [editorState, setEditorState] = useState<CategoryEditorState | null>(null);
  const [deletionState, setDeletionState] = useState<CategoryEditorState | null>(null);
  const [isSavePending, startSaveTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    startSaveTransition(async () => {
      const publicId = String(formData.get("publicId") ?? "");
      const type = String(formData.get("type") ?? "");
      const isEdit = Boolean(publicId);
      const routeBase =
        type === "giving"
          ? "/api/settings/giving-categories"
          : "/api/settings/expense-categories";
      const response = await fetch(
        isEdit ? `${routeBase}/${publicId}` : routeBase,
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: String(formData.get("name") ?? ""),
            isRestricted: formData.get("isRestricted") === "on",
          }),
        },
      );
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setSaveError(result?.error?.message ?? "Unable to save category.");
        return;
      }

      setSaveError(null);
      setEditorState(null);
      router.refresh();
    });
  }

  function openCreate(type: "giving" | "expense") {
    setEditorState({ type, category: null });
  }

  function openEdit(type: "giving" | "expense", category: SettingsCategoryItem) {
    setEditorState({ type, category });
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="relative rounded-xl p-6">
          <div className="absolute inset-y-0 left-0 w-1 rounded-l-xl bg-primary" />
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" aria-hidden />
              <h3 className="text-lg font-semibold text-text-primary">
                Income Categories
              </h3>
            </div>
            <Button variant="secondary" size="sm" onClick={() => openCreate("giving")}>
              <Plus className="h-4 w-4" aria-hidden />
              Add
            </Button>
          </div>
          <div className="space-y-3">
            {givingCategories.map((category) => (
              <div
                key={category.publicId}
                className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{category.name}</Badge>
                    {category.restricted ? <Badge variant="warning">Restricted</Badge> : null}
                  </div>
                  <p className="mt-2 text-xs text-text-secondary">
                    {category.usageCount} contribution{category.usageCount === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit("giving", category)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDeletionState({ type: "giving", category });
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-error" aria-hidden />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="relative rounded-xl p-6">
          <div className="absolute inset-y-0 left-0 w-1 rounded-l-xl bg-warning" />
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-warning" aria-hidden />
              <h3 className="text-lg font-semibold text-text-primary">
                Expense Categories
              </h3>
            </div>
            <Button variant="secondary" size="sm" onClick={() => openCreate("expense")}>
              <Plus className="h-4 w-4" aria-hidden />
              Add
            </Button>
          </div>
          <div className="space-y-3">
            {expenseCategories.map((category) => (
              <div
                key={category.publicId}
                className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
              >
                <div>
                  <Badge>{category.name}</Badge>
                  <p className="mt-2 text-xs text-text-secondary">
                    {category.usageCount} expense{category.usageCount === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit("expense", category)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDeletionState({ type: "expense", category });
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-error" aria-hidden />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal
        open={editorState !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditorState(null);
          }
        }}
        title={
          editorState
            ? `${editorState.category ? "Edit" : "Add"} ${
                editorState.type === "giving" ? "Income" : "Expense"
              } Category`
            : "Category"
        }
        description="These categories are used by the finance screens and APIs."
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setEditorState(null);
              }}
              disabled={isSavePending}
            >
              Cancel
            </Button>
            <Button type="submit" form="finance-category-form" disabled={isSavePending}>
              {isSavePending ? "Saving..." : "Save Category"}
            </Button>
          </>
        }
      >
        {editorState ? (
          <form id="finance-category-form" className="space-y-5" onSubmit={handleSubmit}>
            <input type="hidden" name="type" value={editorState.type} />
            <input type="hidden" name="publicId" value={editorState.category?.publicId ?? ""} />
            <div className="space-y-2">
              <Label htmlFor="finance-category-name">Category Name</Label>
              <Input
                id="finance-category-name"
                name="name"
                defaultValue={editorState.category?.name ?? ""}
              />
            </div>
            {editorState.type === "giving" ? (
              <label className="flex items-center gap-3 rounded-lg border border-border bg-surface-raised px-4 py-3 text-sm text-text-primary">
                <input
                  type="checkbox"
                  name="isRestricted"
                  defaultChecked={Boolean(editorState.category?.restricted)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                Restricted fund category
              </label>
            ) : null}
            {saveError ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {saveError}
              </p>
            ) : null}
          </form>
        ) : null}
      </Modal>

      <DeletionConfirmModal
        open={deletionState !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeletionState(null);
          }
        }}
        title="Delete Finance Category"
        itemLabel={deletionState?.category?.name ?? "this category"}
        confirmLabel="Delete Category"
        isSubmitting={isDeletePending}
        error={deleteError}
        onConfirm={() => {
          if (!deletionState?.category) {
            return;
          }

          const category = deletionState.category;
          startDeleteTransition(async () => {
            const routeBase =
              deletionState.type === "giving"
                ? "/api/settings/giving-categories"
                : "/api/settings/expense-categories";
            const response = await fetch(
              `${routeBase}/${category.publicId}`,
              {
                method: "DELETE",
              },
            );
            const result = await response.json().catch(() => null);

            if (!response.ok) {
              setDeleteError(result?.error?.message ?? "Unable to delete category.");
              return;
            }

            setDeleteError(null);
            setDeletionState(null);
            router.refresh();
          });
        }}
      />
    </>
  );
}
