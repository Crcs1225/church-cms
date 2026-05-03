"use client";

import { useMemo, useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Modal } from "./modal";

type DeletionConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmationWord?: string;
  itemLabel?: string;
  confirmLabel?: string;
  isSubmitting?: boolean;
  error?: string | null;
  onConfirm: () => void | Promise<void>;
};

export function DeletionConfirmModal({
  open,
  onOpenChange,
  title = "Delete Record",
  description,
  confirmationWord = "DELETE",
  itemLabel = "this record",
  confirmLabel = "Delete",
  isSubmitting = false,
  error,
  onConfirm,
}: DeletionConfirmModalProps) {
  const [typedValue, setTypedValue] = useState("");

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setTypedValue("");
    }

    onOpenChange(nextOpen);
  }

  const normalizedTypedValue = typedValue.trim().toUpperCase();
  const normalizedConfirmationWord = confirmationWord.trim().toUpperCase();
  const isMatch = normalizedTypedValue === normalizedConfirmationWord;

  const helperText = useMemo(
    () =>
      `Type ${confirmationWord} to permanently delete ${itemLabel}. This action cannot be undone.`,
    [confirmationWord, itemLabel],
  );

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title={title}
      description={
        description ??
        `Please confirm that you want to delete ${itemLabel}.`
      }
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => void onConfirm()}
            disabled={!isMatch || isSubmitting}
          >
            {isSubmitting ? "Deleting..." : confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">{helperText}</p>
        <div className="space-y-2">
          <label
            htmlFor="delete-confirmation-word"
            className="block text-sm font-semibold text-text-primary"
          >
            Confirmation Word
          </label>
          <Input
            id="delete-confirmation-word"
            value={typedValue}
            onChange={(event) => setTypedValue(event.target.value)}
            placeholder={confirmationWord}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
          />
        </div>
        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
