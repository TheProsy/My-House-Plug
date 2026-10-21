"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CalendarCheck } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  confirmAvailabilityAction,
  type ProviderActionState,
} from "@/features/provider/actions";

const initialState: ProviderActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      <CalendarCheck className="size-4" aria-hidden="true" />
      {pending ? "Confirming…" : "Confirm still available"}
    </Button>
  );
}

export function AvailabilityForm({ propertyId }: { propertyId: string }) {
  const [state, formAction] = useActionState(confirmAvailabilityAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
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

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-40 flex-1">
          <label
            htmlFor="availability-notes"
            className="text-xs font-medium text-ink-500"
          >
            Note for renters (optional)
          </label>
          <Input
            id="availability-notes"
            name="notes"
            placeholder="e.g. Two rooms left, viewing any day before 5pm"
            maxLength={300}
          />
        </div>
        <SubmitButton />
      </div>
    </form>
  );
}
