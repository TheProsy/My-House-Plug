import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, CalendarCheck } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { PropertyImage } from "@/components/property/property-image";
import { InspectionStatusBadge } from "@/components/enquiries/enquiry-badges";
import { getSessionUser } from "@/features/authentication/queries";
import {
  getInspectionsForUser,
  type InspectionWithContext,
} from "@/features/enquiries/queries";
import { propertyPhotoUrl } from "@/lib/storage";
import { formatDateTime, timeAgo } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Inspections",
  description: "Track every inspection request and its status.",
};

const OPEN_STATUSES = new Set(["requested", "confirmed", "rescheduled"]);

export default async function InspectionsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?redirectTo=/inspections");
  }

  const inspections = await getInspectionsForUser(user.id);

  const upcoming = inspections.filter((item) =>
    OPEN_STATUSES.has(item.inspection.status),
  );
  const past = inspections
    .filter((item) => !OPEN_STATUSES.has(item.inspection.status))
    .reverse();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
        Inspections
      </h1>
      <p className="mt-1 text-sm leading-relaxed text-ink-500">
        Every visit you have requested or received, with the provider&apos;s response.
      </p>

      {inspections.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={<CalendarCheck className="size-5" aria-hidden="true" />}
          title="No inspections yet"
          description="Request an inspection from any listing — it is free, and the provider confirms or suggests another time."
        />
      ) : (
        <div className="mt-6 space-y-8">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
              Upcoming and pending ({upcoming.length})
            </h2>
            {upcoming.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line bg-surface-1/60 px-4 py-5 text-sm text-ink-500">
                Nothing scheduled right now.
              </p>
            ) : (
              upcoming.map((item) => <InspectionRow key={item.inspection.id} item={item} viewerId={user.id} />)
            )}
          </section>

          {past.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
                History ({past.length})
              </h2>
              {past.map((item) => (
                <InspectionRow key={item.inspection.id} item={item} viewerId={user.id} />
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

interface InspectionRowProps {
  item: InspectionWithContext;
  viewerId: string;
}

function InspectionRow({ item, viewerId }: InspectionRowProps) {
  const { inspection, enquiry, property, counterpart } = item;
  const isRenter = enquiry ? enquiry.renter_id === viewerId : true;
  const href = enquiry
    ? isRenter
      ? `/enquiries/${enquiry.id}`
      : `/provider/enquiries/${enquiry.id}`
    : null;

  return (
    <article className="rounded-2xl border border-line-soft bg-surface-2 p-3 shadow-e1 sm:p-4">
      <div className="flex gap-3">
        <PropertyImage
          src={propertyPhotoUrl(property?.coverPhoto)}
          alt={property?.title ?? "Listing"}
          className="aspect-[4/3] w-20 shrink-0 self-start rounded-xl sm:w-28"
        />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <InspectionStatusBadge status={inspection.status} />
          </div>
          <p className="text-sm font-semibold leading-snug text-ink-900">
            {property?.title ?? "Listing"}
          </p>
          <p className="text-xs text-ink-500">
            {isRenter ? "Provider" : "Renter"}: {counterpart?.fullName ?? "Unknown"} ·{" "}
            {formatDateTime(inspection.scheduled_at)}
          </p>
          {inspection.notes && (
            <p className="line-clamp-2 text-xs leading-relaxed text-ink-500">
              {inspection.notes}
            </p>
          )}
          <div className="flex items-center justify-between gap-2 pt-1 text-xs text-ink-400">
            <span>Requested {timeAgo(inspection.created_at)}</span>
            {href && (
              <Link
                href={href}
                className="inline-flex items-center gap-0.5 font-medium text-brand-700 hover:text-brand-800"
              >
                Open enquiry
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
