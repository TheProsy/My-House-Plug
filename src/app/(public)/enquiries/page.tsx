import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Inbox, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { EnquiryCard } from "@/components/enquiries/enquiry-card";
import { getSessionUser } from "@/features/authentication/queries";
import { getEnquiriesForRenter } from "@/features/enquiries/queries";

export const metadata: Metadata = {
  title: "My enquiries",
  description: "Track every enquiry you have sent and the provider responses.",
};

export default async function EnquiriesPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?redirectTo=/enquiries");
  }

  const enquiries = await getEnquiriesForRenter(user.id);
  const active = enquiries.filter((item) => item.enquiry.status !== "closed");
  const closed = enquiries.filter((item) => item.enquiry.status === "closed");

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
        Your enquiries
      </h1>
      <p className="mt-1 text-sm leading-relaxed text-ink-500">
        Every message, inspection, and provider response stays here so nothing gets
        lost in a phone call.
      </p>

      {enquiries.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={<Inbox className="size-5" aria-hidden="true" />}
          title="No enquiries yet"
          description="Send an enquiry from any listing to ask about availability, costs, or an inspection."
          action={
            <Button asChild>
              <Link href="/search">
                <Search className="size-4" aria-hidden="true" />
                Find a home
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="mt-6 space-y-8">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
              Active ({active.length})
            </h2>
            {active.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line bg-surface-1/60 px-4 py-5 text-sm text-ink-500">
                Nothing active right now. Start from search when you are ready.
              </p>
            ) : (
              active.map((item) => (
                <EnquiryCard key={item.enquiry.id} item={item} perspective="renter" />
              ))
            )}
          </section>

          {closed.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
                Closed ({closed.length})
              </h2>
              {closed.map((item) => (
                <EnquiryCard key={item.enquiry.id} item={item} perspective="renter" />
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
