import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CircleDollarSign,
  Eye,
  FileClock,
  Home,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { SectionHeading } from "@/components/spatial/surface";
import { ListingStatusBadge } from "@/components/provider/listing-status-badge";
import { ActionButton } from "@/components/ui/action-button";
import { getSessionUser } from "@/features/authentication/queries";
import { getProviderProperties, summarizeListings } from "@/features/provider/queries";
import { confirmAvailabilityNow } from "@/features/provider/actions";
import { formatNaira, isAvailabilityStale, timeAgo } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Provider dashboard",
};

export default async function ProviderDashboardPage() {
  const user = await getSessionUser();
  const listings = user ? await getProviderProperties(user.id) : [];
  const stats = summarizeListings(listings);
  const recent = listings.slice(0, 4);
  const needsAvailability = listings.filter(
    (listing) =>
      listing.listing_status === "published" &&
      isAvailabilityStale(listing.last_availability_confirmed_at),
  );

  const statCards = [
    { label: "Published", value: stats.published, icon: Home },
    { label: "Drafts", value: stats.drafts, icon: FileClock },
    { label: "In review", value: stats.pending, icon: Eye },
    { label: "Paused", value: stats.paused, icon: CalendarClock },
  ];

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Overview"
        title="Provider dashboard"
        description="Your listings, their review status, and what needs attention today."
        action={
          <Button asChild>
            <Link href="/provider/properties/new">New listing</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-ink-400">
                  {card.label}
                </span>
                <Icon className="size-4 text-ink-400" aria-hidden="true" />
              </div>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-ink-900">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {needsAvailability.length > 0 && (
        <section
          aria-labelledby="availability-heading"
          className="rounded-2xl border border-warning-100 bg-warning-50 p-5"
        >
          <h2
            id="availability-heading"
            className="flex items-center gap-2 text-sm font-semibold text-warning-700"
          >
            <CalendarClock className="size-4" aria-hidden="true" />
            Availability needs confirming
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-warning-700/90">
            Renters see a warning on listings whose availability has not been
            confirmed in the last 14 days. Confirm to keep them fresh.
          </p>
          <ul className="mt-3 space-y-2">
            {needsAvailability.map((listing) => (
              <li
                key={listing.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-warning-100 bg-surface-2 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-900">
                    {listing.title}
                  </p>
                  <p className="text-xs text-ink-400">
                    Last confirmed{" "}
                    {listing.last_availability_confirmed_at
                      ? timeAgo(listing.last_availability_confirmed_at)
                      : "never"}
                  </p>
                </div>
                <ActionButton
                  variant="secondary"
                  size="sm"
                  action={confirmAvailabilityNow}
                  fields={{ propertyId: listing.id }}
                  successFallback="Availability confirmed."
                >
                  Still available
                </ActionButton>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="recent-heading">
        <SectionHeading
          eyebrow="Listings"
          title="Most recent"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link href="/provider/properties">
                All listings
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          }
        />
        {recent.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {recent.map((listing) => (
              <li
                key={listing.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <ListingStatusBadge status={listing.listing_status} />
                    <p className="truncate text-sm font-medium text-ink-900">
                      {listing.title}
                    </p>
                  </div>
                  <p className="mt-1 flex items-center gap-3 text-xs text-ink-400">
                    <span className="flex items-center gap-1">
                      <CircleDollarSign className="size-3.5" aria-hidden="true" />
                      {listing.min_rent ? formatNaira(listing.min_rent) : "No price yet"}
                    </span>
                    <span>
                      {listing.unit_count}{" "}
                      {listing.unit_count === 1 ? "unit" : "units"}
                    </span>
                    <span className="hidden sm:inline">
                      Updated {timeAgo(listing.created_at)}
                    </span>
                  </p>
                </div>
                <Button asChild variant="secondary" size="sm">
                  <Link href={`/provider/properties/${listing.id}`}>Manage</Link>
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4">
            <EmptyState
              icon={<Home className="size-6" aria-hidden="true" />}
              title="No listings yet"
              description="Create your first listing. You can save it as a draft and submit it for review when it is ready."
              action={
                <Button asChild>
                  <Link href="/provider/properties/new">Create a listing</Link>
                </Button>
              }
            />
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-line-soft bg-surface-1 p-5">
        <h2 className="text-sm font-semibold text-ink-900">
          Build trust with verification
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-ink-500">
          Identity and property authorization are checked separately. Requesting
          both helps your listings stand out to renters who filter by verified
          badges.
        </p>
        <Button asChild variant="secondary" size="sm" className="mt-3">
          <Link href="/provider/verification">
            Manage verification
            <Badge variant="brand" className="ml-1">
              Recommended
            </Badge>
          </Link>
        </Button>
      </section>
    </div>
  );
}
