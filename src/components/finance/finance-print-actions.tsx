"use client";

import { useEffect, useRef } from "react";
import { Download, Printer } from "lucide-react";

type FinancePrintActionsProps = {
  autoPrint?: boolean;
};

export function FinancePrintActions({
  autoPrint = false,
}: FinancePrintActionsProps) {
  const hasPrintedRef = useRef(false);

  useEffect(() => {
    if (!autoPrint || hasPrintedRef.current) {
      return;
    }

    hasPrintedRef.current = true;
    window.print();
  }, [autoPrint]);

  return (
    <div className="flex flex-wrap items-center gap-3 print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white transition-all duration-150 hover:bg-primary-hover"
      >
        <Printer className="h-4 w-4" aria-hidden />
        Print Report
      </button>
      <div className="inline-flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-xs text-text-secondary">
        <Download className="h-4 w-4" aria-hidden />
        Choose &quot;Save as PDF&quot; in the print dialog.
      </div>
    </div>
  );
}
