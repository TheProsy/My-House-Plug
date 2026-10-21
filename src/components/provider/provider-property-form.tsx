"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PROPERTY_TYPE_LABELS } from "@/lib/constants";
import type { CampusOption } from "@/features/accommodation/queries";
import type {
  ProviderActionState,
} from "@/features/provider/actions";
import {
  createProviderPropertyAction,
  updateProviderPropertyAction,
} from "@/features/provider/actions";

const initialState: ProviderActionState = {};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}

interface ProviderPropertyFormProps {
  campuses: CampusOption[];
  mode: "create" | "edit";
  propertyId?: string;
  defaults?: {
    title: string;
    description: string;
    propertyType: string;
    campusId: string;
    neighbourhoodId: string;
    address: string;
    furnished: "yes" | "no" | "unspecified";
  };
}

export function ProviderPropertyForm({
  campuses,
  mode,
  propertyId,
  defaults,
}: ProviderPropertyFormProps) {
  const action =
    mode === "create"
      ? createProviderPropertyAction
      : updateProviderPropertyAction;
  const [state, formAction] = useActionState(action, initialState);
  const [campusId, setCampusId] = useState(defaults?.campusId ?? "");

  const neighbourhoods =
    campuses.find((campus) => campus.id === campusId)?.neighbourhoods ?? [];

  return (
    <form action={formAction} className="space-y-5">
      {propertyId && (
        <input type="hidden" name="propertyId" value={propertyId} />
      )}

      {state.error && (
        <Alert variant="danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{state.error}</span>
        </Alert>
      )}

      <Field
        label="Listing title"
        htmlFor="property-title"
        hint="What a renter sees first — include the room type and standout details."
      >
        <Input
          id="property-title"
          name="title"
          defaultValue={defaults?.title}
          placeholder="e.g. Spacious self-contain, 5 minutes from FUTA south gate"
          maxLength={120}
          required
        />
      </Field>

      <Field
        label="Description"
        htmlFor="property-description"
        hint="Be specific about the space, water, power, and what makes it worth inspecting."
      >
        <textarea
          id="property-description"
          name="description"
          defaultValue={defaults?.description}
          rows={5}
          maxLength={4000}
          required
          className="w-full rounded-md border border-line bg-surface-2 px-3 py-2 text-sm text-ink-900 shadow-e1 placeholder:text-ink-400"
          placeholder="Describe the property honestly…"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Property type" htmlFor="property-type">
          <Select
            id="property-type"
            name="propertyType"
            defaultValue={defaults?.propertyType ?? "self_contain"}
            required
          >
            {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Furnishing" htmlFor="property-furnished">
          <Select
            id="property-furnished"
            name="furnished"
            defaultValue={defaults?.furnished ?? "unspecified"}
          >
            <option value="unspecified">Not specified</option>
            <option value="yes">Furnished</option>
            <option value="no">Unfurnished</option>
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Campus" htmlFor="property-campus">
          <Select
            id="property-campus"
            name="campusId"
            value={campusId}
            onChange={(event) => setCampusId(event.target.value)}
            required
          >
            <option value="">Select a campus</option>
            {campuses.map((campus) => (
              <option key={campus.id} value={campus.id}>
                {campus.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Neighbourhood"
          htmlFor="property-neighbourhood"
          hint={campusId ? undefined : "Select a campus first"}
        >
          <Select
            id="property-neighbourhood"
            name="neighbourhoodId"
            defaultValue={defaults?.neighbourhoodId ?? ""}
            disabled={!campusId}
            required
          >
            <option value="">Select a neighbourhood</option>
            {neighbourhoods.map((neighbourhood) => (
              <option key={neighbourhood.id} value={neighbourhood.id}>
                {neighbourhood.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field
        label="Address or landmark"
        htmlFor="property-address"
        optional
        hint="Shown to renters only when you approve an inspection."
      >
        <Input
          id="property-address"
          name="address"
          defaultValue={defaults?.address}
          placeholder="Street, junction, or nearest landmark"
          maxLength={200}
        />
      </Field>

      <div className="flex items-center gap-3">
        <SubmitButton
          label={mode === "create" ? "Save draft and continue" : "Save changes"}
        />
        {mode === "create" && (
          <p className="text-xs text-ink-400">
            You will add units, costs, and photos next.
          </p>
        )}
      </div>
    </form>
  );
}
