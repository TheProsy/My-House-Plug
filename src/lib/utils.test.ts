import { describe, expect, it } from "vitest";
import {
  daysAgo,
  formatNaira,
  formatRentPeriod,
  isAvailabilityStale,
  safeRedirectPath,
  timeAgo,
} from "@/lib/utils";

function daysBack(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

describe("formatNaira", () => {
  it("formats whole naira amounts", () => {
    expect(formatNaira(12_000)).toContain("12,000");
    expect(formatNaira(0)).toContain("0");
  });

  it("renders a dash for missing amounts", () => {
    expect(formatNaira(null)).toBe("—");
    expect(formatNaira(undefined)).toBe("—");
  });
});

describe("formatRentPeriod", () => {
  it("maps known periods", () => {
    expect(formatRentPeriod("per_year")).toBe("per year");
    expect(formatRentPeriod("per_semester")).toBe("per semester");
  });

  it("returns an empty string for unknown periods", () => {
    expect(formatRentPeriod("per_fortnight")).toBe("");
  });
});

describe("timeAgo", () => {
  it("describes today and yesterday", () => {
    expect(timeAgo(new Date())).toBe("today");
    expect(timeAgo(daysBack(1))).toBe("yesterday");
  });

  it("counts days under a month", () => {
    expect(timeAgo(daysBack(2))).toBe("2 days ago");
    expect(timeAgo(daysBack(29))).toBe("29 days ago");
  });

  it("counts months beyond a month", () => {
    expect(timeAgo(daysBack(45))).toBe("1 month ago");
    expect(timeAgo(daysBack(75))).toBe("2 months ago");
  });

  it("handles missing values", () => {
    expect(timeAgo(null)).toBe("unknown");
    expect(daysAgo(null)).toBeNull();
  });
});

describe("safeRedirectPath", () => {
  it("allows internal paths", () => {
    expect(safeRedirectPath("/dashboard")).toBe("/dashboard");
    expect(safeRedirectPath("/report?property=sunny")).toBe(
      "/report?property=sunny",
    );
  });

  it("blocks absolute and protocol-relative URLs", () => {
    expect(safeRedirectPath("https://evil.example")).toBeNull();
    expect(safeRedirectPath("//evil.example")).toBeNull();
    expect(safeRedirectPath("/\\evil.example")).toBeNull();
  });

  it("handles empty values", () => {
    expect(safeRedirectPath(null)).toBeNull();
    expect(safeRedirectPath(undefined)).toBeNull();
    expect(safeRedirectPath("")).toBeNull();
  });
});

describe("isAvailabilityStale", () => {
  it("treats missing confirmations as stale", () => {
    expect(isAvailabilityStale(null)).toBe(true);
  });

  it("treats recent confirmations as fresh", () => {
    expect(isAvailabilityStale(daysBack(5).toISOString())).toBe(false);
  });

  it("treats old confirmations as stale", () => {
    expect(isAvailabilityStale(daysBack(20).toISOString())).toBe(true);
  });
});
