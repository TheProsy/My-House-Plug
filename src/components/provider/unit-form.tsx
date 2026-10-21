"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { PlusCircle } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PROPERTY_TYPE_LABELS } from "@/lib/constants";
import { addUnitAction, type ProviderActionState } from "@/features/provider/actions";

const initialState: ProviderActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" disabled={pending}>
      <PlusCircle className="size-4" aria-hidden="true" />
      {pending ? "Adding…" : "Add unit"}
    </Button>
  );
}

export function UnitForm({ propertyId }: { propertyId: string }) {
  const [state, formAction] = useActionState(addUnitAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="propertyId" value={propertyId} />

      {state.error && (
        <Alert variant="danger">
          <span>{state.error}</span>
        </Alert>
      )}
      {state.message && (
        <Alert variant="success">
          <span>{state.message}</span>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Unit name" htmlFor="unit-title">
          <Input
            id="unit-title"
            name="title"
            placeholder="e.g. Room 2 — upstairs"
            maxLength={80}
            required
          />
        </Field>
        <Field label="Unit type" htmlFor="unit-type">
          <Select id="unit-type" name="unitType" defaultValue="self_contain" required>
            {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Field label="Bedrooms" htmlFor="unit-bedrooms" optional>
          <Input
            id="unit-bedrooms"
            name="bedrooms"
            type="number"
            inputMode="numeric"
            min={0}
            max={20}
            placeholder="1"
          />
        </Field>
        <Field label="Bathrooms" htmlFor="unit-bathrooms" optional>
          <Input
            id="unit-bathrooms"
            name="bathrooms"
            type="number"
            inputMode="numeric"
            min={0}
            max={20}
            placeholder="1"
          />
        </Field>
        <Field label="Yearly rent (₦)" htmlFor="unit-rent">
          <Input
            id="unit-rent"
            name="rentAmount"
            type="number"
            inputMode="numeric"
            min={0}
            step={10000}
            placeholder="250000"
            required
          />
        </Field>
        <Field label="Rent period" htmlFor="unit-period">
          <Select id="unit-period" name="rentPeriod" defaultValue="per_year">
            <option value="per_year">Per year</option>
            <option value="per_six_months">Per 6 months</option>
            <option value="per_semester">Per semester</option>
            <option value="per_month">Per month</option>
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Available from" htmlFor="unit-available" optional>
          <Input id="unit-available" name="availableFrom" type="date" />
        </Field>
        <label className="flex items-center gap-2.5 self-end pb-2 text-sm text-ink-600">
          <input
            type="checkbox"
            name="isShared"
            className="size-4 rounded border-line accent-brand-700"
          />
          This unit is shared
        </label>
      </div>

      <SubmitButton />
    </form>
  );
}
