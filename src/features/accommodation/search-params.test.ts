import { describe, expect, it } from "vitest";
import {
  buildSearchHref,
  countActiveFilters,
  parseSearchParams,
} from "@/features/accommodation/search-params";

const CAMPUS_ID = "aaaaaaaa-0000-4000-8000-000000000001";

describe("parseSearchParams", () => {
  it("parses valid values and takes the first of repeated params", () => {
    const parsed = parseSearchParams({
      q: ["futa", "ignored"],
      campus: CAMPUS_ID,
      min: "50000",
      page: "2",
    });

    expect(parsed.q).toBe("futa");
    expect(parsed.campus).toBe(CAMPUS_ID);
    expect(parsed.min).toBe(50_000);
    expect(parsed.page).toBe(2);
  });

  it("falls back to defaults when a value is invalid", () => {
    const parsed = parseSearchParams({
      campus: "not-a-uuid",
      page: "0",
      type: "mansion",
    });

    expect(parsed.campus).toBeUndefined();
    expect(parsed.type).toBeUndefined();
    expect(parsed.page).toBe(1);
    expect(parsed.sort).toBe("relevance");
  });

  it("normalises empty numeric strings to undefined", () => {
    const parsed = parseSearchParams({ min: "", max: "" });

    expect(parsed.min).toBeUndefined();
    expect(parsed.max).toBeUndefined();
  });
});

describe("buildSearchHref", () => {
  it("returns a bare /search when there are no filters", () => {
    expect(buildSearchHref({})).toBe("/search");
  });

  it("omits default sort and page 1", () => {
    expect(
      buildSearchHref({ campus: CAMPUS_ID, sort: "relevance", page: 1 }),
    ).toBe(`/search?campus=${CAMPUS_ID}`);
  });

  it("appends non-default sort last", () => {
    expect(buildSearchHref({ type: "one_bedroom", sort: "price_asc" })).toBe(
      "/search?type=one_bedroom&sort=price_asc",
    );
  });

  it("honours page overrides above page 1", () => {
    expect(buildSearchHref({ q: "gbagada" }, { page: 3 })).toBe(
      "/search?q=gbagada&page=3",
    );
  });
});

describe("countActiveFilters", () => {
  it("counts only real filters", () => {
    const parsed = parseSearchParams({
      q: "akure",
      campus: CAMPUS_ID,
      furnished: "yes",
    });

    expect(countActiveFilters(parsed)).toBe(3);
  });

  it("counts zero when nothing is set", () => {
    expect(countActiveFilters(parseSearchParams({}))).toBe(0);
  });
});
