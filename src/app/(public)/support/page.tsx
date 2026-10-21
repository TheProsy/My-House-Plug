import type { Metadata } from "next";
import Link from "next/link";
import { LifeBuoy, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/spatial/surface";

export const metadata: Metadata = {
  title: "Support",
  description: "Get help with MY AGENT — enquiries, inspections, report a listing, or account issues.",
};

const topics = [
  {
    title: "An enquiry or inspection went wrong",
    body: "Open the enquiry from your account, add a note to the timeline, and report the provider if they asked for payment before an inspection.",
  },
  {
    title: "A listing looks fake or misleading",
    body: "Use the Report this listing link on the listing page. Include what you noticed — price, photos, or payment requests.",
  },
  {
    title: "My account or profile",
    body: "Check your profile page first. If you are locked out, use the password reset on the sign-in screen.",
  },
  {
    title: "Fees and commissions",
    body: "See the Fees & commissions page for exactly what MY AGENT charges and what we never charge.",
  },
];

export default function SupportPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <SectionHeading
        eyebrow="Help centre"
        title="Support"
        description="We are a small team during the pilot. Most issues are resolved fastest from your account pages."
      />

      <div className="mt-8 space-y-3">
        {topics.map((topic) => (
          <article
            key={topic.title}
            className="rounded-2xl border border-line-soft bg-surface-2 p-5 shadow-e1"
          >
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
              <LifeBuoy className="size-4 text-brand-700" aria-hidden="true" />
              {topic.title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
              {topic.body}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-line-soft bg-surface-1 p-6">
        <h2 className="text-sm font-semibold text-ink-900">
          Still stuck? Contact us
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-ink-500">
          Email support with your account email, the listing link, and what
          happened. We reply within two working days.
        </p>
        <Button asChild variant="secondary" className="mt-4">
          <a href="mailto:support@myagent.ng">
            <Mail className="size-4" aria-hidden="true" />
            support@myagent.ng
          </a>
        </Button>
        <p className="mt-3 text-xs leading-relaxed text-ink-400">
          Note: MY AGENT cannot recover money paid outside the platform. If you
          believe you were defrauded, report it to the police and to us — we
          will suspend and investigate the account.{" "}
          <Link href="/report" className="font-medium text-ink-600 underline-offset-4 hover:underline">
            Report a listing
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
