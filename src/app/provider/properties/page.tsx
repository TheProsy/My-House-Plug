import type { Metadata } from "next";
import Link from "next/link";
import { CircleDollarSign, Eye, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { SectionHeading } from "@/components/spatial/surface";
import { ListingStatusBadge } from "@/components/provider/listing-status-badge";
import { ActionButton } from "@/components/ui/action-button";
import { getSessionUser } from "@/features/authentication/queries";
import { getProviderProperties, summarizeListings } from "@/features/provider/queries";
import {
  confirmAvailabilityNow,
  updateListingStatusAction,
} from "@/features/provider/actions";
import { formatNaira, isAvailabilityStale, timeAgo } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My listings",
};

export default async function ProviderPropertiesPage() {
  const user = await getSessionUser();
  const listings = user ? await getProviderProperties(user.id) : [];
  const stats = summarizeListings(listings);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Listings"
        title="All listings"
        description="Manage status, availability, and details. Published listings are visible to renters."
        action={
          <Button asChild>
            <Link href="/provider/properties/new">New listing</Link>
          </Button>
        }
      />

      {listings.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-line bg-surface-2 px-2.5 py-1 font-medium text-ink-600">
            {stats.published} published
          </span>
          <span className="rounded-full border border-line bg-surface-2 px-2.5 py-1 font-medium text-ink-600">
            {stats.pending} in review
          </span>
          <span className="rounded-full border border-line bg-surface-2 px-2.5 py-1 font-medium text-ink-600">
            {stats.drafts} drafts
          </span>
          <span className="rounded-full border border-line bg-surface-2 px-2.5 py-1 font-medium text-ink-600">
            {stats.paused} paused
          </span>
        </div>
      )}

      {listings.length === 0 ? (
        <EmptyState
          icon={<Home className="size-6" aria-hidden="true" />}
          title="Nothing listed yet"
          description="Create a listing with clear costs and accurate availability. Drafts are private until you submit them for review."
          action={
            <Button asChild>
              <Link href="/provider/properties/new">Create a listing</Link>
            </Button>
          }
        />
      ) : (
        <ul className="space-y-2">
          {listings.map((listing) => {
            const stale =
              listing.listing_status === "published" &&
              isAvailabilityStale(listing.last_availability_confirmed_at);

            return (
              <li
                key={listing.id}
                className="rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <ListingStatusBadge status={listing.listing_status} />
                      {stale && (
                        <span className="rounded-full bg-warning-50 px-2.5 py-0.5 text-xs font-medium text-warning-700">
                          Availability stale
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/provider/properties/${listing.id}`}
                      className="mt-2 block truncate text-sm font-semibold text-ink-900 hover:text-brand-800"
                    >
                      {listing.title}
                    </Link>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-400">
                      <span className="flex items-center gap-1">
                        <CircleDollarSign className="size-3.5" aria-hidden="true" />
                        {listing.min_rent
                          ? formatNaira(listing.min_rent)
                          : "No price yet"}
                      </span>
                      <span>
                        {listing.unit_count}{" "}
                        {listing.unit_count === 1 ? "unit" : "units"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="size-3.5" aria-hidden="true" />
                        {listing.view_count} views
                      </span>
                      <span>Updated {timeAgo(listing.created_at)}</span>
                    </p>
                  </div>
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/provider/properties/${listing.id}`}>Manage</Link>
                  </Button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 border-t border-line-soft pt-3">
                  {(listing.listing_status === "draft" ||
                    listing.listing_status === "changes_requested") && (
                    <ActionButton
                      size="sm"
                      action={updateListingStatusAction}
                      fields={{
                        propertyId: listing.id,
                        transition: "submit_for_review",
                      }}
                      successFallback="Submitted for review."
                    >
                      Submit for review
                    </ActionButton>
                  )}
                  {listing.listing_status === "pending_review" && (
                    <ActionButton
                      size="sm"
                      variant="secondary"
                      action={updateListingStatusAction}
                      fields={{ propertyId: listing.id, transition: "withdraw_review" }}
                      successFallback="Moved back to draft."
                    >
                      Withdraw from review
                    </ActionButton>
                  )}
                  {listing.listing_status === "published" && (
                    <>
                      <ActionButton
                        size="sm"
                        variant="secondary"
                        action={confirmAvailabilityNow}
                        fields={{ propertyId: listing.id }}
                        successFallback="Availability confirmed."
                      >
                        Confirm availability
                      </ActionButton>
                      <ActionButton
                        size="sm"
                        variant="ghost"
                        action={updateListingStatusAction}
                        fields={{ propertyId: listing.id, transition: "pause" }}
                        successFallback="Listing paused."
                      >
                        Pause
                      </ActionButton>
                      <ActionButton
                        size="sm"
                        variant="ghost"
                        action={updateListingStatusAction}
                        fields={{ propertyId: listing.id, transition: "mark_rented" }}
                        successFallback="Marked as rented."
                      >
                        Mark rented
                      </ActionButton>
                    </>
                  )}
                  {listing.listing_status === "paused" && (
                    <>
                      <ActionButton
                        size="sm"
                        action={updateListingStatusAction}
                        fields={{ propertyId: listing.id, transition: "resume" }}
                        successFallback="Listing is live again."
                      >
                        Resume
                      </ActionButton>
                      <ActionButton
                        size="sm"
                        variant="secondary"
                        action={confirmAvailabilityNow}
                        fields={{ propertyId: listing.id }}
                        successFallback="Availability confirmed."
                      >
                        Confirm availability
                      </ActionButton>
                    </>
                  )}
                  {(listing.listing_status === "rented" ||
                    listing.listing_status === "archived") && (
                    <ActionButton
                      size="sm"
                      variant="secondary"
                      action={updateListingStatusAction}
                      fields={{ propertyId: listing.id, transition: "relist" }}
                      successFallback="Listing published again."
                    >
                      Relist
                    </ActionButton>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
