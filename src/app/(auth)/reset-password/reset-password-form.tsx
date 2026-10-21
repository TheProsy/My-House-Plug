"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, KeyRound } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/ui/password-input";
import {
  resetPasswordAction,
  type AuthActionState,
} from "@/features/authentication/actions";

const initialState: AuthActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Saving…" : "Save new password"}
      {!pending && <KeyRound className="size-4" aria-hidden="true" />}
    </Button>
  );
}

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(resetPasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <Alert variant="danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{state.error}</span>
        </Alert>
      )}

      <Field label="New password" htmlFor="new-password">
        <PasswordInput
          id="new-password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          placeholder="At least 8 characters"
          required
        />
      </Field>

      <Field label="Confirm new password" htmlFor="new-password-confirm">
        <PasswordInput
          id="new-password-confirm"
          name="confirmPassword"
          autoComplete="new-password"
          minLength={8}
          placeholder="Repeat new password"
          required
        />
      </Field>

      <SubmitButton />
    </form>
  );
}
