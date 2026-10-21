"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/form-field";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import {
  decideVerificationAction,
  type AdminActionState,
} from "@/features/admin/actions";

const initialState: AdminActionState = {};

type Decision = "approve" | "reject" | "request_info";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Submit decision"}
      {!pending && <BadgeCheck className="size-4" aria-hidden="true" />}
    </Button>
  );
}

export function VerificationDecisionForm({ caseId }: { caseId: string }) {
  const [decision, setDecision] = useState<Decision>("approve");
  const [state, formAction] = useActionState(
    decideVerificationAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1 sm:p-5"
    >
      <input type="hidden" name="caseId" value={caseId} />

      <h2 className="text-sm font-semibold text-ink-900">Verification decision</h2>

      {state.error && (
        <Alert variant="danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{state.error}</span>
        </Alert>
      )}

      {state.message && (
        <Alert variant="success">
          <BadgeCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{state.message}</span>
        </Alert>
      )}

      <Field label="Decision" htmlFor="verification-decision">
        <Select
          id="verification-decision"
          name="decision"
          value={decision}
          onChange={(event) => setDecision(event.target.value as Decision)}
        >
          <option value="approve">Approve — mark verified</option>
          <option value="request_info">Request more evidence</option>
          <option value="reject">Reject</option>
        </Select>
      </Field>

      {decision === "approve" && (
        <Field
          label="Validity in days"
          htmlFor="verification-expiry"
          optional
          hint="Defaults: identity 365 days, authorization 365 days, visit 180 days."
        >
          <Input
            id="verification-expiry"
            name="expiryDays"
            type="number"
            min={30}
            max={730}
            placeholder="365"
          />
        </Field>
      )}

      <Field
        label={
          decision === "approve"
            ? "Review notes"
            : decision === "request_info"
              ? "What evidence is missing?"
              : "Why is this rejected?"
        }
        htmlFor="verification-notes"
        optional={decision === "approve"}
        hint={
          decision === "request_info"
            ? "The provider sees this and can upload more evidence."
            : "Stored in the audit log and shared with the provider."
        }
      >
        <Textarea
          id="verification-notes"
          name="notes"
          rows={3}
          maxLength={1000}
          required={decision !== "approve"}
          placeholder={
            decision === "request_info"
              ? "Please upload a signed authorization letter from the property owner."
              : "Documents match the submitted details."
          }
        />
      </Field>

      <SubmitButton />
    </form>
  );
}
