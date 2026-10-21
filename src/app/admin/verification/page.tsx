import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { getVerificationQueue } from "@/features/admin/queries";
import { VERIFICATION_STATUS_LABELS } from "@/lib/constants";
import { cn, timeAgo } from "@/lib/utils";
import type { VerificationStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "Verification queue",
};

const CHECK_TYPE_LABELS = {
  identity: "Identity",
  property_authorization: "Property authorization",
  property_visit: "Property visit",
} as const;

const STATUS_VARIANTS: Record<VerificationStatus, "brand" | "danger" | "warning" | "info" | "neutral"> = {
  not_started: "neutral",
  pending_review: "info",
  verified: "brand",
  more_info_required: "warning",
  rejected: "danger",
  expired: "neutral",
  suspended: "danger",
};

const TABS: { key: string; label: string; statuses: VerificationStatus[] }[] = [
  {
    key: "pending",
    label: "Pending",
    statuses: ["pending_review", "more_info_required"],
  },
  { key: "verified", label: "Verified", statuses: ["verified"] },
  {
    key: "closed",
    label: "Rejected and expired",
    statuses: ["rejected", "expired", "suspended"],
  },
  {
    key: "all",
    label: "All",
    statuses: [
      "not_started",
      "pending_review",
      "verified",
      "more_info_required",
      "rejected",
      "expired",
      "suspended",
    ],
  },
];

interface VerificationQueuePageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminVerificationPage({
  searchParams,
}: VerificationQueuePageProps) {
  const { status } = await searchParams;
  const activeTab = TABS.find((tab) => tab.key === status) ?? TABS[0];
  const queue = await getVerificationQueue(activeTab.statuses);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
          Verification
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Each check is reviewed independently — identity, authorization, and visit are
          separate signals.
        </p>
      </div>

      <div className="hide-scrollbar flex gap-1 overflow-x-auto">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === "pending" ? "/admin/verification" : `/admin/verification?status=${tab.key}`}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              activeTab.key === tab.key
                ? "border-brand-700 bg-brand-700 text-white"
                : "border-line bg-surface-2 text-ink-600 hover:bg-surface-1",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {queue.length === 0 ? (
        <EmptyState
          icon={<BadgeCheck className="size-5" aria-hidden="true" />}
          title="Nothing in this queue"
          description="New verification requests will show up here as providers submit evidence."
        />
      ) : (
        <ul className="space-y-3">
          {queue.map((item) => (
            <li key={item.case.id}>
              <Link
                href={`/admin/verification/${item.case.id}`}
                className="block rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1 transition-shadow hover:shadow-e3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant={STATUS_VARIANTS[item.case.status]}>
                        {VERIFICATION_STATUS_LABELS[item.case.status]}
                      </Badge>
                      <span className="text-xs text-ink-400">
                        {CHECK_TYPE_LABELS[item.case.check_type]}
                      </span>
                    </div>
                    <p className="mt-1.5 truncate text-sm font-semibold text-ink-900 sm:text-base">
                      {item.subjectLabel}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-500">
                      {item.evidenceCount} evidence file
                      {item.evidenceCount === 1 ? "" : "s"} · opened{" "}
                      {timeAgo(item.case.created_at)}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs text-ink-400">
                    Review
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
