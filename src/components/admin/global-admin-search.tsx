"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui";
import {
  GLOBAL_SEARCH_MIN_QUERY_LENGTH,
  type GlobalSearchResponse,
} from "@/lib/global-search";

const searchResultsId = "global-admin-search-results";

export function GlobalAdminSearch() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<GlobalSearchResponse>({
    query: "",
    groups: [],
  });

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTypingField =
        target instanceof HTMLInputElement
        || target instanceof HTMLTextAreaElement
        || target?.isContentEditable;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }

      if (!isTypingField && event.key === "/") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < GLOBAL_SEARCH_MIN_QUERY_LENGTH) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/search?query=${encodeURIComponent(trimmedQuery)}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Search request failed.");
        }

        const data = (await response.json()) as GlobalSearchResponse;
        setResults(data);
        setOpen(true);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setResults({
            query: trimmedQuery,
            groups: [],
          });
        }
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  const showEmptyState =
    query.trim().length >= GLOBAL_SEARCH_MIN_QUERY_LENGTH
    && !loading
    && results.groups.length === 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral"
        aria-hidden
      />
      <Input
        ref={inputRef}
        value={query}
        onChange={(event) => {
          const nextQuery = event.target.value;
          const trimmedQuery = nextQuery.trim();

          setQuery(nextQuery);

          if (trimmedQuery.length < GLOBAL_SEARCH_MIN_QUERY_LENGTH) {
            setLoading(false);
            setOpen(false);
            setResults({
              query: trimmedQuery,
              groups: [],
            });
          }
        }}
        onFocus={() => {
          if (query.trim().length >= GLOBAL_SEARCH_MIN_QUERY_LENGTH || results.groups.length > 0) {
            setOpen(true);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        className="bg-surface pr-16 pl-9"
        placeholder="Search records or pages..."
        aria-label="Global search"
        title="Search members, events, finances, and pages"
        aria-expanded={open}
        aria-controls={searchResultsId}
        aria-autocomplete="list"
      />
      <span className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded border border-border bg-background px-1.5 py-0.5 text-[11px] font-semibold text-text-secondary md:inline">
        Ctrl K
      </span>

      {open ? (
        <div
          id={searchResultsId}
          className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-xl border border-border bg-background shadow-[0_16px_48px_rgba(28,25,23,0.18)]"
        >
          {loading ? (
            <div className="px-4 py-3 text-sm text-text-secondary">
              Searching...
            </div>
          ) : null}

          {!loading && query.trim().length < GLOBAL_SEARCH_MIN_QUERY_LENGTH ? (
            <div className="px-4 py-3 text-sm text-text-secondary">
              Type at least {GLOBAL_SEARCH_MIN_QUERY_LENGTH} characters to search.
            </div>
          ) : null}

          {!loading && results.groups.length > 0 ? (
            <div className="max-h-[28rem] overflow-y-auto py-2">
              {results.groups.map((group) => (
                <section key={group.key} className="border-t border-border/70 first:border-t-0">
                  <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    {group.label}
                  </div>
                  <div className="pb-2">
                    {group.items.map((item) => (
                      <Link
                        key={`${group.key}-${item.id}`}
                        href={item.href}
                        className="block px-4 py-2 transition-colors hover:bg-surface-raised"
                        onClick={() => setOpen(false)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-text-primary">
                              {item.title}
                            </p>
                            {item.subtitle ? (
                              <p className="truncate text-xs text-text-secondary">
                                {item.subtitle}
                              </p>
                            ) : null}
                          </div>
                          {item.meta ? (
                            <span className="shrink-0 rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold text-text-secondary">
                              {item.meta}
                            </span>
                          ) : null}
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : null}

          {showEmptyState ? (
            <div className="px-4 py-3 text-sm text-text-secondary">
              No matches found for &quot;{query.trim()}&quot;.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
