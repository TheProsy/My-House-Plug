import type { Metadata } from "next";
import { SectionHeading } from "@/components/spatial/surface";

export const metadata: Metadata = {
  title: "Platform terms",
  description: "The terms that govern use of MY AGENT.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <SectionHeading
        eyebrow="Legal"
        title="Platform terms"
        description="Working draft for the pilot. These terms describe how MY AGENT connects renters and providers."
      />

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink-600">
        <section>
          <h2 className="text-base font-semibold text-ink-900">What MY AGENT is</h2>
          <p className="mt-2">
            MY AGENT is a discovery and connection platform. We publish listings,
            surface verification labels, and provide tooling for enquiries,
            inspections, and lead tracking. We are not a party to any tenancy
            agreement and we do not collect rent, deposits, or agency fees.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-ink-900">Verification, honestly</h2>
          <p className="mt-2">
            Verification labels describe specific checks performed at specific
            times. They reduce risk but are not a guarantee. You remain
            responsible for inspecting a property and confirming the provider&apos;s
            authority before paying anything.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-ink-900">Provider responsibilities</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Only advertise properties you own or are authorised to represent.</li>
            <li>Disclose costs truthfully; mark unconfirmed costs as unknown.</li>
            <li>Keep availability accurate and confirm it regularly.</li>
            <li>Treat renters lawfully and without discrimination.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-base font-semibold text-ink-900">Renter responsibilities</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Inspect before paying; never pay to reserve an unseen property.</li>
            <li>Use the reporting tools for suspicious behaviour.</li>
            <li>Keep communications on the platform where possible.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-base font-semibold text-ink-900">Enforcement</h2>
          <p className="mt-2">
            We may suspend accounts, remove listings, or restrict features for
            violations, including scam signals, impersonation, or repeat
            misleading listings. Reported cases are reviewed by moderators.
          </p>
        </section>
        <p className="rounded-xl border border-warning-100 bg-warning-50 p-4 text-xs text-warning-700">
          These terms will be finalised with legal review before public launch.
        </p>
      </div>
    </div>
  );
}
