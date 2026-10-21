"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/form-field";
import { Alert } from "@/components/ui/alert";
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
    <form action={formAction} className="space-y-4">
      {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}

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
          required
        />
      </Field>

      <Field label="Password" htmlFor="login-password">
        <Input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="At least 8 characters"
          minLength={8}
          required
        />
      </Field>

      <SubmitButton />

      <p className="text-center text-xs leading-relaxed text-ink-400">
        By signing in you agree to our{" "}
        <a href="/terms" className="font-medium text-ink-600 underline-offset-4 hover:underline">
          platform terms
        </a>{" "}
        and{" "}
        <a href="/privacy" className="font-medium text-ink-600 underline-offset-4 hover:underline">
          privacy notice
        </a>
        .
      </p>
    </form>
  );
}
