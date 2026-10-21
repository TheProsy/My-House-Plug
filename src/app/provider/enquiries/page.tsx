import type { Metadata } from "next";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { EnquiryCard } from "@/components/enquiries/enquiry-card";
import { getSessionUser } from "@/features/authentication/queries";
import { getEnquiriesForProvider } from "@/features/enquiries/queries";

export const metadata: Metadata = {
  title: "Enquiries and leads",
  description: "Track every renter enquiry from first message to rented.",
};

export default async function ProviderEnquiriesPage() {
  const user = await getSessionUser();
  const enquiries = user ? await getEnquiriesForProvider(user.id) : [];

  const active = enquiries.filter(
    (item) =>
      item.enquiry.status !== "closed" &&
      item.enquiry.lead_stage !== "rented" &&
      item.enquiry.lead_stage !== "lost",
  );
  const done = enquiries.filter((item) => !active.includes(item));

  const needsResponse = active.filter((item) => item.enquiry.status === "open");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
          Enquiries and leads
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-ink-500">
          Every renter enquiry with its stage, inspection status, and full message
          history.
        </p>
        {needsResponse.length > 0 && (
          <p className="mt-2 text-sm font-medium text-warning-700">
            {needsResponse.length} enquiry{needsResponse.length === 1 ? "" : "s"}{" "}
            waiting for your first reply.
          </p>
        )}
      </div>

      {enquiries.length === 0 ? (
        <EmptyState
          icon={<Inbox className="size-5" aria-hidden="true" />}
          title="No enquiries yet"
          description="When renters send enquiries or request inspections on your listings, they appear here."
          action={
            <Link
              href="/provider/properties"
              className="text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              Review your listings
            </Link>
          }
        />
      ) : (
        <div className="space-y-8">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
              Active ({active.length})
            </h2>
            {active.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line bg-surface-1/60 px-4 py-5 text-sm text-ink-500">
                No active leads right now.
              </p>
            ) : (
              active.map((item) => (
                <EnquiryCard
                  key={item.enquiry.id}
                  item={item}
                  perspective="provider"
                />
              ))
            )}
          </section>

          {done.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
                Settled ({done.length})
              </h2>
              {done.map((item) => (
                <EnquiryCard
                  key={item.enquiry.id}
                  item={item}
                  perspective="provider"
                />
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
