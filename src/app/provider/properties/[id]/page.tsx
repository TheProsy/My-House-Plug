import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarClock,
  ImageIcon,
  Receipt,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListingStatusBadge } from "@/components/provider/listing-status-badge";
import { ActionButton } from "@/components/ui/action-button";
import { ProviderPropertyForm } from "@/components/provider/provider-property-form";
import { UnitForm } from "@/components/provider/unit-form";
import { CostForm } from "@/components/provider/cost-form";
import { PhotoUploader } from "@/components/provider/photo-uploader";
import { AmenitiesForm } from "@/components/provider/amenities-form";
import { AvailabilityForm } from "@/components/provider/availability-form";
import { getCampusOptions } from "@/features/accommodation/queries";
import { getSessionUser } from "@/features/authentication/queries";
import {
  getAmenityOptions,
  getProviderProperty,
} from "@/features/provider/queries";
import {
  deleteDraftPropertyAction,
  deletePhotoAction,
  removeCostAction,
  removeUnitAction,
  requestVerificationNow,
  setCoverPhotoAction,
  updateListingStatusAction,
} from "@/features/provider/actions";
import { VERIFICATION_STATUS_LABELS } from "@/lib/constants";
import { propertyPhotoUrl } from "@/lib/storage";
import { formatDate, formatNaira, formatRentPeriod, timeAgo } from "@/lib/utils";

interface ManagePropertyPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Manage listing",
};

