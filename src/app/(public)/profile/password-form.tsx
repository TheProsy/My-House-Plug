"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/ui/password-input";
import {
  changePasswordAction,
  type AuthActionState,
} from "@/features/authentication/actions";

const initialState: AuthActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="secondary" disabled={pending}>
      {pending ? "Updating…" : "Update password"}
      {!pending && <KeyRound className="size-4" aria-hidden="true" />}
    </Button>
  );
}

export function ChangePasswordForm() {
  const [state, formAction] = useActionState(
    changePasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
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

      <Field label="Current password" htmlFor="currentPassword">
        <PasswordInput
          id="currentPassword"
          name="currentPassword"
          autoComplete="current-password"
          required
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="New password"
          htmlFor="password"
          hint="At least 8 characters."
        >
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </Field>

        <Field label="Confirm new password" htmlFor="confirmPassword">
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </Field>
      </div>

      <SubmitButton />
    </form>
  );
}
