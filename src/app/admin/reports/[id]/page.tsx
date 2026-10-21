import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ReportResolutionForm } from "@/components/admin/report-resolution-form";
import { ListingStatusBadge } from "@/components/provider/listing-status-badge";
import { getReportDetail } from "@/features/admin/queries";
import { REPORT_REASON_LABELS } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";

interface AdminReportDetailProps {
  params: Promise<{ id: string }>;
}

export default async function AdminReportDetailPage({
  params,
}: AdminReportDetailProps) {
  const { id } = await params;
  const detail = await getReportDetail(id);

  if (!detail) notFound();

  const { report, reporterName, listing, user } = detail;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/reports"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-brand-800"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to queue
      </Link>

      <div className="rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1 sm:p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            variant={
              report.severity === "critical" || report.severity === "high"
                ? "danger"
                : report.severity === "medium"
                  ? "warning"
                  : "neutral"
            }
          >
            {report.severity}
          </Badge>
          <Badge variant="info">{report.status}</Badge>
          <span className="text-xs text-ink-400">Target: {report.target_type}</span>
        </div>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-ink-900">
          {REPORT_REASON_LABELS[report.reason]}
        </h1>
        <p className="mt-1 text-xs text-ink-400">
          Reported by {reporterName ?? "unknown"} · {timeAgo(report.created_at)}
        </p>
        {report.details && (
          <p className="mt-3 whitespace-pre-wrap rounded-xl bg-surface-1 px-3.5 py-3 text-sm leading-relaxed text-ink-700">
            {report.details}
          </p>
        )}
        {report.resolution_notes && (
          <p className="mt-3 text-xs text-ink-500">
            Resolution note: {report.resolution_notes}
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <section className="rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1 sm:p-5">
          <h2 className="text-sm font-semibold text-ink-900">Reported item</h2>

          {listing && (
            <div className="mt-3 space-y-1.5">
              <ListingStatusBadge status={listing.listing_status} />
              <p className="text-sm font-medium text-ink-800">{listing.title}</p>
              <p className="text-xs text-ink-500">
                {listing.address ?? "No address on file"}
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  href={`/admin/listings/${listing.id}`}
                  className="text-xs font-medium text-brand-700 hover:text-brand-800"
                >
                  Review listing
                </Link>
                <Link
                  href={`/properties/${listing.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800"
                >
                  Public page
                  <ExternalLink className="size-3" aria-hidden="true" />
                </Link>
              </div>
            </div>
          )}

          {user && (
            <div className="mt-3 space-y-1">
              <p className="text-sm font-medium text-ink-800">
                {user.full_name || "Unnamed user"}
              </p>
              {user.phone && <p className="text-sm text-ink-500">{user.phone}</p>}
              {user.is_suspended && (
                <Badge variant="danger">Suspended account</Badge>
              )}
              <p className="text-xs text-ink-400">
                Account opened {timeAgo(user.created_at)}
              </p>
            </div>
          )}

          {!listing && !user && (
            <p className="mt-3 text-sm text-ink-500">
              The reported target is not a listing or user profile. Review the details
              manually.
            </p>
          )}
        </section>

        <ReportResolutionForm
          reportId={report.id}
          isListingTarget={report.target_type === "listing"}
        />
      </div>
    </div>
  );
}
