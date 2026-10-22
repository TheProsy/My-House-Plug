"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import {
  sendEnquiryMessageAction,
  type EnquiryActionState,
} from "@/features/enquiries/actions";

const initialState: EnquiryActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Sending…" : "Send reply"}
      {!pending && <Send className="size-4" aria-hidden="true" />}
    </Button>
  );
}

export function MessageForm({ enquiryId }: { enquiryId: string }) {
  const [state, formAction] = useActionState(
    sendEnquiryMessageAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) {
      formRef.current?.reset();
    }
  }, [state.message]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="enquiryId" value={enquiryId} />

      {state.error && (
        <Alert variant="danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{state.error}</span>
        </Alert>
      )}

      <label htmlFor="enquiry-reply" className="sr-only">
        Write a reply
      </label>
      <Textarea
        id="enquiry-reply"
        name="body"
        required
        maxLength={2000}
        rows={3}
        placeholder="Write a reply…"
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-ink-400">
          Keep conversations inside My House Plug so both sides have a record.
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}
