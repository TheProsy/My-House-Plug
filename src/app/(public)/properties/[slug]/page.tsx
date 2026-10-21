import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BedDouble,
  Building2,
  CalendarCheck,
  Check,
  Flag,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SectionHeading } from "@/components/spatial/surface";
import { CostBreakdown } from "@/components/property/cost-breakdown";
import { PropertyCard } from "@/components/property/property-card";
import { PropertyGallery } from "@/components/property/property-gallery";
import { SaveButton } from "@/components/property/save-button";
import { TrustCard } from "@/components/property/trust-card";
import {
  AvailabilityBadge,
  VerificationBadges,
} from "@/components/property/verification-badges";
import {
  getListingBySlug,
  getSimilarListings,
} from "@/features/accommodation/queries";
import { getSessionUser } from "@/features/authentication/queries";
import { getSavedPropertyIds } from "@/features/saved/queries";
import { PROPERTY_TYPE_LABELS } from "@/lib/constants";
import { avatarUrl } from "@/lib/storage";
import {
  formatDate,
  formatNaira,
  formatRentPeriod,
  initials,
} from "@/lib/utils";

interface PropertyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getListingBySlug(slug);

  if (!data) return { title: "Home not found" };

  const description =
    data.listing.description?.slice(0, 158) ??
    `See known costs, verification status, and availability for this home near ${data.listing.campus_name ?? "campus"}.`;

  return {
    title: data.listing.title,
    description,
    openGraph: {
      title: data.listing.title,
      description,
      type: "article",
    },
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  const data = await getListingBySlug(slug);

  if (!data) notFound();

  const { listing, units, costs, photos, amenities, verification, providerBio, providerSince } =
    data;

  const [user, savedIds, similar] = await Promise.all([
    getSessionUser(),
    getSavedPropertyIds(),
    getSimilarListings(listing, 3),
  ]);

  const isAuthenticated = Boolean(user);
  const redirectTo = encodeURIComponent(`/properties/${listing.slug}`);
  const enquireHref = isAuthenticated
    ? `/properties/${listing.slug}/enquire`
    : `/login?redirectTo=${redirectTo}`;
  const inspectHref = isAuthenticated
    ? `/properties/${listing.slug}/inspect`
    : `/login?redirectTo=${redirectTo}`;

  const rent = listing.min_rent;
  const rentPeriod = units[0]
    ? formatRentPeriod(units[0].rent_period)
    : "per year";
  const priceLabel =
    listing.max_rent && rent && listing.max_rent !== rent
      ? `${formatNaira(rent)} – ${formatNaira(listing.max_rent)}`
      : formatNaira(rent);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href="/search"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-brand-800"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to search
      </Link>

      <div className="mt-4 space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="solid">{PROPERTY_TYPE_LABELS[listing.property_type]}</Badge>
          <AvailabilityBadge listing={listing} />
          <VerificationBadges listing={listing} />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-balance text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
              {listing.title}
            </h1>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-500">
              <MapPin className="size-4 shrink-0 text-ink-400" aria-hidden="true" />
              {[listing.neighbourhood_name, listing.campus_name, listing.university_name]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <SaveButton
            propertyId={listing.id}
            initialSaved={savedIds.has(listing.id)}
            isAuthenticated={isAuthenticated}
            labelled
            className="self-start"
          />
        </div>
      </div>

      <div className="mt-6">
        <PropertyGallery photos={photos} title={listing.title} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="min-w-0 space-y-6 lg:order-2">
          <section className="rounded-2xl border border-line-soft bg-surface-2 p-5 shadow-e1">
            <p className="text-2xl font-semibold tracking-tight text-ink-900">
              {priceLabel}
              <span className="ml-1.5 text-sm font-normal text-ink-400">
                {rent ? rentPeriod : "rent not confirmed"}
              </span>
            </p>
            {units.length > 1 && (
              <p className="mt-0.5 text-xs text-ink-400">
                Price range across {units.length} unit types
              </p>
            )}

            <div className="mt-4 flex flex-col gap-2">
              <Button asChild size="lg" className="w-full">
                <Link href={enquireHref}>
                  Enquire about this home
                  <Sparkles className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="secondary" className="w-full">
                <Link href={inspectHref}>
                  <CalendarCheck className="size-4" aria-hidden="true" />
                  Request an inspection
                </Link>
              </Button>
            </div>

            <p className="mt-3 flex items-start gap-2 rounded-xl bg-surface-1 px-3 py-2.5 text-xs leading-relaxed text-ink-500">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-brand-700" aria-hidden="true" />
              Never pay before inspecting. MY AGENT does not collect rent,
              deposits, or agency fees.
            </p>

            <Link
              href={`/report?property=${listing.slug}`}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-ink-400 transition-colors hover:text-danger-700"
            >
              <Flag className="size-3.5" aria-hidden="true" />
              Report this listing
            </Link>
          </section>

          <CostBreakdown
            costs={costs}
            rentAmount={rent}
            rentPeriodLabel={rent ? rentPeriod : "Rent not confirmed"}
          />

          <TrustCard listing={listing} verification={verification} />

          <section className="rounded-2xl border border-line-soft bg-surface-2 p-5 shadow-e1">
            <h2 className="text-base font-semibold text-ink-900">
              About this provider
            </h2>
            <div className="mt-3 flex items-center gap-3">
              <Avatar className="size-11">
                {listing.provider_avatar_url && (
                  <AvatarImage
                    src={avatarUrl(listing.provider_avatar_url) ?? undefined}
                    alt=""
                  />
                )}
                <AvatarFallback>
                  {initials(listing.provider_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink-900">
                  {listing.provider_name ?? "Provider"}
                </p>
                <p className="text-xs text-ink-400">
                  On MY AGENT since {formatDate(providerSince)}
                </p>
              </div>
            </div>
            {providerBio && (
              <p className="mt-3 text-sm leading-relaxed text-ink-600">
                {providerBio}
              </p>
            )}
          </section>
        </div>

        <div className="min-w-0 space-y-6 lg:order-1">
          <section className="rounded-2xl border border-line-soft bg-surface-2 p-5 shadow-e1">
            <h2 className="text-base font-semibold text-ink-900">
              The space
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-600">
              {listing.description?.trim() ||
                "The provider has not added a description yet."}
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line-soft pt-4 text-sm">
              <div>
                <dt className="text-xs text-ink-400">Type</dt>
                <dd className="mt-0.5 font-medium text-ink-900">
                  {PROPERTY_TYPE_LABELS[listing.property_type]}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-400">Furnishing</dt>
                <dd className="mt-0.5 font-medium text-ink-900">
                  {listing.furnished ? "Furnished" : "Unfurnished"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-400">Available from</dt>
                <dd className="mt-0.5 font-medium text-ink-900">
                  {formatDate(listing.available_from)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-400">Campus</dt>
                <dd className="mt-0.5 font-medium text-ink-900">
                  {listing.campus_name ?? "—"}
                </dd>
              </div>
            </dl>
          </section>

          {units.length > 0 && (
            <section className="rounded-2xl border border-line-soft bg-surface-2 shadow-e1">
              <header className="border-b border-line-soft px-5 py-4">
                <h2 className="text-base font-semibold text-ink-900">
                  Units and rent
                </h2>
              </header>
              <ul className="divide-y divide-line-soft">
                {units.map((unit) => (
                  <li
                    key={unit.id}
                    className="flex items-start justify-between gap-4 px-5 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-sm font-medium text-ink-900">
                        <BedDouble className="size-4 text-ink-400" aria-hidden="true" />
                        {unit.title || PROPERTY_TYPE_LABELS[unit.unit_type]}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-400">
                        {[
                          unit.bedrooms ? `${unit.bedrooms} bed` : null,
                          unit.bathrooms ? `${unit.bathrooms} bath` : null,
                          unit.is_shared ? "Shared" : null,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "Details not provided"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-ink-900">
                        {formatNaira(unit.rent_amount)}
                      </p>
                      <p className="text-xs text-ink-400">
                        {formatRentPeriod(unit.rent_period)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {amenities.length > 0 && (
            <section className="rounded-2xl border border-line-soft bg-surface-2 p-5 shadow-e1">
              <h2 className="text-base font-semibold text-ink-900">
                What is included
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {amenities.map((amenity) => (
                  <li
                    key={amenity.key}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-1 px-3 py-1.5 text-xs font-medium text-ink-700"
                  >
                    <Check className="size-3.5 text-brand-700" aria-hidden="true" />
                    {amenity.label}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-2xl border border-line-soft bg-surface-1 p-5">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
              <Building2 className="size-4 text-ink-400" aria-hidden="true" />
              Location
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
              {listing.neighbourhood_name
                ? `${listing.neighbourhood_name}, near ${listing.campus_name ?? "campus"}.`
                : "Exact address is shared when you arrange an inspection."}{" "}
              Ask the provider for exact directions before travelling.
            </p>
          </section>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-12" aria-labelledby="similar-heading">
          <SectionHeading
            eyebrow="Keep looking"
            title="Similar homes nearby"
            action={
              <Button asChild variant="secondary" size="sm">
                <Link
                  href={
                    listing.campus_id
                      ? `/search?campus=${listing.campus_id}`
                      : "/search"
                  }
                >
                  More in this area
                </Link>
              </Button>
            }
          />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((item) => (
              <PropertyCard
                key={item.id}
                listing={item}
                saved={savedIds.has(item.id)}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
