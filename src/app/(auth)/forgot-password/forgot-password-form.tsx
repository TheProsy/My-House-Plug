"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Mail } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  requestPasswordResetAction,
  type AuthActionState,
} from "@/features/authentication/actions";

const initialState: AuthActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Sending…" : "Send reset link"}
      {!pending && <Mail className="size-4" aria-hidden="true" />}
    </Button>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(
    requestPasswordResetAction,
    initialState,
  );

  if (state.message) {
    return (
      <Alert variant="success" className="items-start">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <div className="space-y-2">
          <p>{state.message}</p>
          <Link
            href="/login"
            className="text-sm font-medium underline underline-offset-4"
          >
            Back to sign in
          </Link>
        </div>
      </Alert>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <Alert variant="danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{state.error}</span>
        </Alert>
      )}

      <Field label="Email" htmlFor="reset-email">
        <Input
          id="reset-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </Field>

      <SubmitButton />
    </form>
  );
}
