"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  updateProfileAction,
  type AuthActionState,
} from "@/features/authentication/actions";

const initialState: AuthActionState = {};

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

interface ProfileFormProps {
  defaultValues: {
    fullName: string;
    phone: string;
    bio: string;
  };
}

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const [state, formAction] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.message && (
        <Alert variant="success">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{state.message}</span>
        </Alert>
      )}
      {state.error && (
        <Alert variant="danger">
          <span>{state.error}</span>
        </Alert>
      )}

      <Field label="Full name" htmlFor="profile-name">
        <Input
          id="profile-name"
          name="fullName"
          defaultValue={defaultValues.fullName}
          autoComplete="name"
          required
        />
      </Field>

      <Field
        label="Phone"
        htmlFor="profile-phone"
        optional
        hint="Shared only when you send an enquiry or request an inspection."
      >
        <Input
          id="profile-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          defaultValue={defaultValues.phone}
          autoComplete="tel"
          placeholder="08012345678"
        />
      </Field>

      <Field
        label="About you"
        htmlFor="profile-bio"
        optional
        hint="A short introduction shown on your roommate profile and enquiries."
      >
        <textarea
          id="profile-bio"
          name="bio"
          defaultValue={defaultValues.bio}
          rows={4}
          maxLength={600}
          className="w-full rounded-md border border-line bg-surface-2 px-3 py-2 text-sm text-ink-900 shadow-e1 placeholder:text-ink-400"
          placeholder="Level, campus, and what kind of space you are looking for…"
        />
      </Field>

      <SaveButton />
    </form>
  );
}
