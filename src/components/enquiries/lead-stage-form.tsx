"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/form-field";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import {
  updateLeadStageAction,
  type EnquiryActionState,
} from "@/features/enquiries/actions";
import { LEAD_STAGES, LEAD_STAGE_LABELS } from "@/lib/constants";
import type { LeadStage } from "@/types/database";

const initialState: EnquiryActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Updating…" : "Update lead"}
      {!pending && <GitBranch className="size-4" aria-hidden="true" />}
    </Button>
  );
}

export function LeadStageForm({
  enquiryId,
  currentStage,
}: {
  enquiryId: string;
  currentStage: LeadStage;
}) {
  const [stage, setStage] = useState<LeadStage>(currentStage);
  const [state, formAction] = useActionState(updateLeadStageAction, initialState);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1"
    >
      <input type="hidden" name="enquiryId" value={enquiryId} />

      <p className="text-sm font-semibold text-ink-900">Lead pipeline</p>

      {state.error && (
        <Alert variant="danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{state.error}</span>
        </Alert>
      )}

      {state.message && (
        <Alert variant="success">
          <GitBranch className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{state.message}</span>
        </Alert>
      )}

      <Field
        label="Stage"
        htmlFor="lead-stage"
        hint="Move the lead as the conversation progresses. Everything is logged on the timeline."
      >
        <Select
          id="lead-stage"
          name="stage"
          value={stage}
          onChange={(event) => setStage(event.target.value as LeadStage)}
        >
          {LEAD_STAGES.map((value) => (
            <option key={value} value={value}>
              {LEAD_STAGE_LABELS[value]}
            </option>
          ))}
        </Select>
      </Field>

      {stage === "lost" && (
        <Field
          label="Why was the lead lost?"
          htmlFor="lost-reason"
          hint="Honest reasons improve matching for similar renters."
        >
          <Input
            id="lost-reason"
            name="lostReason"
            maxLength={300}
            required
            placeholder="Renter chose another property"
          />
        </Field>
      )}

      <SubmitButton />
    </form>
  );
}
