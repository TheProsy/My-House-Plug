"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Heart } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import {
  sendRoommateInterestAction,
  type RoommateActionState,
} from "@/features/roommates/actions";

const initialState: RoommateActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Sending…" : "Send interest"}
      {!pending && <Heart className="size-4" aria-hidden="true" />}
    </Button>
  );
}

export function RoommateInterestForm({ toProfileId }: { toProfileId: string }) {
  const [state, formAction] = useActionState(
    sendRoommateInterestAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1"
    >
      <input type="hidden" name="toProfile" value={toProfileId} />

      <div>
        <p className="text-sm font-semibold text-ink-900">
          Interested in matching?
        </p>
        <p className="mt-1 text-xs leading-relaxed text-ink-500">
          Send a short note. They decide whether to accept, and contact details
          only appear once you both agree.
        </p>
      </div>

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

      <Field
        label="Message"
        htmlFor="roommate-interest-message"
        optional
        hint="Introduce yourself or say what you'd like to compare."
      >
        <Textarea
          id="roommate-interest-message"
          name="message"
          rows={3}
          maxLength={400}
          placeholder="Hi! We both prefer quiet flats near campus — want to compare notes?"
        />
      </Field>

      <SubmitButton />
    </form>
  );
}
