import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PropertyImage } from "@/components/property/property-image";
import { InspectionForm } from "@/components/enquiries/inspection-form";
import { getListingBySlug } from "@/features/accommodation/queries";
import { getSessionUser } from "@/features/authentication/queries";
import { getOpenEnquiryForProperty } from "@/features/enquiries/queries";
import { propertyPhotoUrl } from "@/lib/storage";
import { PROPERTY_TYPE_LABELS } from "@/lib/constants";
import { formatNaira } from "@/lib/utils";

interface InspectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: InspectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getListingBySlug(slug);
  return {
    title: data ? `Request inspection: ${data.listing.title}` : "Request inspection",
    description:
      "Pick a date and time to inspect this home. The provider confirms or suggests another time.",
  };
}

export default async function InspectPage({ params }: InspectPageProps) {
  const { slug } = await params;
  const data = await getListingBySlug(slug);

  if (!data) notFound();

  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent(`/properties/${slug}/inspect`)}`);
  }

  const { listing, photos } = data;
  const cover = photos[0]?.storage_path ?? null;
  const openEnquiry = await getOpenEnquiryForProperty(user.id, listing.id);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href={`/properties/${listing.slug}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-brand-800"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to listing
      </Link>

      <div className="mt-4 rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1">
        <div className="flex gap-3">
          <PropertyImage
            src={propertyPhotoUrl(cover)}
            alt={listing.title}
            className="aspect-[4/3] w-24 shrink-0 rounded-xl"
          />
          <div className="min-w-0">
            <Badge variant="solid">
              {PROPERTY_TYPE_LABELS[listing.property_type]}
            </Badge>
            <h1 className="mt-1.5 text-balance text-lg font-semibold leading-snug text-ink-900">
              {listing.title}
            </h1>
            <p className="mt-0.5 text-sm text-ink-500">
              {formatNaira(listing.min_rent)}
              <span className="ml-1 text-xs text-ink-400">starting rent</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold tracking-tight text-ink-900">
          Request an inspection
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-ink-500">
          Choose when you would like to see the home. The provider will confirm or
          suggest another time, and you can track the status from your account.
        </p>
      </div>

      <div className="mt-4">
        <InspectionForm
          propertyId={listing.id}
          propertyTitle={listing.title}
          hasOpenEnquiry={Boolean(openEnquiry)}
        />
      </div>

      <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-warning-100 bg-warning-50 px-4 py-3">
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-warning-700" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-warning-700">
          Inspections are free on MY AGENT. If anyone asks you to pay before a
          viewing, stop and report the listing — that is a common scam pattern.
        </p>
      </div>
    </div>
  );
}
