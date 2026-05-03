"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/cn";

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  description?: string;
  className?: string;
};

export function Modal({
  open,
  onOpenChange,
  title,
  children,
  footer,
  description,
  className,
}: ModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-md"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onOpenChange(false);
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? "modal-description" : undefined}
        className={cn(
          "flex max-h-[calc(100vh-32px)] w-full max-w-xl flex-col overflow-hidden rounded-lg border border-border bg-white text-left shadow-[0_24px_48px_rgba(28,25,23,0.12)]",
          className,
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border bg-background p-6">
          <div>
            <h2
              id="modal-title"
              className="font-display text-3xl leading-tight text-text-primary"
            >
              {title}
            </h2>
            {description ? (
              <p id="modal-description" className="mt-1 text-sm text-text-secondary">
                {description}
              </p>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Close modal"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </header>

        <div className="overflow-y-auto p-6 md:p-8">{children}</div>

        {footer ? (
          <footer className="flex justify-end gap-3 border-t border-border bg-background p-6">
            {footer}
          </footer>
        ) : null}
      </section>
    </div>
  );
}
