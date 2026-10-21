import {
  BadgeCheck,
  CalendarClock,
  FileCheck2,
  MapPinCheck,
  ShieldQuestion,
  UserRoundCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VERIFICATION_STATUS_LABELS } from "@/lib/constants";
import { formatDate, isAvailabilityStale } from "@/lib/utils";
import type { Views } from "@/types/database";

interface TrustCardProps {
  listing: Views<"property_listings">;
  verification: Views<"public_verifications">[];
}

export function TrustCard({ listing, verification }: TrustCardProps) {
  const authorization = verification.find(
    (item) => item.check_type === "property_authorization",
  );
  const visit = verification.find(
    (item) => item.check_type === "property_visit",
  );

  const identityVerified = listing.provider_identity_verified === "verified";

  return (
    <section
      aria-labelledby="trust-heading"
      className="rounded-2xl border border-line-soft bg-surface-2 shadow-e2"
    >
      <header className="border-b border-line-soft px-5 py-4">
        <h2 id="trust-heading" className="text-base font-semibold text-ink-900">
          What has been checked
        </h2>
        <p className="mt-0.5 text-xs text-ink-400">
          Each check is separate. Identity does not prove ownership.
        </p>
      </header>

      <ul className="divide-y divide-line-soft">
        <TrustRow
          icon={<UserRoundCheck className="size-4" />}
          title="Provider identity"
          status={identityVerified ? "verified" : "not_started"}
          detail={
            identityVerified
              ? "The provider's identity document was reviewed."
              : "No identity check is recorded for this provider."
          }
        />
        <TrustRow
          icon={<FileCheck2 className="size-4" />}
          title="Permission to advertise"
          status={authorization?.status ?? "not_started"}
          detail={
            authorization?.reviewed_at
              ? `Checked ${formatDate(authorization.reviewed_at)}. ${authorization.notes ?? ""}`.trim()
              : (authorization?.notes ??
                "No authorization evidence has been reviewed.")
          }
        />
        <TrustRow
          icon={<MapPinCheck className="size-4" />}
          title="Physical visit"
          status={visit?.status ?? "not_started"}
          detail={
            visit?.reviewed_at
              ? `Visited ${formatDate(visit.reviewed_at)}. ${visit.notes ?? ""}`.trim()
              : (visit?.notes ??
                "No platform visit is recorded for this property.")
          }
        />
      </ul>

      <footer className="space-y-2 border-t border-line-soft px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-xs text-ink-500">
            <CalendarClock className="size-3.5" aria-hidden="true" />
            Availability last confirmed
          </span>
          <Badge
            variant={
              isAvailabilityStale(listing.last_availability_confirmed_at)
                ? "warning"
                : "brand"
            }
          >
            {listing.last_availability_confirmed_at
              ? formatDate(listing.last_availability_confirmed_at)
              : "Never confirmed"}
          </Badge>
        </div>
        <p className="flex items-start gap-1.5 text-xs leading-relaxed text-ink-400">
          <ShieldQuestion className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          Checks reduce risk but do not guarantee that a property is free of
          every issue. Always inspect before paying, and never pay through an
          unverified third party.
        </p>
      </footer>
    </section>
  );
}

function TrustRow({
  icon,
  title,
  status,
  detail,
}: {
  icon: React.ReactNode;
  title: string;
  status: keyof typeof VERIFICATION_STATUS_LABELS;
  detail: string;
}) {
  const verified = status === "verified";
  return (
    <li className="flex gap-3 px-5 py-4">
      <span
        className={
          verified
            ? "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-800"
            : "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-1 text-ink-400"
        }
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-ink-900">{title}</p>
          <Badge variant={verified ? "brand" : "neutral"}>
            {verified && <BadgeCheck className="size-3" aria-hidden="true" />}
            {VERIFICATION_STATUS_LABELS[status]}
          </Badge>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-ink-500">{detail}</p>
      </div>
    </li>
  );
}
