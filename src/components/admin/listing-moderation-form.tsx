"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, ShieldAlert, ShieldCheck } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  moderateListingAction,
  type AdminActionState,
} from "@/features/admin/actions";
import type { ListingStatus } from "@/types/database";

const initialState: AdminActionState = {};

const suspendable: ListingStatus[] = ["published", "paused", "pending_review"];

function SubmitButton({ suspending }: { suspending: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={suspending ? "danger" : "primary"}
      disabled={pending}
      className="w-full"
    >
      {pending
        ? "Saving…"
        : suspending
          ? "Suspend listing"
          : "Reinstate listing"}
      {!pending &&
        (suspending ? (
          <ShieldAlert className="size-4" aria-hidden="true" />
        ) : (
          <ShieldCheck className="size-4" aria-hidden="true" />
        ))}
    </Button>
  );
}

export function ListingModerationForm({
  listingId,
  status,
}: {
  listingId: string;
  status: ListingStatus;
}) {
  const suspending = suspendable.includes(status);
  const [state, formAction] = useActionState(
    moderateListingAction,
    initialState,
  );

  if (!suspending && status !== "suspended") {
    return null;
  }

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1"
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input
        type="hidden"
        name="transition"
        value={suspending ? "suspend" : "reinstate"}
      />

      <h2 className="text-sm font-semibold text-ink-900">
        {suspending ? "Suspend listing" : "Restore listing"}
      </h2>

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

      <p className="text-xs leading-relaxed text-ink-500">
        {suspending
          ? "Suspending hides the listing immediately and notifies the provider. Use it for suspected fraud, unsafe homes, or repeated policy breaches."
          : "Reinstating publishes the listing again and notifies the provider."}
      </p>

      <label className="flex items-start gap-2 text-xs leading-relaxed text-ink-600">
        <input
          type="checkbox"
          required
          className="mt-0.5 size-4 shrink-0 rounded border-line accent-brand-700"
        />
        <span>
          {suspending
            ? "I have reviewed this listing and have grounds to suspend it."
            : "I have reviewed the issues and this listing is safe to restore."}
        </span>
      </label>

      <SubmitButton suspending={suspending} />
    </form>
  );
}
