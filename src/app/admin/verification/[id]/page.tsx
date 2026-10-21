import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, FileText, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VerificationDecisionForm } from "@/components/admin/verification-decision-form";
import { ListingStatusBadge } from "@/components/provider/listing-status-badge";
import { getVerificationCaseDetail } from "@/features/admin/queries";
import { VERIFICATION_STATUS_LABELS } from "@/lib/constants";
import { formatDate, timeAgo } from "@/lib/utils";

interface AdminVerificationDetailProps {
  params: Promise<{ id: string }>;
}

export default async function AdminVerificationDetailPage({
  params,
}: AdminVerificationDetailProps) {
  const { id } = await params;
  const detail = await getVerificationCaseDetail(id);

  if (!detail) notFound();

  const { case: verificationCase, userSubject, propertySubject, propertyOwner, evidence } =
    detail;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/verification"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-brand-800"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to queue
      </Link>

      <div className="rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1 sm:p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="info">
            {
              {
                identity: "Identity",
                property_authorization: "Property authorization",
                property_visit: "Property visit",
              }[verificationCase.check_type]
            }
          </Badge>
          <Badge
            variant={
              verificationCase.status === "verified"
                ? "brand"
                : verificationCase.status === "rejected"
                  ? "danger"
                  : "warning"
            }
          >
            {VERIFICATION_STATUS_LABELS[verificationCase.status]}
          </Badge>
        </div>
        <p className="mt-2 text-xs text-ink-400">
          Opened {timeAgo(verificationCase.created_at)}
          {verificationCase.reviewed_at
            ? ` · Reviewed ${timeAgo(verificationCase.reviewed_at)}`
            : ""}
          {verificationCase.expires_at
            ? ` · Expires ${formatDate(verificationCase.expires_at)}`
            : ""}
        </p>
        {verificationCase.notes && (
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-700">
            {verificationCase.notes}
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="min-w-0 space-y-6">
          <section className="rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1 sm:p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
              {userSubject ? (
                <User className="size-4 text-brand-700" aria-hidden="true" />
              ) : (
                <ExternalLink className="size-4 text-brand-700" aria-hidden="true" />
              )}
              Subject
            </h2>

            {userSubject && (
              <div className="mt-3">
                <p className="text-sm font-medium text-ink-800">
                  {userSubject.full_name || "Unnamed user"}
                </p>
                {userSubject.phone && (
                  <p className="mt-0.5 text-sm text-ink-500">{userSubject.phone}</p>
                )}
                <p className="mt-0.5 text-xs text-ink-400">
                  Account opened {timeAgo(userSubject.created_at)}
                </p>
              </div>
            )}

            {propertySubject && (
              <div className="mt-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <ListingStatusBadge status={propertySubject.listing_status} />
                </div>
                <p className="mt-1.5 text-sm font-medium text-ink-800">
                  {propertySubject.title}
                </p>
                <p className="mt-0.5 text-xs text-ink-500">
                  {propertySubject.address ?? "No address on file"} · Owner:{" "}
                  {propertyOwner?.full_name ?? "Unknown"}
                </p>
                <div className="mt-2 flex flex-wrap gap-3">
                  <Link
                    href={`/admin/listings/${propertySubject.id}`}
                    className="text-xs font-medium text-brand-700 hover:text-brand-800"
                  >
                    Review listing
                  </Link>
                  <Link
                    href={`/properties/${propertySubject.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800"
                  >
                    Public page
                    <ExternalLink className="size-3" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1 sm:p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
              <FileText className="size-4 text-brand-700" aria-hidden="true" />
              Evidence ({evidence.length})
            </h2>
            {evidence.length === 0 ? (
              <p className="mt-3 text-sm text-ink-500">
                No evidence uploaded yet. Request more information or make a decision
                based on available records.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-line-soft">
                {evidence.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-800">
                        {item.kind.replaceAll("_", " ")}
                      </p>
                      <p className="text-xs text-ink-400">
                        Uploaded {timeAgo(item.created_at)}
                      </p>
                    </div>
                    {item.signedUrl ? (
                      <a
                        href={item.signedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800"
                      >
                        Open file
                        <ExternalLink className="size-3.5" aria-hidden="true" />
                      </a>
                    ) : (
                      <span className="text-xs text-ink-400">Unavailable</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <VerificationDecisionForm caseId={verificationCase.id} />
      </div>
    </div>
  );
}
