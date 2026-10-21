"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { PlusCircle } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { COST_CATEGORY_LABELS, COST_RECURRENCE_LABELS } from "@/lib/constants";
import { addCostAction, type ProviderActionState } from "@/features/provider/actions";

const initialState: ProviderActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" disabled={pending}>
      <PlusCircle className="size-4" aria-hidden="true" />
      {pending ? "Adding…" : "Add cost"}
    </Button>
  );
}

export function CostForm({ propertyId }: { propertyId: string }) {
  const [state, formAction] = useActionState(addCostAction, initialState);

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
        <Field label="Label" htmlFor="cost-label" hint="Exactly what a renter will be asked to pay.">
          <Input
            id="cost-label"
            name="label"
            placeholder="e.g. Agency fee"
            maxLength={80}
            required
          />
        </Field>
        <Field label="Category" htmlFor="cost-category">
          <Select id="cost-category" name="category" defaultValue="agency_fee" required>
            {Object.entries(COST_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Amount (₦)" htmlFor="cost-amount" optional hint="Leave empty if not confirmed yet.">
          <Input
            id="cost-amount"
            name="amount"
            type="number"
            inputMode="numeric"
            min={0}
            step={5000}
            placeholder="15000"
          />
        </Field>
        <Field label="Recurrence" htmlFor="cost-recurrence">
          <Select id="cost-recurrence" name="recurrence" defaultValue="one_time">
            {Object.entries(COST_RECURRENCE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Notes" htmlFor="cost-notes" optional>
          <Input
            id="cost-notes"
            name="notes"
            placeholder="e.g. Split with landlord"
            maxLength={300}
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-5 text-sm text-ink-600">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isKnown"
            defaultChecked
            className="size-4 rounded border-line accent-brand-700"
          />
          Amount is confirmed
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isMandatory"
            defaultChecked
            className="size-4 rounded border-line accent-brand-700"
          />
          Mandatory
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isRefundable"
            className="size-4 rounded border-line accent-brand-700"
          />
          Refundable
        </label>
      </div>

      <SubmitButton />
    </form>
  );
}
