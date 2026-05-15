"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui";

type FinanceExportMenuProps = {
  csvHref: string;
  printHref: string;
  csvLabel: string;
  printLabel: string;
};

export function FinanceExportMenu({
  csvHref,
  printHref,
  csvLabel,
  printLabel,
}: FinanceExportMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="secondary"
        size="lg"
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open export options"
        onClick={() => setOpen((current) => !current)}
      >
        <Download className="h-4 w-4" aria-hidden />
        Export
        <ChevronDown className="h-4 w-4" aria-hidden />
      </Button>

      {open ? (
        <div className="absolute top-full right-0 z-40 mt-2 w-48 rounded-lg border border-border bg-white p-2 shadow-xl">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-text-primary transition-colors hover:bg-surface-raised"
            onClick={() => {
              setOpen(false);
              window.location.href = csvHref;
            }}
          >
            <Download className="h-4 w-4" aria-hidden />
            {csvLabel}
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-text-primary transition-colors hover:bg-surface-raised"
            onClick={() => {
              setOpen(false);
              window.open(printHref, "_blank", "noopener,noreferrer");
            }}
          >
            <Printer className="h-4 w-4" aria-hidden />
            {printLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}