export default async function ManagePropertyPage({
  params,
}: ManagePropertyPageProps) {
  const { id } = await params;
  const user = await getSessionUser();
  const detail = user ? await getProviderProperty(id) : null;

  if (!user || !detail || detail.property.owner_id !== user.id) {
    notFound();
  }

  const [campuses, amenityOptions] = await Promise.all([
    getCampusOptions(),
    getAmenityOptions(),
  ]);

  const { property, units, costs, photos, amenityIds, verification, lastAvailability } =
    detail;

  const hasUnits = units.length > 0;
  const hasPhotos = photos.length > 0;

  const authorizationCase = verification.find(
    (item) => item.check_type === "property_authorization",
  );
  const visitCase = verification.find((item) => item.check_type === "property_visit");

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/provider/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-brand-800"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to dashboard
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <ListingStatusBadge status={property.listing_status} />
          <Badge variant="neutral">
            {formatNaira(
              units.reduce<number | null>(
                (min, unit) =>
                  unit.rent_amount !== null &&
                  (min === null || unit.rent_amount < min)
                    ? unit.rent_amount
                    : min,
                null,
              ),
            )}
          </Badge>
          <Badge variant="neutral">
            {units.length} {units.length === 1 ? "unit" : "units"}
          </Badge>
          <Badge variant="neutral">{photos.length} photos</Badge>
        </div>

        <h1 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-ink-900">
          {property.title}
        </h1>
        <p className="mt-1 text-sm text-ink-400">
          Created {formatDate(property.created_at)} · Availability last confirmed{" "}
          {property.last_availability_confirmed_at
            ? timeAgo(property.last_availability_confirmed_at)
            : "never"}
        </p>
      </div>

      {(property.listing_status === "draft" ||
        property.listing_status === "changes_requested") && (
        <Alert variant="info">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">
              {property.listing_status === "changes_requested"
                ? "A reviewer requested changes."
                : "This is a private draft."}
            </p>
            <p className="mt-0.5 text-xs">
              {!hasUnits && "Add at least one unit with rent. "}
              {!hasPhotos && "Add at least one photo. "}
              {hasUnits && hasPhotos
                ? "Everything required is in place — submit for review when ready."
                : "Then submit for review to appear in search."}
            </p>
          </div>
        </Alert>
      )}

      <div className="flex flex-wrap gap-2">
        {(property.listing_status === "draft" ||
          property.listing_status === "changes_requested") && (
          <ActionButton
            action={updateListingStatusAction}
            fields={{ propertyId: property.id, transition: "submit_for_review" }}
            successFallback="Submitted for review."
          >
            Submit for review
          </ActionButton>
        )}
        {property.listing_status === "pending_review" && (
          <ActionButton
            variant="secondary"
            action={updateListingStatusAction}
            fields={{ propertyId: property.id, transition: "withdraw_review" }}
            successFallback="Moved back to draft."
          >
            Withdraw from review
          </ActionButton>
        )}
        {property.listing_status === "published" && (
          <>
            <Button asChild variant="secondary">
              <Link href={`/properties/${property.slug}`}>View public page</Link>
            </Button>
            <ActionButton
              variant="secondary"
              action={updateListingStatusAction}
              fields={{ propertyId: property.id, transition: "pause" }}
              successFallback="Listing paused."
            >
              Pause listing
            </ActionButton>
            <ActionButton
              variant="ghost"
              action={updateListingStatusAction}
              fields={{ propertyId: property.id, transition: "mark_rented" }}
              successFallback="Marked as rented."
            >
              Mark as rented
            </ActionButton>
          </>
        )}
        {property.listing_status === "paused" && (
          <ActionButton
            action={updateListingStatusAction}
            fields={{ propertyId: property.id, transition: "resume" }}
            successFallback="Listing is live again."
          >
            Resume listing
          </ActionButton>
        )}
        {(property.listing_status === "rented" ||
          property.listing_status === "archived") && (
          <ActionButton
            action={updateListingStatusAction}
            fields={{ propertyId: property.id, transition: "relist" }}
            successFallback="Listing published again."
          >
            Relist
          </ActionButton>
        )}
      </div>

      <section className="rounded-2xl border border-line-soft bg-surface-2 p-5 shadow-e1 sm:p-6">
        <h2 className="text-base font-semibold text-ink-900">Listing details</h2>
        <p className="mt-0.5 text-xs text-ink-400">
          Renters see this information on the listing page.
        </p>
        <div className="mt-4">
          <ProviderPropertyForm
            campuses={campuses}
            mode="edit"
            propertyId={property.id}
            defaults={{
              title: property.title,
              description: property.description,
              propertyType: property.property_type,
              campusId: property.campus_id ?? "",
              neighbourhoodId: property.neighbourhood_id ?? "",
              address: property.address ?? "",
              furnished:
                property.furnished === null
                  ? "unspecified"
                  : property.furnished
                    ? "yes"
                    : "no",
            }}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-line-soft bg-surface-2 shadow-e1">
        <header className="border-b border-line-soft px-5 py-4">
          <h2 className="text-base font-semibold text-ink-900">Units and rent</h2>
          <p className="mt-0.5 text-xs text-ink-400">
            The lowest unit rent is what renters see in search.
          </p>
        </header>

        {units.length > 0 ? (
          <ul className="divide-y divide-line-soft">
            {units.map((unit) => (
              <li
                key={unit.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-sm font-medium text-ink-900">
                    <Building2 className="size-4 text-ink-400" aria-hidden="true" />
                    {unit.title}
                    {unit.is_shared && <Badge variant="neutral">Shared</Badge>}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-400">
                    {[
                      unit.bedrooms ? `${unit.bedrooms} bed` : null,
                      unit.bathrooms ? `${unit.bathrooms} bath` : null,
                      unit.available_from
                        ? `from ${formatDate(unit.available_from)}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "No extra details"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold text-ink-900">
                    {formatNaira(unit.rent_amount)}
                    <span className="ml-1 text-xs font-normal text-ink-400">
                      {formatRentPeriod(unit.rent_period)}
                    </span>
                  </p>
                  <ActionButton
                    variant="ghost"
                    size="icon-sm"
                    action={removeUnitAction}
                    fields={{ propertyId: property.id, unitId: unit.id }}
                    confirmMessage="Remove this unit?"
                    successFallback="Unit removed."
                    aria-label={`Remove ${unit.title}`}
                  >
                    <Trash2 className="size-4 text-danger-600" aria-hidden="true" />
                  </ActionButton>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-4 text-sm text-ink-400">
            No units yet. Every listing needs at least one unit with a rent
            amount.
          </p>
        )}

        <div className="border-t border-line-soft p-5">
          <UnitForm propertyId={property.id} />
        </div>
      </section>

      <section className="rounded-2xl border border-line-soft bg-surface-2 shadow-e1">
        <header className="border-b border-line-soft px-5 py-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-ink-900">
            <Receipt className="size-4 text-ink-400" aria-hidden="true" />
            Cost sheet
          </h2>
          <p className="mt-0.5 text-xs text-ink-400">
            Disclose every mandatory fee. Leave amounts empty for costs you have
            not confirmed — renters see them flagged instead of guessed.
          </p>
        </header>

        {costs.length > 0 ? (
          <ul className="divide-y divide-line-soft">
            {costs.map((cost) => (
              <li
                key={cost.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
              >
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-ink-900">
                    {cost.label}
                    <Badge variant="neutral">
                      {cost.recurrence.replaceAll("_", " ")}
                    </Badge>
                    {!cost.is_mandatory && <Badge variant="neutral">Optional</Badge>}
                    {cost.is_refundable && <Badge variant="brand">Refundable</Badge>}
                  </p>
                  {cost.notes && (
                    <p className="mt-0.5 text-xs text-ink-400">{cost.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <p
                    className={
                      cost.is_known && cost.amount !== null
                        ? "text-sm font-semibold text-ink-900"
                        : "text-sm font-medium text-warning-700"
                    }
                  >
                    {cost.is_known && cost.amount !== null
                      ? formatNaira(Number(cost.amount))
                      : "Not confirmed"}
                  </p>
                  <ActionButton
                    variant="ghost"
                    size="icon-sm"
                    action={removeCostAction}
                    fields={{ propertyId: property.id, costId: cost.id }}
                    confirmMessage="Remove this cost row?"
                    successFallback="Cost removed."
                    aria-label={`Remove ${cost.label}`}
                  >
                    <Trash2 className="size-4 text-danger-600" aria-hidden="true" />
                  </ActionButton>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-4 text-sm text-ink-400">
            No cost rows yet. Add agency fees, deposits, and service charges so
            renters know the full move-in total.
          </p>
        )}

        <div className="border-t border-line-soft p-5">
          <CostForm propertyId={property.id} />
        </div>
      </section>

      <section className="rounded-2xl border border-line-soft bg-surface-2 shadow-e1">
        <header className="border-b border-line-soft px-5 py-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-ink-900">
            <ImageIcon className="size-4 text-ink-400" aria-hidden="true" />
            Photos
          </h2>
          <p className="mt-0.5 text-xs text-ink-400">
            The cover photo is shown in search. Use real photos of the actual
            space.
          </p>
        </header>

        {photos.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3">
            {photos.map((photo, index) => {
              const url = propertyPhotoUrl(photo.storage_path);
              return (
                <div
                  key={photo.id}
                  className="group relative overflow-hidden rounded-xl border border-line-soft bg-surface-1"
                >
                  <div className="relative aspect-[4/3]">
                    {url && (
                      <Image
                        src={url}
                        alt={photo.caption ?? `Photo ${index + 1}`}
                        fill
                        sizes="(max-width: 640px) 50vw, 240px"
                        className="object-cover"
                      />
                    )}
                    {photo.is_cover && (
                      <Badge variant="solid" className="absolute left-2 top-2">
                        Cover
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-1 border-t border-line-soft p-2">
                    {!photo.is_cover && (
                      <ActionButton
                        variant="ghost"
                        size="sm"
                        action={setCoverPhotoAction}
                        fields={{ propertyId: property.id, photoId: photo.id }}
                        successFallback="Cover photo updated."
                      >
                        Make cover
                      </ActionButton>
                    )}
                    <ActionButton
                      variant="ghost"
                      size="icon-sm"
                      action={deletePhotoAction}
                      fields={{ propertyId: property.id, photoId: photo.id }}
                      confirmMessage="Remove this photo?"
                      successFallback="Photo removed."
                      aria-label="Remove photo"
                      className="ml-auto"
                    >
                      <Trash2 className="size-4 text-danger-600" aria-hidden="true" />
                    </ActionButton>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="px-5 py-4 text-sm text-ink-400">
            No photos yet. Listings with photos get far more inspection
            requests.
          </p>
        )}

        <div className="border-t border-line-soft p-5">
          <PhotoUploader propertyId={property.id} userId={user.id} />
        </div>
      </section>

      <section className="rounded-2xl border border-line-soft bg-surface-2 p-5 shadow-e1 sm:p-6">
        <h2 className="text-base font-semibold text-ink-900">
          What is included
        </h2>
        <p className="mt-0.5 text-xs text-ink-400">
          Select the amenities renters care about: water, power, security, and
          more.
        </p>
        <div className="mt-4">
          <AmenitiesForm
            propertyId={property.id}
            options={amenityOptions}
            selectedIds={amenityIds}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-line-soft bg-surface-2 p-5 shadow-e1 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-ink-900">
          <CalendarClock className="size-4 text-ink-400" aria-hidden="true" />
          Availability
        </h2>
        <p className="mt-0.5 text-xs text-ink-400">
          {lastAvailability
            ? `Last confirmed ${timeAgo(lastAvailability.confirmed_at)}${
                lastAvailability.notes ? ` — "${lastAvailability.notes}"` : ""
              }`
            : "Not confirmed yet. Renters see a warning once 14 days pass without confirmation."}
        </p>
        <div className="mt-4">
          <AvailabilityForm propertyId={property.id} />
        </div>
      </section>

      <section className="rounded-2xl border border-line-soft bg-surface-2 shadow-e1">
        <header className="border-b border-line-soft px-5 py-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-ink-900">
            <BadgeCheck className="size-4 text-ink-400" aria-hidden="true" />
            Verification
          </h2>
          <p className="mt-0.5 text-xs text-ink-400">
            Authorization and visit checks apply to this property. Identity is
            checked once for your account on the verification page.
          </p>
        </header>
        <ul className="divide-y divide-line-soft">
          {[
            {
              label: "Permission to advertise",
              checkType: "property_authorization",
              record: authorizationCase,
            },
            {
              label: "Physical visit",
              checkType: "property_visit",
              record: visitCase,
            },
          ].map((item) => (
            <li
              key={item.checkType}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
            >
              <div>
                <p className="text-sm font-medium text-ink-900">{item.label}</p>
                <p className="mt-0.5 text-xs text-ink-400">
                  {item.record
                    ? VERIFICATION_STATUS_LABELS[item.record.status]
                    : "Not requested yet"}
                  {item.record?.reviewed_at
                    ? ` · reviewed ${formatDate(item.record.reviewed_at)}`
                    : ""}
                </p>
              </div>
              {item.record ? (
                <Badge
                  variant={item.record.status === "verified" ? "brand" : "neutral"}
                >
                  {VERIFICATION_STATUS_LABELS[item.record.status]}
                </Badge>
              ) : (
                <ActionButton
                  variant="secondary"
                  size="sm"
                  action={requestVerificationNow}
                  fields={{
                    propertyId: property.id,
                    checkType: item.checkType,
                  }}
                  successFallback="Verification requested."
                >
                  Request check
                </ActionButton>
              )}
            </li>
          ))}
        </ul>
      </section>

      {property.listing_status === "draft" && (
        <section className="rounded-2xl border border-danger-100 bg-danger-50/60 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-danger-700">
            <TriangleAlert className="size-4" aria-hidden="true" />
            Danger zone
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-danger-700/80">
            Deleting a draft is permanent. Once a listing is submitted for
            review it can no longer be deleted — pause or archive it instead.
          </p>
          <div className="mt-3">
            <ActionButton
              variant="danger"
              size="sm"
              action={deleteDraftPropertyAction}
              fields={{ propertyId: property.id }}
              confirmMessage="Delete this draft permanently?"
              successFallback="Draft deleted."
            >
              Delete draft
            </ActionButton>
          </div>
        </section>
      )}
    </div>
  );
}
