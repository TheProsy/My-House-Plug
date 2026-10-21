import { searchParamsSchema, type SearchParams } from "@/schemas/search";

type RawSearchParams = Record<string, string | string[] | undefined>;

const KEYS = [
  "q",
  "campus",
  "neighbourhood",
  "type",
  "min",
  "max",
  "furnished",
  "sort",
  "page",
] as const;

function flatten(raw: RawSearchParams): Record<string, string | undefined> {
  const flat: Record<string, string | undefined> = {};
  for (const key of KEYS) {
    const value = raw[key];
    flat[key] = Array.isArray(value) ? value[0] : value;
  }
  return flat;
}

export function parseSearchParams(raw: RawSearchParams): SearchParams {
  const parsed = searchParamsSchema.safeParse(flatten(raw));
  if (parsed.success) return parsed.data;
  return searchParamsSchema.parse({});
}

export function buildSearchHref(
  params: Partial<SearchParams>,
  overrides: Partial<Record<keyof SearchParams, string | number | undefined>> = {},
): string {
  const merged = { ...params, ...overrides };
  const query = new URLSearchParams();

  for (const key of KEYS) {
    if (key === "sort") continue;
    if (key === "page") continue;
    const value = merged[key];
    if (value === undefined || value === "" || value === null) continue;
    query.set(key, String(value));
  }

  if (merged.sort && merged.sort !== "relevance") {
    query.set("sort", String(merged.sort));
  }

  const page = overrides.page ?? merged.page;
  if (page !== undefined && Number(page) > 1) {
    query.set("page", String(page));
  }

  const suffix = query.toString();
  return suffix ? `/search?${suffix}` : "/search";
}

export function countActiveFilters(params: SearchParams): number {
  let count = 0;
  if (params.q) count += 1;
  if (params.campus) count += 1;
  if (params.neighbourhood) count += 1;
  if (params.type) count += 1;
  if (params.min !== undefined) count += 1;
  if (params.max !== undefined) count += 1;
  if (params.furnished) count += 1;
  return count;
}
