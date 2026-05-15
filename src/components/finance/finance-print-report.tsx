import Image from "next/image";
import { FinancePrintActions } from "./finance-print-actions";
import { CHURCH_NAME_REPORT } from "@/lib/branding";
import type { ReportSignatoryItem } from "@/lib/report-signatories";

type FinancePrintSummary = {
  label: string;
  value: string;
  caption: string;
};

type FinancePrintReportProps = {
  title: string;
  subtitle: string;
  generatedAt: string;
  filters: string[];
  summaries: FinancePrintSummary[];
  columns: string[];
  rows: string[][];
  signatories?: ReportSignatoryItem[];
  organizationName?: string;
  logoPath?: string | null;
  autoPrint?: boolean;
};

export function FinancePrintReport({
  title,
  subtitle,
  generatedAt,
  filters,
  summaries,
  columns,
  rows,
  signatories = [],
  organizationName = CHURCH_NAME_REPORT,
  logoPath = null,
  autoPrint = true,
}: FinancePrintReportProps) {
  return (
    <main className="min-h-screen bg-stone-100 px-6 py-8 text-stone-900 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto max-w-6xl rounded-2xl border border-stone-200 bg-white shadow-[0_24px_60px_rgba(28,25,23,0.08)] print:max-w-none print:rounded-none print:border-0 print:shadow-none">
        <header className="border-b border-stone-200 bg-[linear-gradient(135deg,#fff7ed_0%,#fffbeb_45%,#ffffff_100%)] px-8 py-8 print:bg-none">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              {logoPath ? (
                <Image
                  src={logoPath}
                  alt={`${organizationName} logo`}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-2xl border border-stone-200 bg-white object-cover"
                />
              ) : null}
              <div>
              <p className="mb-2 text-[11px] font-semibold tracking-[0.24em] text-orange-700 uppercase">
                {organizationName}
              </p>
              <h1 className="font-display text-4xl leading-tight text-stone-900">
                {title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
                {subtitle}
              </p>
              </div>
            </div>
            <FinancePrintActions autoPrint={autoPrint} />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-stone-900 px-3 py-1 text-[11px] font-semibold tracking-[0.2em] text-white uppercase">
              Generated {generatedAt}
            </span>
            {filters.map((filter) => (
              <span
                key={filter}
                className="rounded-full border border-stone-300 bg-white px-3 py-1 text-xs text-stone-600"
              >
                {filter}
              </span>
            ))}
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 px-8 py-6 md:grid-cols-3">
          {summaries.map((summary) => (
            <article
              key={summary.label}
              className="rounded-2xl border border-stone-200 bg-stone-50 p-5"
            >
              <p className="text-[11px] font-semibold tracking-[0.22em] text-stone-500 uppercase">
                {summary.label}
              </p>
              <p className="mt-3 font-display text-3xl text-stone-900">
                {summary.value}
              </p>
              <p className="mt-2 text-sm text-stone-600">{summary.caption}</p>
            </article>
          ))}
        </section>

        <section className="px-8 pb-8">
          <div className="overflow-hidden rounded-2xl border border-stone-200">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-stone-100 text-[11px] font-semibold tracking-[0.18em] text-stone-500 uppercase">
                  <tr>
                    {columns.map((column) => (
                      <th key={column} className="px-4 py-4">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 bg-white">
                  {rows.length > 0 ? (
                    rows.map((row, rowIndex) => (
                      <tr key={`${row[0] ?? "row"}-${rowIndex}`}>
                        {row.map((value, valueIndex) => (
                          <td
                            key={`${columns[valueIndex] ?? "col"}-${valueIndex}`}
                            className="px-4 py-4 align-top text-stone-700"
                          >
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="px-4 py-10 text-center text-sm text-stone-500"
                      >
                        No records matched these filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="border-t border-stone-200 px-8 py-8">
          <div className="mb-4">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-stone-500 uppercase">
              Report Signatories
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {signatories.length > 0 ? (
              signatories.map((signatory) => (
                <div
                  key={signatory.publicId}
                  className="rounded-2xl border border-stone-200 bg-stone-50 px-5 py-6"
                >
                  <div className="mb-8 h-12 border-b border-dashed border-stone-300" />
                  <p className="font-semibold text-stone-900">{signatory.fullName}</p>
                  <p className="mt-1 text-sm text-stone-600">
                    {signatory.title ?? signatory.roleName}
                  </p>
                  <p className="mt-2 text-[11px] font-semibold tracking-[0.18em] text-stone-500 uppercase">
                    {signatory.roleName}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-5 py-6 text-sm text-stone-500 md:col-span-2 xl:col-span-4">
                No report signatories are configured yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
