import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, FileCheck2, MapPinCheck, ShieldQuestion, UserRoundCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/spatial/surface";
import { ActionButton } from "@/components/ui/action-button";
import { EvidenceUploader } from "@/components/provider/evidence-uploader";
import { getSessionUser } from "@/features/authentication/queries";
import { getProviderVerificationOverview } from "@/features/provider/queries";
import { requestVerificationNow } from "@/features/provider/actions";
import { VERIFICATION_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Tables } from "@/types/database";

export const metadata: Metadata = {
  title: "Verification",
};

function CaseStatus({ record }: { record: Tables<"verification_cases"> | null }) {
  if (!record) {
    return <Badge variant="neutral">Not requested</Badge>;
  }
  return (
    <Badge
      variant={
        record.status === "verified"
          ? "brand"
          : record.status === "rejected"
            ? "danger"
            : "neutral"
      }
    >
      {VERIFICATION_STATUS_LABELS[record.status]}
    </Badge>
  );
}

function canRequestAgain(record: Tables<"verification_cases"> | null): boolean {
  return record?.status === "rejected" || record?.status === "expired";
}

export default async function ProviderVerificationPage() {
  const user = await getSessionUser();
  const overview = user
    ? await getProviderVerificationOverview(user.id)
    : { identityCase: null, properties: [] };

  const { identityCase, properties } = overview;

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Trust"
        title="Verification"
        description="Identity, permission to advertise, and physical visits are separate checks. Each verified badge on a listing links back to one of these cases."
      />

      <section className="rounded-2xl border border-line-soft bg-surface-2 shadow-e1">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <UserRoundCheck className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-ink-900">
                Your identity
              </h2>
              <p className="text-xs text-ink-400">
                Reviewed against a government-issued ID. Never shown publicly.
              </p>
            </div>
          </div>
          <CaseStatus record={identityCase} />
        </header>

        <div className="space-y-4 p-5">
          {identityCase ? (
            <>
              <p className="text-sm leading-relaxed text-ink-500">
                {identityCase.reviewed_at
                  ? `Reviewed ${formatDate(identityCase.reviewed_at)}.`
                  : "Submitted and waiting for review."}{" "}
                {identityCase.notes ?? ""}
              </p>
              {identityCase.status !== "verified" && (
                <div className="rounded-xl border border-line-soft bg-surface-1 p-4">
                  <p className="text-sm font-medium text-ink-700">
                    Upload supporting evidence
                  </p>
                  <p className="mt-0.5 text-xs text-ink-400">
                    ID card, passport data page, or utility bill. Files stay
                    private and are visible only to verification staff.
                  </p>
                  <div className="mt-3">
                    <EvidenceUploader caseId={identityCase.id} userId={user!.id} />
                  </div>
                </div>
              )}
              {canRequestAgain(identityCase) && (
                <ActionButton
                  action={requestVerificationNow}
                  fields={{ checkType: "identity" }}
                  successFallback="Identity verification requested again."
                >
                  Request a new identity check
                </ActionButton>
              )}
            </>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm leading-relaxed text-ink-500">
                Start an identity check to earn the provider identity badge on
                your listings.
              </p>
              <ActionButton
                action={requestVerificationNow}
                fields={{ checkType: "identity" }}
                successFallback="Identity verification requested."
              >
                Request identity check
              </ActionButton>
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="property-verification-heading">
        <SectionHeading
          eyebrow="Properties"
          title="Property checks"
          action={
            <Button asChild variant="secondary" size="sm">
              <Link href="/provider/properties">All listings</Link>
            </Button>
          }
        />

        {properties.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-line bg-surface-1/60 px-5 py-8 text-center text-sm text-ink-400">
            Create a listing first — property checks apply to individual
            listings.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {properties.map((property) => (
              <li
                key={property.id}
                className="rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1"
              >
                <Link
                  href={`/provider/properties/${property.id}`}
                  className="text-sm font-semibold text-ink-900 hover:text-brand-800"
                >
                  {property.title}
                </Link>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-line-soft bg-surface-1 px-3 py-2.5">
                    <span className="flex items-center gap-2 text-xs font-medium text-ink-600">
                      <FileCheck2 className="size-4 text-ink-400" aria-hidden="true" />
                      Permission to advertise
                    </span>
                    <div className="flex items-center gap-2">
                      <CaseStatus record={property.authorizationCase} />
                      {(!property.authorizationCase ||
                        canRequestAgain(property.authorizationCase)) && (
                        <ActionButton
                          variant="ghost"
                          size="sm"
                          action={requestVerificationNow}
                          fields={{
                            propertyId: property.id,
                            checkType: "property_authorization",
                          }}
                          successFallback="Authorization check requested."
                        >
                          {property.authorizationCase ? "Request again" : "Request"}
                        </ActionButton>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 rounded-xl border border-line-soft bg-surface-1 px-3 py-2.5">
                    <span className="flex items-center gap-2 text-xs font-medium text-ink-600">
                      <MapPinCheck className="size-4 text-ink-400" aria-hidden="true" />
                      Physical visit
                    </span>
                    <div className="flex items-center gap-2">
                      <CaseStatus record={property.visitCase} />
                      {(!property.visitCase || canRequestAgain(property.visitCase)) && (
                        <ActionButton
                          variant="ghost"
                          size="sm"
                          action={requestVerificationNow}
                          fields={{
                            propertyId: property.id,
                            checkType: "property_visit",
                          }}
                          successFallback="Visit check requested."
                        >
                          {property.visitCase ? "Request again" : "Request"}
                        </ActionButton>
                      )}
                    </div>
                  </div>
                </div>

                {(property.authorizationCase || property.visitCase) && (
                  <div className="mt-3">
                    <EvidenceUploader
                      caseId={
                        (property.authorizationCase ?? property.visitCase)!.id
                      }
                      userId={user!.id}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-line-soft bg-surface-1 p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
          <ShieldQuestion className="size-4 text-ink-400" aria-hidden="true" />
          How we review
        </h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink-500">
          <li>Identity: government-issued ID matching your profile name.</li>
          <li>
            Permission to advertise: ownership documents, or a written mandate
            if you list for the owner.
          </li>
          <li>Visit: a verifier physically visits the property.</li>
          <li>
            Each badge shows what was checked and when. Expired checks stop
            showing as verified.
          </li>
        </ul>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-400">
          <BadgeCheck className="size-3.5 text-brand-600" aria-hidden="true" />
          Reviews are done by humans. We may contact you for more evidence.
        </p>
      </section>
    </div>
  );
}
