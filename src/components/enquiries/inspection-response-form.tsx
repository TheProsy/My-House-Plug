"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/form-field";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import {
  respondToInspectionAction,
  type EnquiryActionState,
} from "@/features/enquiries/actions";
import type { InspectionOutcome, InspectionStatus } from "@/types/database";

const initialState: EnquiryActionState = {};

type InspectionAction =
  | "confirm"
  | "reschedule"
  | "decline"
  | "complete"
  | "cancel"
  | "no_show";

const actionLabels: Record<InspectionAction, string> = {
  confirm: "Confirm the time",
  reschedule: "Propose a new time",
  decline: "Decline this inspection",
  complete: "Mark as completed",
  cancel: "Cancel this request",
  no_show: "Report a no-show",
};

const outcomeOptions: { value: InspectionOutcome; label: string }[] = [
  { value: "positive", label: "Positive — renter is interested" },
  { value: "negative", label: "Negative — renter is not interested" },
  { value: "property_unavailable", label: "Property was not available" },
  { value: "unknown", label: "Not sure yet" },
];

function availableActions(
  role: "renter" | "provider",
  status: InspectionStatus,
): InspectionAction[] {
  if (role === "provider") {
    if (status === "requested") return ["confirm", "reschedule", "decline"];
    if (status === "confirmed") return ["complete", "reschedule", "no_show"];
    if (status === "rescheduled") return ["confirm", "reschedule", "decline"];
    return [];
  }

  if (status === "requested" || status === "confirmed" || status === "rescheduled") {
    return ["cancel"];
  }
  return [];
}

function defaultAction(
  role: "renter" | "provider",
  status: InspectionStatus,
): InspectionAction {
  if (role === "provider") {
    if (status === "confirmed") return "complete";
    return "confirm";
  }
  return "cancel";
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Updating…" : "Update inspection"}
      {!pending && <CheckCircle2 className="size-4" aria-hidden="true" />}
    </Button>
  );
}

export function InspectionResponseForm({
  inspectionId,
  role,
  status,
}: {
  inspectionId: string;
  role: "renter" | "provider";
  status: InspectionStatus;
}) {
  const actions = availableActions(role, status);
  const [action, setAction] = useState<InspectionAction>(() =>
    defaultAction(role, status),
  );
  const [state, formAction] = useActionState(
    respondToInspectionAction,
    initialState,
  );

  if (actions.length === 0) return null;

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1"
    >
      <input type="hidden" name="inspectionId" value={inspectionId} />

      <p className="text-sm font-semibold text-ink-900">
        {role === "provider" ? "Respond to this request" : "Manage this request"}
      </p>

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

      <Field label="What do you want to do?" htmlFor={`inspection-action-${inspectionId}`}>
        <Select
          id={`inspection-action-${inspectionId}`}
          name="action"
          value={action}
          onChange={(event) => setAction(event.target.value as InspectionAction)}
        >
          {actions.map((value) => (
            <option key={value} value={value}>
              {actionLabels[value]}
            </option>
          ))}
        </Select>
      </Field>

      {action === "reschedule" && (
        <Field
          label="New date and time"
          htmlFor={`inspection-time-${inspectionId}`}
          hint="The other party will be notified of the new time."
        >
          <Input
            id={`inspection-time-${inspectionId}`}
            name="scheduledAt"
            type="datetime-local"
            required
          />
        </Field>
      )}

      {action === "complete" && (
        <Field
          label="How did the inspection go?"
          htmlFor={`inspection-outcome-${inspectionId}`}
        >
          <Select
            id={`inspection-outcome-${inspectionId}`}
            name="outcome"
            defaultValue="unknown"
          >
            {outcomeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      )}

      <Field
        label="Notes"
        htmlFor={`inspection-notes-${inspectionId}`}
        optional
        hint="Shared with the other party."
      >
        <Textarea
          id={`inspection-notes-${inspectionId}`}
          name="notes"
          rows={2}
          maxLength={500}
          placeholder={
            action === "reschedule"
              ? "Sorry, Saturday morning is taken — can we do Sunday at 2pm?"
              : "Any detail that helps the other party."
          }
        />
      </Field>

      <SubmitButton />
    </form>
  );
}
