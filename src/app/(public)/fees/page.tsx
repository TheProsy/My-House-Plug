import type { Metadata } from "next";
import { BadgeCheck, Ban, HandCoins, Receipt } from "lucide-react";
import { SectionHeading } from "@/components/spatial/surface";

export const metadata: Metadata = {
  title: "Fees & commissions",
  description: "What MY AGENT charges — and what it never charges — during the pilot.",
};

export default function FeesPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <SectionHeading
        eyebrow="Legal"
        title="Fees & commissions"
        description="Plain answers about money during the pilot."
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
          <Receipt className="size-5 text-brand-700" aria-hidden="true" />
          <h2 className="mt-2 text-sm font-semibold text-brand-950">
            What renters pay MY AGENT
          </h2>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-brand-950">
            ₦0
          </p>
          <p className="mt-1 text-sm leading-relaxed text-brand-900/80">
            Searching, saving, enquiries, and inspection requests are free.
            MY AGENT never collects rent, deposits, or agency fees from renters.
          </p>
        </div>
        <div className="rounded-2xl border border-line-soft bg-surface-2 p-5 shadow-e1">
          <BadgeCheck className="size-5 text-brand-700" aria-hidden="true" />
          <h2 className="mt-2 text-sm font-semibold text-ink-900">
            What providers pay during pilot
          </h2>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-ink-900">
            ₦0 to list
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-500">
            Listing and verification reviews are free in the pilot. No
            pay-to-rank: placement never depends on payment.
          </p>
        </div>
      </div>

      <section className="mt-8 rounded-2xl border border-line-soft bg-surface-2 p-5 shadow-e1">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
          <HandCoins className="size-4 text-brand-700" aria-hidden="true" />
          Commission arrangements (optional)
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">
          Where a provider and MY AGENT agree to a commission for a successful
          rental, the arrangement is recorded in writing on the platform before
          the deal closes. Both sides can see the terms and the outcome record.
          Commission is paid by the provider — never added silently to a
          renter&apos;s costs.
        </p>
      </section>

      <section className="mt-8 rounded-2xl border border-line-soft bg-surface-1 p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
          <Ban className="size-4 text-danger-600" aria-hidden="true" />
          What we will never do
        </h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink-600">
          <li>Collect rent or hold deposits (no escrow in this version).</li>
          <li>Charge renters to contact providers or book inspections.</li>
          <li>Sell ranking or hide unverified listings behind fees.</li>
          <li>Add fees to a listing that the provider did not disclose.</li>
        </ul>
      </section>

      <p className="mt-6 text-xs text-ink-400">
        Questions about fees? Contact support@myagent.ng.
      </p>
    </div>
  );
}
