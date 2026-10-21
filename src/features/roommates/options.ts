export interface Choice {
  value: string;
  label: string;
}

export const SLEEP_SCHEDULE_OPTIONS: Choice[] = [
  { value: "early_bird", label: "Early bird" },
  { value: "night_owl", label: "Night owl" },
  { value: "flexible", label: "Flexible" },
];

export const CLEANLINESS_OPTIONS: Choice[] = [
  { value: "tidy", label: "Tidy" },
  { value: "moderate", label: "Moderate" },
  { value: "relaxed", label: "Relaxed" },
];

export const COOKING_OPTIONS: Choice[] = [
  { value: "often", label: "Cooks often" },
  { value: "sometimes", label: "Cooks sometimes" },
  { value: "rarely", label: "Rarely cooks" },
];

export const STUDY_ENVIRONMENT_OPTIONS: Choice[] = [
  { value: "quiet", label: "Quiet" },
  { value: "some_noise", label: "Some noise is fine" },
  { value: "flexible", label: "Flexible" },
];

export const GUEST_POLICY_OPTIONS: Choice[] = [
  { value: "rarely", label: "Guests rarely" },
  { value: "occasionally", label: "Guests occasionally" },
  { value: "often", label: "Guests often" },
];

export const SMOKING_OPTIONS: Choice[] = [
  { value: "no", label: "No smoking" },
  { value: "outside_only", label: "Outside only" },
  { value: "yes", label: "Smokes" },
];

export const SHARING_ARRANGEMENT_OPTIONS: Choice[] = [
  { value: "own_room_shared_flat", label: "Own room in a shared flat" },
  { value: "shared_room", label: "Shared room" },
  { value: "any", label: "Any arrangement" },
];

export const CONTACT_VISIBILITY_OPTIONS: Choice[] = [
  { value: "on_match", label: "Share my phone number when we match" },
  { value: "after_request", label: "Ask me first, then I decide" },
  { value: "private", label: "Keep my phone number private" },
];

export function choiceLabel(
  options: Choice[],
  value: string | null | undefined,
): string {
  if (!value) return "Not set";
  return options.find((option) => option.value === value)?.label ?? value;
}
