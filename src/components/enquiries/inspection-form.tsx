"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/form-field";
import { Alert } from "@/components/ui/alert";
import {
  requestInspectionAction,
  type EnquiryActionState,
} from "@/features/enquiries/actions";

const initialState: EnquiryActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Sending request…" : "Request inspection"}
      {!pending && <CalendarCheck className="size-4" aria-hidden="true" />}
    </Button>
  );
}

export function InspectionForm({
  propertyId,
  propertyTitle,
  hasOpenEnquiry,
}: {
  propertyId: string;
  propertyTitle: string;
  hasOpenEnquiry: boolean;
}) {
  const [state, formAction] = useActionState(requestInspectionAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="propertyId" value={propertyId} />

      {state.error && (
        <Alert variant="danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{state.error}</span>
        </Alert>
      )}

      <Field
        label="Preferred date and time"
        htmlFor="inspection-time"
        hint="The provider will confirm or suggest another time. You can reschedule before the visit."
      >
        <Input
          id="inspection-time"
          name="scheduledAt"
          type="datetime-local"
          required
        />
      </Field>

      <Field
        label="Notes for the provider"
        htmlFor="inspection-notes"
        optional
        hint="Anything that helps, like landmark directions or the unit type you want to see."
      >
        <Textarea
          id="inspection-notes"
          name="notes"
          maxLength={500}
          rows={3}
          placeholder="I would like to see the self-contain units. I am coming from the main gate."
        />
      </Field>

      {!hasOpenEnquiry && (
        <Field
          label={`First message for "${propertyTitle}"`}
          htmlFor="inspection-message"
          hint="You have not sent an enquiry for this home yet, so add one with your request."
        >
          <Textarea
            id="inspection-message"
            name="message"
            required
            minLength={15}
            maxLength={1000}
            rows={4}
            placeholder="Hello, I am interested in this home and would like to inspect it."
          />
        </Field>
      )}

      <SubmitButton />

      <p className="text-xs leading-relaxed text-ink-400">
        Never pay for an inspection. If a provider demands payment or a fee before
        viewing, report the listing.
      </p>
    </form>
  );
}
