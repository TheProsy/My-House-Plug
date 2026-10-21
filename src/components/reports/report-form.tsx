"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Flag } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form-field";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { REPORT_REASON_LABELS } from "@/lib/constants";
import {
  submitReportAction,
  type ReportActionState,
} from "@/features/reports/actions";
import type { ReportReason } from "@/types/database";

const initialState: ReportActionState = {};

const REASONS = Object.entries(REPORT_REASON_LABELS) as [ReportReason, string][];

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Submitting…" : "Submit report"}
      {!pending && <Flag className="size-4" aria-hidden="true" />}
    </Button>
  );
}

export function ReportForm({
  targetId,
  propertyTitle,
  propertySlug,
}: {
  targetId: string;
  propertyTitle: string;
  propertySlug: string;
}) {
  const [state, formAction] = useActionState(submitReportAction, initialState);

  if (state.message) {
    return (
      <div className="rounded-2xl border border-line-soft bg-surface-2 p-6 shadow-e1">
        <Alert variant="success">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{state.message}</span>
        </Alert>
        <p className="mt-4 text-sm leading-relaxed text-ink-500">
          Reports are private. We never tell the provider who reported a listing.
          Meanwhile, only deal through MY AGENT and never pay before inspecting.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild>
            <Link href={`/properties/${propertySlug}`}>Back to listing</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/support">Contact support</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-line-soft bg-surface-2 p-5 shadow-e1"
    >
      <input type="hidden" name="targetType" value="listing" />
      <input type="hidden" name="targetId" value={targetId} />

      {state.error && (
        <Alert variant="danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{state.error}</span>
        </Alert>
      )}

      <Field
        label={`What looks wrong with "${propertyTitle}"?`}
        htmlFor="report-reason"
        hint="Pick the closest reason. Moderators review every report."
      >
        <Select id="report-reason" name="reason" required defaultValue="">
          <option value="" disabled>
            Select a reason
          </option>
          {REASONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Anything else we should know?"
        htmlFor="report-details"
        hint="Optional, up to 1,000 characters. Include dates or amounts if useful — never share passwords or card numbers."
      >
        <Textarea
          id="report-details"
          name="details"
          rows={5}
          maxLength={1000}
          placeholder="Tell us what happened, or what you noticed on the listing."
        />
      </Field>

      <SubmitButton />

      <p className="text-xs leading-relaxed text-ink-400">
        Your report is private — the provider is never told who reported them.
        Repeated false reports may be dismissed.
      </p>
    </form>
  );
}
