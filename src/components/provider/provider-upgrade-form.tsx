"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, ArrowRight, Building2, Home } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  upgradeToProviderAction,
  type AuthActionState,
} from "@/features/authentication/actions";

const initialState: AuthActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Upgrading…" : "Upgrade my account"}
      {!pending && <ArrowRight className="size-4" aria-hidden="true" />}
    </Button>
  );
}

const roles = [
  {
    value: "landlord",
    label: "Landlord",
    description: "I own the property I want to list.",
    icon: Home,
  },
  {
    value: "agent",
    label: "Agent",
    description: "I am authorised to list properties for owners.",
    icon: Building2,
  },
] as const;

export function ProviderUpgradeForm() {
  const [state, formAction] = useActionState(
    upgradeToProviderAction,
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

      <fieldset className="space-y-2">
        <legend className="sr-only">Provider role</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <label
                key={role.value}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface-1 p-3 transition-colors has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50/50 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-600"
              >
                <input
                  type="radio"
                  name="requestedRole"
                  value={role.value}
                  defaultChecked={index === 0}
                  className="sr-only"
                />
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-brand-700">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-medium text-ink-900">
                    {role.label}
                  </span>
                  <span className="block text-xs leading-relaxed text-ink-500">
                    {role.description}
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
          name="acceptProviderTerms"
          required
          className="mt-0.5 size-4 shrink-0 rounded border-line accent-brand-700"
        />
        <span>
          I agree to list accurate information, keep availability current, and
          follow the{" "}
          <Link
            href="/terms"
            className="font-medium text-ink-700 underline-offset-4 hover:underline"
          >
            provider terms
          </Link>
          . I understand MY AGENT does not collect rent or hold deposits.
        </span>
      </label>

      <SubmitButton />
    </form>
  );
}
