"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/form-field";
import {
  resendConfirmationAction,
  type AuthActionState,
} from "@/features/authentication/actions";

const initialState: AuthActionState = {};

function ResendButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="secondary" size="sm" disabled={pending}>
      {pending ? "Sending…" : "Resend confirmation email"}
    </Button>
  );
}

export function ResendConfirmationForm({
  email,
  redirectTo,
}: {
  email?: string;
  redirectTo?: string;
}) {
  const [state, formAction] = useActionState(
    resendConfirmationAction,
    initialState,
  );

  if (state.message) {
    return (
      <Alert variant="success" className="items-start">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>{state.message}</span>
      </Alert>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      {state.error && (
        <Alert variant="danger">
          <span>{state.error}</span>
        </Alert>
      )}

      {email ? (
        <input type="hidden" name="email" value={email} />
      ) : (
        <Field label="Email" htmlFor="resend-email">
          <Input
            id="resend-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </Field>
      )}

      {redirectTo && (
        <input type="hidden" name="redirectTo" value={redirectTo} />
      )}

      <ResendButton />
    </form>
  );
}
