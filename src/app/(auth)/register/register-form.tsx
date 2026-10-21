"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Building2, CheckCircle2, Home, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Field } from "@/components/ui/form-field";
import { Alert } from "@/components/ui/alert";
import { ResendConfirmationForm } from "@/components/authentication/resend-confirmation-form";
import {
  signUpAction,
  type AuthActionState,
} from "@/features/authentication/actions";

const initialState: AuthActionState = {};

type AccountType = "renter" | "landlord" | "agent";

const accountTypes: {
  value: AccountType;
  label: string;
  description: string;
  icon: typeof Home;
}[] = [
  {
    value: "renter",
    label: "Looking for a home",
    description: "Search, save, and request inspections.",
    icon: UserRound,
  },
  {
    value: "landlord",
    label: "I own a property",
    description: "List your own space and manage enquiries.",
    icon: Home,
  },
  {
    value: "agent",
    label: "I am an agent",
    description: "List properties you are authorised to represent.",
    icon: Building2,
  },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Creating account…" : "Create account"}
    </Button>
  );
}

export function RegisterForm({
  defaultType,
  redirectTo,
}: {
  defaultType: AccountType;
  redirectTo?: string;
}) {
  const [state, formAction] = useActionState(signUpAction, initialState);

  if (state.message) {
    return (
      <div className="space-y-4">
        <Alert variant="success" className="flex-col gap-2">
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            Check your inbox
          </span>
          <span>{state.message}</span>
        </Alert>

        <ResendConfirmationForm email={state.email} redirectTo={redirectTo} />

        <p className="text-center text-sm text-ink-500">
          Already confirmed?{" "}
          <Link
            href={
              redirectTo
                ? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
                : "/login"
            }
            className="font-medium text-brand-700 underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
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

      <Field label="Full name" htmlFor="register-name">
        <Input
          id="register-name"
          name="fullName"
          autoComplete="name"
          placeholder="Your full name"
          required
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" htmlFor="register-email">
          <Input
            id="register-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            defaultValue={state.email}
            required
          />
        </Field>
        <Field label="Phone" htmlFor="register-phone" optional hint="Nigerian number">
          <Input
            id="register-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="08012345678"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Password" htmlFor="register-password">
          <PasswordInput
            id="register-password"
            name="password"
            autoComplete="new-password"
            minLength={8}
            placeholder="At least 8 characters"
            required
          />
        </Field>
        <Field label="Confirm password" htmlFor="register-confirm">
          <PasswordInput
            id="register-confirm"
            name="confirmPassword"
            autoComplete="new-password"
            minLength={8}
            placeholder="Repeat password"
            required
          />
        </Field>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-ink-700">
          How will you use MY AGENT?
        </legend>
        <div className="grid gap-2">
          {accountTypes.map((option) => {
            const Icon = option.icon;
            return (
              <label
                key={option.value}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface-2 p-3 shadow-e1 transition-colors has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50/50 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-600"
              >
                <input
                  type="radio"
                  name="accountType"
                  value={option.value}
                  defaultChecked={defaultType === option.value}
                  className="sr-only"
                />
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-1 text-brand-700">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink-900">
                    {option.label}
                  </span>
                  <span className="block text-xs leading-relaxed text-ink-500">
                    {option.description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <label className="flex items-start gap-2.5 text-xs leading-relaxed text-ink-500">
        <input
          type="checkbox"
          name="acceptTerms"
          required
          className="mt-0.5 size-4 shrink-0 rounded border-line accent-brand-700"
        />
        <span>
          I accept the{" "}
          <Link href="/terms" className="font-medium text-ink-700 underline-offset-4 hover:underline">
            platform terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-medium text-ink-700 underline-offset-4 hover:underline">
            privacy notice
          </Link>
          , and understand that MY AGENT does not collect rent or hold deposits.
        </span>
      </label>

      <SubmitButton />
    </form>
  );
}
