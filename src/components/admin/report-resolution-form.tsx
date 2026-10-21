"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/form-field";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import {
  resolveReportAction,
  type AdminActionState,
} from "@/features/admin/actions";

const initialState: AdminActionState = {};

type Decision = "resolve" | "dismiss" | "investigate";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Submit decision"}
      {!pending && <Flag className="size-4" aria-hidden="true" />}
    </Button>
  );
}

export function ReportResolutionForm({
  reportId,
  isListingTarget,
}: {
  reportId: string;
  isListingTarget: boolean;
}) {
  const [decision, setDecision] = useState<Decision>("resolve");
  const [targetAction, setTargetAction] = useState<"none" | "suspend_listing">(
    "none",
  );
  const [state, formAction] = useActionState(resolveReportAction, initialState);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1 sm:p-5"
    >
      <input type="hidden" name="reportId" value={reportId} />

      <h2 className="text-sm font-semibold text-ink-900">Resolution</h2>

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

      <Field label="Decision" htmlFor="report-decision">
        <Select
          id="report-decision"
          name="decision"
          value={decision}
          onChange={(event) => setDecision(event.target.value as Decision)}
        >
          <option value="resolve">Resolve — issue confirmed</option>
          <option value="investigate">Mark as investigating</option>
          <option value="dismiss">Dismiss — no issue found</option>
        </Select>
      </Field>

      {isListingTarget && (
        <Field
          label="Action on the listing"
          htmlFor="report-target-action"
          hint="Suspending hides the listing from search immediately."
        >
          <Select
            id="report-target-action"
            name="targetAction"
            value={targetAction}
            onChange={(event) =>
              setTargetAction(event.target.value as "none" | "suspend_listing")
            }
          >
            <option value="none">No action on the listing</option>
            <option value="suspend_listing">Suspend the listing</option>
          </Select>
        </Field>
      )}

      <Field
        label={decision === "dismiss" ? "Why is this dismissed?" : "Resolution notes"}
        htmlFor="report-notes"
        optional={decision === "investigate"}
        hint={
          decision === "investigate"
            ? "Optional. Notes are kept internal."
            : "The reporter sees this message."
        }
      >
        <Textarea
          id="report-notes"
          name="notes"
          rows={3}
          maxLength={1000}
          required={decision !== "investigate"}
          placeholder={
            decision === "dismiss"
              ? "The listing matches the description; no misleading information found."
              : "Provider confirmed the property is taken and updated availability."
          }
        />
      </Field>

      <SubmitButton />
    </form>
  );
}
