"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, UserRound } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  saveRoommateProfileAction,
  type RoommateActionState,
} from "@/features/roommates/actions";
import {
  CLEANLINESS_OPTIONS,
  CONTACT_VISIBILITY_OPTIONS,
  COOKING_OPTIONS,
  GUEST_POLICY_OPTIONS,
  SHARING_ARRANGEMENT_OPTIONS,
  SLEEP_SCHEDULE_OPTIONS,
  SMOKING_OPTIONS,
  STUDY_ENVIRONMENT_OPTIONS,
  type Choice,
} from "@/features/roommates/options";
import type { CampusOption } from "@/features/accommodation/queries";
import { PROPERTY_TYPE_LABELS } from "@/lib/constants";
import type { Tables } from "@/types/database";

const initialState: RoommateActionState = {};

const ACCOMMODATION_TYPE_ENTRIES = Object.entries(PROPERTY_TYPE_LABELS);

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save roommate profile"}
      {!pending && <UserRound className="size-4" aria-hidden="true" />}
    </Button>
  );
}

function OptionalSelect({
  id,
  name,
  label,
  options,
  defaultValue,
}: {
  id: string;
  name: string;
  label: string;
  options: Choice[];
  defaultValue: string | null;
}) {
  return (
    <Field label={label} htmlFor={id} optional>
      <Select id={id} name={name} defaultValue={defaultValue ?? ""}>
        <option value="">No preference</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </Field>
  );
}

interface RoommateProfileFormProps {
  campuses: CampusOption[];
  profile: Tables<"roommate_profiles"> | null;
  preferences: Tables<"roommate_preferences"> | null;
}

export function RoommateProfileForm({
  campuses,
  profile,
  preferences,
}: RoommateProfileFormProps) {
  const [state, formAction] = useActionState(
    saveRoommateProfileAction,
    initialState,
  );
  const [campusId, setCampusId] = useState(
    profile?.campus_id ?? campuses[0]?.id ?? "",
  );

  const selectedCampus = campuses.find((campus) => campus.id === campusId);
  const neighbourhoods = selectedCampus?.neighbourhoods ?? [];

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <Alert variant="danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{state.error}</span>
        </Alert>
      )}
      {state.message && (
        <Alert variant="success">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{state.message}</span>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Display name"
          htmlFor="roommate-display-name"
          hint="This is what other students see — a first name or nickname works."
        >
          <Input
            id="roommate-display-name"
            name="displayName"
            defaultValue={profile?.display_name ?? ""}
            maxLength={60}
            required
            placeholder="Chiamaka"
          />
        </Field>

        <Field label="Campus" htmlFor="roommate-campus">
          <Select
            id="roommate-campus"
            name="campusId"
            value={campusId}
            onChange={(event) => setCampusId(event.target.value)}
            required
          >
            {campuses.length === 0 && <option value="">No campuses yet</option>}
            {campuses.map((campus) => (
              <option key={campus.id} value={campus.id}>
                {campus.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Preferred neighbourhood" htmlFor="roommate-neighbourhood">
          <Select
            id="roommate-neighbourhood"
            name="neighbourhoodId"
            defaultValue={profile?.neighbourhood_id ?? ""}
            key={campusId}
          >
            <option value="">Anywhere near campus</option>
            {neighbourhoods.map((neighbourhood) => (
              <option key={neighbourhood.id} value={neighbourhood.id}>
                {neighbourhood.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Space type" htmlFor="roommate-accommodation-type" optional>
          <Select
            id="roommate-accommodation-type"
            name="accommodationType"
            defaultValue={profile?.accommodation_type ?? ""}
          >
            <option value="">Any type</option>
            {ACCOMMODATION_TYPE_ENTRIES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Budget from"
          htmlFor="roommate-budget-min"
          optional
          hint="Monthly room budget in naira."
        >
          <Input
            id="roommate-budget-min"
            name="budgetMin"
            type="number"
            inputMode="numeric"
            min={0}
            step={1000}
            defaultValue={profile?.budget_min ?? ""}
            placeholder="100000"
          />
        </Field>

        <Field label="Budget up to" htmlFor="roommate-budget-max" optional>
          <Input
            id="roommate-budget-max"
            name="budgetMax"
            type="number"
            inputMode="numeric"
            min={0}
            step={1000}
            defaultValue={profile?.budget_max ?? ""}
            placeholder="200000"
          />
        </Field>

        <Field label="Move-in date" htmlFor="roommate-move-in" optional>
          <Input
            id="roommate-move-in"
            name="moveInDate"
            type="date"
            defaultValue={profile?.move_in_date ?? ""}
          />
        </Field>

        <Field label="Sharing arrangement" htmlFor="roommate-sharing">
          <Select
            id="roommate-sharing"
            name="sharingArrangement"
            defaultValue={preferences?.sharing_arrangement ?? "any"}
          >
            {SHARING_ARRANGEMENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field
        label="About you"
        htmlFor="roommate-bio"
        optional
        hint="Level, course, and what you want in a flatmate. Shown on your profile."
      >
        <Textarea
          id="roommate-bio"
          name="bio"
          defaultValue={profile?.bio ?? ""}
          rows={4}
          maxLength={600}
          placeholder="Final-year student looking for a quiet shared flat near campus…"
        />
      </Field>

      <div className="space-y-4">
        <p className="text-sm font-semibold text-ink-900">
          Living habits
        </p>
        <p className="-mt-2 text-xs text-ink-500">
          These power compatibility scores. Leave anything blank to stay
          flexible.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <OptionalSelect
            id="roommate-sleep"
            name="sleepSchedule"
            label="Sleep schedule"
            options={SLEEP_SCHEDULE_OPTIONS}
            defaultValue={preferences?.sleep_schedule ?? null}
          />
          <OptionalSelect
            id="roommate-cleanliness"
            name="cleanliness"
            label="Cleanliness"
            options={CLEANLINESS_OPTIONS}
            defaultValue={preferences?.cleanliness ?? null}
          />
          <OptionalSelect
            id="roommate-cooking"
            name="cooking"
            label="Cooking"
            options={COOKING_OPTIONS}
            defaultValue={preferences?.cooking ?? null}
          />
          <OptionalSelect
            id="roommate-study"
            name="studyEnvironment"
            label="Study environment"
            options={STUDY_ENVIRONMENT_OPTIONS}
            defaultValue={preferences?.study_environment ?? null}
          />
          <OptionalSelect
            id="roommate-guests"
            name="guestPolicy"
            label="Guests"
            options={GUEST_POLICY_OPTIONS}
            defaultValue={preferences?.guest_policy ?? null}
          />
          <OptionalSelect
            id="roommate-smoking"
            name="smoking"
            label="Smoking"
            options={SMOKING_OPTIONS}
            defaultValue={preferences?.smoking ?? null}
          />
        </div>
      </div>

      <Field label="Contact sharing" htmlFor="roommate-contact">
        <Select
          id="roommate-contact"
          name="contactVisibility"
          defaultValue={profile?.contact_visibility ?? "after_request"}
        >
          {CONTACT_VISIBILITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      <div className="flex items-start gap-3 rounded-xl border border-line-soft bg-surface-1 p-3.5">
        <Checkbox
          id="roommate-visible"
          name="isVisible"
          defaultChecked={profile?.is_visible ?? false}
        />
        <div className="space-y-0.5">
          <Label htmlFor="roommate-visible">Make my profile visible</Label>
          <p className="text-xs leading-relaxed text-ink-500">
            Other students can see your display name, campus, budget, and
            habits. Your phone number stays under your contact setting. You can
            hide your profile at any time.
          </p>
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
