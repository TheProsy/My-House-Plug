import {
  BadgeCheck,
  CalendarClock,
  MapPinCheck,
  ShieldQuestion,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { isAvailabilityStale, timeAgo } from "@/lib/utils";
import type { Views } from "@/types/database";

type Listing = Pick<
  Views<"property_listings">,
  | "authorization_verified"
  | "visit_verified"
  | "provider_identity_verified"
  | "last_availability_confirmed_at"
>;

export function VerificationBadges({
  listing,
  compact = false,
}: {
  listing: Listing;
  compact?: boolean;
}) {
  const authorization = listing.authorization_verified === "verified";
  const visit = listing.visit_verified === "verified";
  const identity = listing.provider_identity_verified === "verified";

  if (!authorization && !visit && !identity) {
    return (
      <Badge variant="neutral" className="gap-1">
        <ShieldQuestion className="size-3" aria-hidden="true" />
        Unverified checks
      </Badge>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {authorization && (
        <Badge variant="brand" className="gap-1">
          <BadgeCheck className="size-3" aria-hidden="true" />
          {compact ? "Authorized" : "Authorization verified"}
        </Badge>
      )}
      {visit && (
        <Badge variant="brand" className="gap-1">
          <MapPinCheck className="size-3" aria-hidden="true" />
          {compact ? "Visited" : "Visited by verifier"}
        </Badge>
      )}
      {identity && !compact && (
        <Badge variant="brand" className="gap-1">
          <BadgeCheck className="size-3" aria-hidden="true" />
          Provider ID verified
        </Badge>
      )}
    </div>
  );
}

export function AvailabilityBadge({
  listing,
}: {
  listing: Pick<
    Views<"property_listings">,
    "availability_status" | "last_availability_confirmed_at"
  >;
}) {
  const stale = isAvailabilityStale(listing.last_availability_confirmed_at);
  const confirmed = timeAgo(listing.last_availability_confirmed_at);

  if (listing.availability_status === "available" && !stale) {
    return (
      <Badge variant="brand" className="gap-1">
        <CalendarClock className="size-3" aria-hidden="true" />
        Available · confirmed {confirmed}
      </Badge>
    );
  }

  if (stale) {
    return (
      <Badge variant="warning" className="gap-1">
        <CalendarClock className="size-3" aria-hidden="true" />
        Availability needs confirming
      </Badge>
    );
  }

  const label =
    listing.availability_status === "occupied"
      ? "Occupied"
      : listing.availability_status === "coming_soon"
        ? "Coming soon"
        : "Availability unknown";

  return <Badge variant="neutral">{label}</Badge>;
}
