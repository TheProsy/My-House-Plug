import Link from "next/link";
import { ArrowUpRight, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SaveButton } from "@/components/property/save-button";
import { PropertyImage } from "@/components/property/property-image";
import {
  AvailabilityBadge,
  VerificationBadges,
} from "@/components/property/verification-badges";
import { PROPERTY_TYPE_LABELS } from "@/lib/constants";
import { propertyPhotoUrl } from "@/lib/storage";
import { formatNaira, formatRentPeriod } from "@/lib/utils";
import type { ListingCard } from "@/features/accommodation/queries";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  listing: ListingCard;
  saved?: boolean;
  isAuthenticated?: boolean;
  priority?: boolean;
  className?: string;
}

export function PropertyCard({
  listing,
  saved = false,
  isAuthenticated = false,
  priority = false,
  className,
}: PropertyCardProps) {
  const rent = listing.min_rent;
  const rentPeriod = listing.rent_period
    ? formatRentPeriod(listing.rent_period)
    : "";
  const shared = listing.unit_count > 1;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-line-soft bg-surface-2 shadow-e1 transition-[transform,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-spatial)] hover:-translate-y-0.5 hover:shadow-e3",
        className,
      )}
    >
      <div className="relative">
        <Link
          href={`/properties/${listing.slug}`}
          className="block focus-visible:outline-none"
          aria-label={`View ${listing.title}`}
        >
          <PropertyImage
            src={propertyPhotoUrl(listing.cover_photo)}
            alt={listing.title}
            className="aspect-[4/3] w-full"
            priority={priority}
          />
        </Link>
        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <Badge variant="solid" className="pointer-events-auto">
            {PROPERTY_TYPE_LABELS[listing.property_type]}
          </Badge>
          <div className="pointer-events-auto">
            <SaveButton
              propertyId={listing.id}
              initialSaved={saved}
              isAuthenticated={isAuthenticated}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold tracking-tight text-ink-900">
              {formatNaira(rent)}
              <span className="ml-1 text-xs font-normal text-ink-400">
                {rent ? rentPeriod : "rent not set"}
              </span>
            </p>
            <Link
              href={`/properties/${listing.slug}`}
              className="mt-1 block text-sm font-medium leading-snug text-ink-900 hover:text-brand-800"
            >
              {listing.title}
            </Link>
          </div>
        </div>

        <p className="flex items-center gap-1.5 text-xs text-ink-500">
          <MapPin className="size-3.5 shrink-0 text-ink-400" aria-hidden="true" />
          {[listing.neighbourhood_name, listing.campus_name]
            .filter(Boolean)
            .join(" · ")}
        </p>

        <div className="flex flex-wrap items-center gap-1.5">
          <AvailabilityBadge listing={listing} />
          <VerificationBadges listing={listing} compact />
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-line-soft pt-3 text-xs text-ink-400">
          <span className="flex items-center gap-1.5">
            {shared && (
              <>
                <Users className="size-3.5" aria-hidden="true" />
                {listing.unit_count} units ·{" "}
              </>
            )}
            {listing.provider_name ?? "Provider"}
          </span>
          <Link
            href={`/properties/${listing.slug}`}
            className="inline-flex items-center gap-0.5 font-medium text-brand-700 hover:text-brand-800"
          >
            View
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
