export const GLOBAL_SEARCH_MIN_QUERY_LENGTH = 2;
export const GLOBAL_SEARCH_RESULT_LIMIT = 5;

export type GlobalSearchGroupKey =
  | "pages"
  | "members"
  | "events"
  | "income"
  | "expenses";

export type GlobalSearchItem = {
  id: string;
  title: string;
  href: string;
  subtitle?: string | null;
  meta?: string | null;
  group: GlobalSearchGroupKey;
};

export type GlobalSearchGroup = {
  key: GlobalSearchGroupKey;
  label: string;
  items: GlobalSearchItem[];
};

export type GlobalSearchResponse = {
  query: string;
  groups: GlobalSearchGroup[];
};
