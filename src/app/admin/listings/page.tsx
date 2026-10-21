import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ListChecks } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { ListingStatusBadge } from "@/components/provider/listing-status-badge";
import { getListingReviewQueue } from "@/features/admin/queries";
import { PROPERTY_TYPE_LABELS } from "@/lib/constants";
import { formatNaira, timeAgo } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Listing review queue",
};

export default async function AdminListingsPage() {
  const queue = await getListingReviewQueue();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
          Listing review
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Listings waiting for a decision, oldest first.
        </p>
      </div>

      {queue.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="size-5" aria-hidden="true" />}
          title="Review queue is clear"
          description="New listings submitted for review will appear here."
        />
      ) : (
        <ul className="space-y-3">
          {queue.map((item) => (
            <li key={item.property.id}>
              <Link
                href={`/admin/listings/${item.property.id}`}
                className="block rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1 transition-shadow hover:shadow-e3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <ListingStatusBadge status={item.property.listing_status} />
                      <span className="text-xs text-ink-400">
                        {PROPERTY_TYPE_LABELS[item.property.property_type]}
                      </span>
                    </div>
                    <p className="mt-1.5 truncate text-sm font-semibold text-ink-900 sm:text-base">
                      {item.property.title}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-500">
                      {item.ownerName ?? "Unknown owner"} ·{" "}
                      {[item.neighbourhoodName, item.campusName]
                        .filter(Boolean)
                        .join(" · ") || "No location set"}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs text-ink-400">
                    Open
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line-soft pt-3 text-xs text-ink-500">
                  <span>
                    {item.unitCount} unit{item.unitCount === 1 ? "" : "s"}
                  </span>
                  <span>
                    {item.photoCount} photo{item.photoCount === 1 ? "" : "s"}
                  </span>
                  <span>
                    {item.minRent !== null ? `${formatNaira(item.minRent)} from` : "No rent set"}
                  </span>
                  <span>Updated {timeAgo(item.property.updated_at)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
