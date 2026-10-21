import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { getReportQueue } from "@/features/admin/queries";
import { REPORT_REASON_LABELS } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import type { ReportSeverity, ReportStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "Report queue",
};

const SEVERITY_VARIANTS: Record<ReportSeverity, "danger" | "warning" | "neutral"> = {
  critical: "danger",
  high: "danger",
  medium: "warning",
  low: "neutral",
};

const STATUS_VARIANTS: Record<ReportStatus, "danger" | "warning" | "info" | "brand" | "neutral"> = {
  open: "warning",
  triaged: "info",
  investigating: "info",
  resolved: "brand",
  dismissed: "neutral",
};

export default async function AdminReportsPage() {
  const queue = await getReportQueue();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Reports</h1>
        <p className="mt-1 text-sm text-ink-500">
          Safety reports from renters and providers, highest severity first.
        </p>
      </div>

      {queue.length === 0 ? (
        <EmptyState
          icon={<Flag className="size-5" aria-hidden="true" />}
          title="No open reports"
          description="New reports from the report links on listings and profiles appear here."
        />
      ) : (
        <ul className="space-y-3">
          {queue.map((item) => (
            <li key={item.report.id}>
              <Link
                href={`/admin/reports/${item.report.id}`}
                className="block rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1 transition-shadow hover:shadow-e3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant={SEVERITY_VARIANTS[item.report.severity]}>
                        {item.report.severity}
                      </Badge>
                      <Badge variant={STATUS_VARIANTS[item.report.status]}>
                        {item.report.status}
                      </Badge>
                      <span className="text-xs text-ink-400">
                        {item.report.target_type}
                      </span>
                    </div>
                    <p className="mt-1.5 truncate text-sm font-semibold text-ink-900 sm:text-base">
                      {REPORT_REASON_LABELS[item.report.reason]}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-500">
                      {item.targetLabel ?? "Unknown target"} · Reported by{" "}
                      {item.reporterName ?? "unknown"} · {timeAgo(item.report.created_at)}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs text-ink-400">
                    Triage
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
