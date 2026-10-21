import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PropertyImage } from "@/components/property/property-image";
import {
  EnquiryStatusBadge,
  LeadStageBadge,
} from "@/components/enquiries/enquiry-badges";
import { propertyPhotoUrl } from "@/lib/storage";
import { timeAgo } from "@/lib/utils";
import type { EnquiryWithContext } from "@/features/enquiries/queries";

interface EnquiryCardProps {
  item: EnquiryWithContext;
  perspective: "renter" | "provider";
}

export function EnquiryCard({ item, perspective }: EnquiryCardProps) {
  const { enquiry, property, counterpart } = item;
  const href =
    perspective === "renter"
      ? `/enquiries/${enquiry.id}`
      : `/provider/enquiries/${enquiry.id}`;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-line-soft bg-surface-2 shadow-e1 transition-[box-shadow] duration-[var(--duration-base)] hover:shadow-e3">
      <div className="flex gap-3 p-3 sm:gap-4 sm:p-4">
        <PropertyImage
          src={propertyPhotoUrl(property?.coverPhoto)}
          alt={property?.title ?? "Listing"}
          className="aspect-[4/3] w-24 shrink-0 self-start rounded-xl sm:w-32"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <EnquiryStatusBadge status={enquiry.status} />
            {perspective === "provider" && (
              <LeadStageBadge stage={enquiry.lead_stage} />
            )}
          </div>

          <Link
            href={href}
            className="text-sm font-semibold leading-snug text-ink-900 hover:text-brand-800 sm:text-base"
          >
            {property?.title ?? "Listing"}
          </Link>

          <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5 shrink-0 text-ink-400" aria-hidden="true" />
              {perspective === "renter"
                ? `Provider: ${counterpart?.fullName ?? "Unknown"}`
                : `Renter: ${counterpart?.fullName ?? "Unknown"}`}
            </span>
            <span aria-hidden="true">·</span>
            <span>Updated {timeAgo(enquiry.updated_at)}</span>
          </p>

          <p className="line-clamp-2 text-xs leading-relaxed text-ink-500">
            {enquiry.message}
          </p>

          <div className="mt-auto flex items-center justify-between gap-2 pt-1">
            <span className="text-xs text-ink-400">
              {(enquiry.contact_preference ?? "in_app") === "in_app"
                ? "In-app messages"
                : enquiry.contact_preference}
            </span>
            <Link
              href={href}
              className="inline-flex items-center gap-0.5 text-xs font-medium text-brand-700 hover:text-brand-800"
            >
              Open
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      {perspective === "provider" && enquiry.lead_stage === "lost" && enquiry.lost_reason && (
        <p className="border-t border-line-soft bg-surface-1/60 px-4 py-2 text-xs text-ink-500">
          <Badge variant="danger" className="mr-1.5">
            Lost
          </Badge>
          {enquiry.lost_reason}
        </p>
      )}
    </article>
  );
}
