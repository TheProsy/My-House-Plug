"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/form-field";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import {
  createEnquiryAction,
  type EnquiryActionState,
} from "@/features/enquiries/actions";

const initialState: EnquiryActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Sending…" : "Send enquiry"}
      {!pending && <Send className="size-4" aria-hidden="true" />}
    </Button>
  );
}

export function EnquiryForm({
  propertyId,
  propertyTitle,
}: {
  propertyId: string;
  propertyTitle: string;
}) {
  const [state, formAction] = useActionState(createEnquiryAction, initialState);

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
        label={`Message to the provider of "${propertyTitle}"`}
        htmlFor="enquiry-message"
        hint="Share your move-in date, budget questions, or anything you need clarified. Never mention card numbers or passwords."
      >
        <Textarea
          id="enquiry-message"
          name="message"
          required
          minLength={15}
          maxLength={1000}
          rows={5}
          placeholder="Hello, I am interested in this home. Is it still available, and can I inspect it this weekend?"
        />
      </Field>

      <Field
        label="How should the provider reach you?"
        htmlFor="enquiry-contact"
        hint="Contact details stay private until you choose to share them."
      >
        <Select id="enquiry-contact" name="contactPreference" defaultValue="in_app">
          <option value="in_app">In-app messages</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="phone">Phone call</option>
        </Select>
      </Field>

      <SubmitButton />

      <p className="text-xs leading-relaxed text-ink-400">
        My House Plug never collects rent or fees. Do not send money before viewing in
        person and confirming the provider&apos;s identity.
      </p>
    </form>
  );
}
