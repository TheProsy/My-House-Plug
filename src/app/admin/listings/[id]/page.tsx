import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, ShieldCheck, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PropertyImage } from "@/components/property/property-image";
import { ReviewListingForm } from "@/components/admin/review-listing-form";
import { ListingStatusBadge } from "@/components/provider/listing-status-badge";
import { getListingForReview } from "@/features/admin/queries";
import {
  COST_CATEGORY_LABELS,
  COST_RECURRENCE_LABELS,
  PROPERTY_TYPE_LABELS,
  VERIFICATION_STATUS_LABELS,
} from "@/lib/constants";
import { propertyPhotoUrl } from "@/lib/storage";
import { formatDate, formatNaira, timeAgo } from "@/lib/utils";

interface AdminListingDetailProps {
  params: Promise<{ id: string }>;
}

export default async function AdminListingDetailPage({
  params,
}: AdminListingDetailProps) {
  const { id } = await params;
  const data = await getListingForReview(id);

  if (!data) notFound();

  const { property, owner, units, costs, photos, amenities, verification } = data;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/listings"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-brand-800"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to queue
      </Link>

      <div className="rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1 sm:p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <ListingStatusBadge status={property.listing_status} />
          <Badge variant="neutral">{PROPERTY_TYPE_LABELS[property.property_type]}</Badge>
        </div>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-ink-900 sm:text-2xl">
          {property.title}
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          {property.address ?? "No address on file"}
          {property.furnished === null
            ? ""
            : property.furnished
              ? " · furnished"
              : " · unfurnished"}
        </p>
        <p className="mt-0.5 text-xs text-ink-400">
          Created {timeAgo(property.created_at)} · Updated {timeAgo(property.updated_at)}
        </p>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-700">
          {property.description || "No description provided."}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="min-w-0 space-y-6">
          <section className="rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1 sm:p-5">
            <h2 className="text-sm font-semibold text-ink-900">
              Photos ({photos.length})
            </h2>
            {photos.length === 0 ? (
              <p className="mt-3 text-sm text-ink-500">No photos attached.</p>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative">
                    <PropertyImage
                      src={propertyPhotoUrl(photo.storage_path)}
                      alt={photo.caption ?? property.title}
                      className="aspect-[4/3] w-full rounded-xl"
                      sizes="(max-width: 640px) 50vw, 240px"
                    />
                    {photo.is_cover && (
                      <Badge variant="solid" className="absolute left-2 top-2">
                        Cover
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1 sm:p-5">
            <h2 className="text-sm font-semibold text-ink-900">
              Units ({units.length})
            </h2>
            {units.length === 0 ? (
              <p className="mt-3 text-sm text-ink-500">No units added.</p>
            ) : (
              <ul className="mt-3 divide-y divide-line-soft">
                {units.map((unit) => (
                  <li key={unit.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink-800">
                        {unit.title || PROPERTY_TYPE_LABELS[unit.unit_type]}
                      </p>
                      <p className="text-xs text-ink-400">
                        {PROPERTY_TYPE_LABELS[unit.unit_type]}
                        {unit.is_shared ? " · shared" : ""}
                        {unit.available_from ? ` · from ${formatDate(unit.available_from)}` : ""}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-ink-900">
                      {unit.rent_amount === null ? "—" : formatNaira(unit.rent_amount)}
                      <span className="ml-1 text-xs font-normal text-ink-400">
                        {unit.rent_period.replace("per_", "/ ")}
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1 sm:p-5">
            <h2 className="text-sm font-semibold text-ink-900">
              Cost transparency ({costs.length})
            </h2>
            {costs.length === 0 ? (
              <p className="mt-3 text-sm text-ink-500">
                No cost rows — renters will see costs as unknown.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-line-soft">
                {costs.map((cost) => (
                  <li key={cost.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink-800">
                        {cost.label}
                      </p>
                      <p className="text-xs text-ink-400">
                        {COST_CATEGORY_LABELS[cost.category]} ·{" "}
                        {COST_RECURRENCE_LABELS[cost.recurrence]}
                        {cost.is_mandatory ? " · mandatory" : " · optional"}
                        {cost.is_refundable ? " · refundable" : ""}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-ink-900">
                      {cost.is_known && cost.amount !== null
                        ? formatNaira(cost.amount)
                        : "Unknown"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {amenities.length > 0 && (
            <section className="rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1 sm:p-5">
              <h2 className="text-sm font-semibold text-ink-900">Amenities</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {amenities.map((amenity) => (
                  <Badge key={amenity.key} variant="neutral">
                    {amenity.label}
                  </Badge>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
              <User className="size-4 text-brand-700" aria-hidden="true" />
              Provider
            </h2>
            <p className="mt-2 text-sm font-medium text-ink-800">
              {owner?.full_name ?? "Unknown"}
            </p>
            {owner?.phone && (
              <p className="mt-0.5 text-sm text-ink-500">{owner.phone}</p>
            )}
            {owner?.is_suspended && (
              <Badge variant="danger" className="mt-2">
                Suspended account
              </Badge>
            )}
            {owner?.bio && (
              <p className="mt-2 text-xs leading-relaxed text-ink-500">{owner.bio}</p>
            )}
            <Link
              href={`/properties/${property.slug}`}
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800"
            >
              Preview public page
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </Link>
          </section>

          <section className="rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
              <ShieldCheck className="size-4 text-brand-700" aria-hidden="true" />
              Verification status
            </h2>
            {verification.length === 0 ? (
              <p className="mt-2 text-xs text-ink-500">
                No verification cases for this property or provider.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {verification.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-ink-600">
                      {item.subject_type === "user" ? "Provider " : "Property "}
                      {item.check_type.replaceAll("_", " ")}
                    </span>
                    <Badge
                      variant={
                        item.status === "verified"
                          ? "brand"
                          : item.status === "rejected"
                            ? "danger"
                            : "warning"
                      }
                    >
                      {VERIFICATION_STATUS_LABELS[item.status]}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <ReviewListingForm listingId={property.id} />
        </div>
      </div>
    </div>
  );
}
