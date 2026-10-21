"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Field } from "@/components/ui/form-field";
import { Alert } from "@/components/ui/alert";
import { ResendConfirmationForm } from "@/components/authentication/resend-confirmation-form";
import {
  signInAction,
  type AuthActionState,
} from "@/features/authentication/actions";

const initialState: AuthActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Signing in…" : "Sign in"}
      {!pending && <LogIn className="size-4" aria-hidden="true" />}
    </Button>
  );
}

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction] = useActionState(signInAction, initialState);

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4">
        {redirectTo && (
          <input type="hidden" name="redirectTo" value={redirectTo} />
        )}

        {state.error && (
          <Alert variant="danger">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{state.error}</span>
          </Alert>
        )}

        <Field label="Email" htmlFor="login-email">
          <Input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            defaultValue={state.email}
            required
          />
        </Field>

        <Field label="Password" htmlFor="login-password">
          <PasswordInput
            id="login-password"
            name="password"
            autoComplete="current-password"
            placeholder="At least 8 characters"
            minLength={8}
            required
          />
        </Field>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-brand-700 underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <SubmitButton />

        <p className="text-center text-xs leading-relaxed text-ink-400">
          By signing in you agree to our{" "}
          <Link href="/terms" className="font-medium text-ink-600 underline-offset-4 hover:underline">
            platform terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-medium text-ink-600 underline-offset-4 hover:underline">
            privacy notice
          </Link>
          .
        </p>
      </form>

      {state.code === "email_not_confirmed" && (
        <div className="rounded-xl border border-line-soft bg-surface-2 p-4">
          <p className="mb-3 text-sm text-ink-600">
            Need a new confirmation link?
          </p>
          <ResendConfirmationForm
            email={state.email}
            redirectTo={redirectTo}
          />
        </div>
      )}
    </div>
  );
}
