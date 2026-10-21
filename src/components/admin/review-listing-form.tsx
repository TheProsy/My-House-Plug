"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/form-field";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import {
  reviewListingAction,
  type AdminActionState,
} from "@/features/admin/actions";

const initialState: AdminActionState = {};

type Decision = "approve" | "reject" | "request_changes";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Submit decision"}
      {!pending && <Gavel className="size-4" aria-hidden="true" />}
    </Button>
  );
}

export function ReviewListingForm({ listingId }: { listingId: string }) {
  const [decision, setDecision] = useState<Decision>("approve");
  const [state, formAction] = useActionState(reviewListingAction, initialState);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1 sm:p-5"
    >
      <input type="hidden" name="listingId" value={listingId} />

      <h2 className="text-sm font-semibold text-ink-900">Review decision</h2>

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

      <Field label="Decision" htmlFor="review-decision">
        <Select
          id="review-decision"
          name="decision"
          value={decision}
          onChange={(event) => setDecision(event.target.value as Decision)}
        >
          <option value="approve">Approve and publish</option>
          <option value="request_changes">Request changes</option>
          <option value="reject">Reject</option>
        </Select>
      </Field>

      <Field
        label={decision === "approve" ? "Internal notes" : "Reason (sent to the provider)"}
        htmlFor="review-notes"
        optional={decision === "approve"}
        hint={
          decision === "approve"
            ? "Optional. Stored in the audit log."
            : "The provider sees this message with the decision."
        }
      >
        <Textarea
          id="review-notes"
          name="notes"
          rows={3}
          maxLength={1000}
          required={decision !== "approve"}
          placeholder={
            decision === "request_changes"
              ? "Please add clear photos of the bathroom and confirm the caution deposit."
              : decision === "reject"
                ? "This listing appears to be a duplicate of another property."
                : "Checked costs, photos, and location."
          }
        />
      </Field>

      <SubmitButton />
    </form>
  );
}
