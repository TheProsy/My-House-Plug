import type { Metadata } from "next";
import { SectionHeading } from "@/components/spatial/surface";

export const metadata: Metadata = {
  title: "Privacy notice",
  description: "How My House Plug collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <SectionHeading
        eyebrow="Legal"
        title="Privacy notice"
        description="Working draft for the pilot. We collect the minimum needed to run accommodation discovery safely."
      />

      <div className="prose-sm mt-8 space-y-6 text-sm leading-relaxed text-ink-600">
        <section>
          <h2 className="text-base font-semibold text-ink-900">What we collect</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Account details: name, email, phone (optional), password hash.</li>
            <li>Activity: saved homes, enquiries, inspection requests, reports.</li>
            <li>Content you upload: profile photos, listing photos, verification evidence.</li>
            <li>Basic technical data needed to keep sessions secure.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-base font-semibold text-ink-900">How we use it</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>To operate search, enquiries, inspections, and roommate matching.</li>
            <li>To review verification cases and moderate listings.</li>
            <li>To notify you about your leads, inspections, and account.</li>
          </ul>
          <p className="mt-2">
            We do not sell personal data. We share contact details with a
            provider only when you send an enquiry or inspection request.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-ink-900">Verification evidence</h2>
          <p className="mt-2">
            Identity documents and ownership evidence are stored in a private
            area accessible only to the people you authorise and our verification
            staff, and are used only for the review you requested.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-ink-900">Your choices</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Update or remove profile details from your profile page.</li>
            <li>Email support@myagent.ng to request account deletion.</li>
            <li>Roommate profiles are visible to signed-in users only; you control the details shown.</li>
          </ul>
        </section>
        <p className="rounded-xl border border-warning-100 bg-warning-50 p-4 text-xs text-warning-700">
          This notice will be finalised with legal review before public launch.
          Questions: support@myagent.ng.
        </p>
      </div>
    </div>
  );
}
