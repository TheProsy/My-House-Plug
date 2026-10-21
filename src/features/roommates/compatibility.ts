import { formatNaira } from "@/lib/utils";
import {
  CLEANLINESS_OPTIONS,
  COOKING_OPTIONS,
  GUEST_POLICY_OPTIONS,
  SHARING_ARRANGEMENT_OPTIONS,
  SLEEP_SCHEDULE_OPTIONS,
  SMOKING_OPTIONS,
  STUDY_ENVIRONMENT_OPTIONS,
  choiceLabel,
  type Choice,
} from "@/features/roommates/options";

export type FactorResult = "match" | "neutral" | "mismatch";

export interface CompatibilityFactor {
  key: string;
  label: string;
  mineLabel: string;
  theirsLabel: string;
  result: FactorResult;
  weight: number;
}

export interface CompatibilityResult {
  score: number;
  factors: CompatibilityFactor[];
}

export interface CompatibilityProfile {
  budget_min: number | null;
  budget_max: number | null;
}

export interface CompatibilityPreferences {
  sharing_arrangement: string | null;
  sleep_schedule: string | null;
  cleanliness: string | null;
  cooking: string | null;
  study_environment: string | null;
  guest_policy: string | null;
  smoking: string | null;
}

interface PreferenceValues {
  sharing_arrangement: string | null;
  sleep_schedule: string | null;
  cleanliness: string | null;
  cooking: string | null;
  study_environment: string | null;
  guest_policy: string | null;
  smoking: string | null;
}

const WILDCARDS = new Set(["flexible", "any"]);

function preferenceValues(
  preferences: CompatibilityPreferences | null,
): PreferenceValues {
  return {
    sharing_arrangement: preferences?.sharing_arrangement ?? null,
    sleep_schedule: preferences?.sleep_schedule ?? null,
    cleanliness: preferences?.cleanliness ?? null,
    cooking: preferences?.cooking ?? null,
    study_environment: preferences?.study_environment ?? null,
    guest_policy: preferences?.guest_policy ?? null,
    smoking: preferences?.smoking ?? null,
  };
}

function evaluateValue(mine: string | null, theirs: string | null): FactorResult {
  if (!mine || !theirs) return "neutral";
  if (mine === theirs) return "match";
  if (WILDCARDS.has(mine) || WILDCARDS.has(theirs)) return "neutral";
  return "mismatch";
}

function budgetLabel(
  profile: CompatibilityProfile | null,
): string {
  const min = profile?.budget_min ?? null;
  const max = profile?.budget_max ?? null;
  if (min === null && max === null) return "Not set";
  if (min !== null && max !== null) return `${formatNaira(min)} – ${formatNaira(max)}`;
  return min !== null ? `From ${formatNaira(min)}` : `Up to ${formatNaira(max)}`;
}

function evaluateBudget(
  mine: CompatibilityProfile | null,
  theirs: CompatibilityProfile | null,
): FactorResult {
  const mineMin = mine?.budget_min ?? null;
  const mineMax = mine?.budget_max ?? null;
  const theirsMin = theirs?.budget_min ?? null;
  const theirsMax = theirs?.budget_max ?? null;

  if (
    (mineMin === null && mineMax === null) ||
    (theirsMin === null && theirsMax === null)
  ) {
    return "neutral";
  }

  const aMin = mineMin ?? 0;
  const aMax = mineMax ?? Number.POSITIVE_INFINITY;
  const bMin = theirsMin ?? 0;
  const bMax = theirsMax ?? Number.POSITIVE_INFINITY;

  return aMin <= bMax && bMin <= aMax ? "match" : "mismatch";
}

interface FactorDefinition {
  key: keyof PreferenceValues;
  label: string;
  options: Choice[];
  weight: number;
}

const FACTOR_DEFINITIONS: FactorDefinition[] = [
  {
    key: "sharing_arrangement",
    label: "Sharing arrangement",
    options: SHARING_ARRANGEMENT_OPTIONS,
    weight: 20,
  },
  {
    key: "sleep_schedule",
    label: "Sleep schedule",
    options: SLEEP_SCHEDULE_OPTIONS,
    weight: 15,
  },
  {
    key: "cleanliness",
    label: "Cleanliness",
    options: CLEANLINESS_OPTIONS,
    weight: 15,
  },
  {
    key: "study_environment",
    label: "Study environment",
    options: STUDY_ENVIRONMENT_OPTIONS,
    weight: 15,
  },
  {
    key: "smoking",
    label: "Smoking",
    options: SMOKING_OPTIONS,
    weight: 15,
  },
  {
    key: "guest_policy",
    label: "Guests",
    options: GUEST_POLICY_OPTIONS,
    weight: 10,
  },
  {
    key: "cooking",
    label: "Cooking",
    options: COOKING_OPTIONS,
    weight: 10,
  },
];

export function computeCompatibility(
  mine: CompatibilityProfile | null,
  minePreferences: CompatibilityPreferences | null,
  theirs: CompatibilityProfile | null,
  theirsPreferences: CompatibilityPreferences | null,
): CompatibilityResult {
  const mineValues = preferenceValues(minePreferences);
  const theirsValues = preferenceValues(theirsPreferences);

  const factors: CompatibilityFactor[] = FACTOR_DEFINITIONS.map((definition) => {
    const mineValue = mineValues[definition.key];
    const theirsValue = theirsValues[definition.key];
    return {
      key: definition.key,
      label: definition.label,
      mineLabel: choiceLabel(definition.options, mineValue),
      theirsLabel: choiceLabel(definition.options, theirsValue),
      result: evaluateValue(mineValue, theirsValue),
      weight: definition.weight,
    };
  });

  factors.push({
    key: "budget",
    label: "Budget overlap",
    mineLabel: budgetLabel(mine),
    theirsLabel: budgetLabel(theirs),
    result: evaluateBudget(mine, theirs),
    weight: 15,
  });

  const total = factors.reduce((sum, factor) => sum + factor.weight, 0);
  const earned = factors.reduce((sum, factor) => {
    const credit =
      factor.result === "match" ? 1 : factor.result === "neutral" ? 0.5 : 0;
    return sum + factor.weight * credit;
  }, 0);

  return {
    score: Math.round((earned / total) * 100),
    factors,
  };
}
