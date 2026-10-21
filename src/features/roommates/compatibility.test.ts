import { describe, expect, it } from "vitest";
import {
  computeCompatibility,
  type CompatibilityPreferences,
  type CompatibilityProfile,
} from "@/features/roommates/compatibility";

const MATCHING_PREFERENCES: CompatibilityPreferences = {
  sharing_arrangement: "shared_room",
  sleep_schedule: "early_bird",
  cleanliness: "tidy",
  cooking: "often",
  study_environment: "quiet",
  guest_policy: "rarely",
  smoking: "no",
};

function factor(result: ReturnType<typeof computeCompatibility>, key: string) {
  return result.factors.find((item) => item.key === key);
}

describe("computeCompatibility", () => {
  it("scores 100 when budgets overlap and every preference matches", () => {
    const mine: CompatibilityProfile = { budget_min: 100_000, budget_max: 200_000 };
    const theirs: CompatibilityProfile = { budget_min: 120_000, budget_max: 180_000 };

    const result = computeCompatibility(mine, MATCHING_PREFERENCES, theirs, {
      ...MATCHING_PREFERENCES,
    });

    expect(result.score).toBe(100);
    expect(result.factors.every((item) => item.result === "match")).toBe(true);
  });

  it("treats wildcard values as neutral rather than a mismatch", () => {
    const mine: CompatibilityProfile = { budget_min: 100_000, budget_max: 200_000 };
    const theirs: CompatibilityProfile = { budget_min: 400_000, budget_max: 500_000 };

    const result = computeCompatibility(mine, MATCHING_PREFERENCES, theirs, {
      ...MATCHING_PREFERENCES,
      sleep_schedule: "flexible",
    });

    expect(factor(result, "sleep_schedule")?.result).toBe("neutral");
    expect(factor(result, "budget")?.result).toBe("mismatch");
    expect(result.score).toBe(80);
  });

  it("flags a smoking mismatch even when everything else is unset", () => {
    const result = computeCompatibility(
      null,
      { ...MATCHING_PREFERENCES, smoking: "no" },
      null,
      { ...MATCHING_PREFERENCES, smoking: "yes" },
    );

    expect(factor(result, "smoking")?.result).toBe("mismatch");
  });

  it("scores 43 when only the smoking answer differs", () => {
    const empty: CompatibilityPreferences = {
      sharing_arrangement: null,
      sleep_schedule: null,
      cleanliness: null,
      cooking: null,
      study_environment: null,
      guest_policy: null,
      smoking: null,
    };

    const result = computeCompatibility(
      null,
      { ...empty, smoking: "no" },
      null,
      { ...empty, smoking: "yes" },
    );

    expect(factor(result, "smoking")?.result).toBe("mismatch");
    expect(result.score).toBe(43);
  });

  it("returns a neutral 50 when nothing is set on either side", () => {
    const result = computeCompatibility(null, null, null, null);

    expect(result.score).toBe(50);
    expect(result.factors).toHaveLength(8);
    expect(result.factors.every((item) => item.result === "neutral")).toBe(true);
  });

  it("treats one-sided budget ranges as an overlap when they intersect", () => {
    const result = computeCompatibility(
      { budget_min: 100_000, budget_max: null },
      null,
      { budget_min: null, budget_max: 150_000 },
      null,
    );

    expect(factor(result, "budget")?.result).toBe("match");
  });

  it("treats disjoint budget ranges as a mismatch", () => {
    const result = computeCompatibility(
      { budget_min: 100_000, budget_max: 200_000 },
      null,
      { budget_min: 300_000, budget_max: 400_000 },
      null,
    );

    expect(factor(result, "budget")?.result).toBe("mismatch");
  });

  it("treats partial preferences as neutral", () => {
    const result = computeCompatibility(
      null,
      { ...MATCHING_PREFERENCES, cleanliness: null },
      null,
      { ...MATCHING_PREFERENCES },
    );

    expect(factor(result, "cleanliness")?.result).toBe("neutral");
    expect(factor(result, "cleanliness")?.mineLabel).toBe("Not set");
  });
});
