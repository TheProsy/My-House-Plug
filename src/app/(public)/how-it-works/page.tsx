import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  BadgeCheck,
  CalendarCheck,
  FileCheck2,
  Heart,
  MapPinCheck,
  Receipt,
  Search,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/spatial/surface";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "How My House Plug searches, cost transparency, verification checks, inspections, and safety rules work — explained plainly.",
};

const verificationChecks = [
  {
    icon: UserRoundCheck,
    title: "Provider identity",
    means: "We review a government-issued ID for the person or business behind the listing.",
    notMeans: "It does not prove the provider owns or can lawfully advertise the property.",
  },
  {
    icon: FileCheck2,
    title: "Permission to advertise",
    means: "We review ownership documents or a written mandate for the specific property.",
    notMeans: "It does not guarantee the documents are genuine or that no third party will contest them.",
  },
  {
    icon: MapPinCheck,
    title: "Physical visit",
    means: "A verifier has visited the property and confirmed it exists as described.",
    notMeans: "It does not mean the property is available forever or free of maintenance issues.",
  },
];

const timeline = [
  {
    icon: Search,
    title: "Discover",
    body: "Search by campus, neighbourhood, budget, type, and furnishing. No account needed.",
  },
  {
    icon: Heart,
    title: "Shortlist",
    body: "Save homes to compare verified checks, known costs, and last availability confirmation.",
  },
  {
    icon: CalendarCheck,
    title: "Connect",
    body: "Send an enquiry or request an inspection. Track responses from your account.",
  },
  {
    icon: Receipt,
    title: "Confirm costs",
    body: "Review the cost sheet. Unknown mandatory costs are flagged instead of guessed.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="max-w-2xl space-y-3">
        <Badge variant="brand" className="gap-1.5">
          <Sparkles className="size-3" aria-hidden="true" />
          Plain answers, no fine print games
        </Badge>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
          How My House Plug works
        </h1>
        <p className="text-pretty text-base leading-relaxed text-ink-600">
          My House Plug helps you find accommodation around Nigerian campuses with
          transparent costs and honest verification labels. We connect you with
          providers — we do not collect rent or act as an escrow.
        </p>
      </div>

      <section aria-labelledby="journey-heading" className="mt-12">
        <SectionHeading
          eyebrow="The journey"
          title="From search to signing, in four steps"
        />
        <ol className="mt-6 grid gap-3 sm:grid-cols-2">
          {timeline.map((step) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className="flex gap-3 rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-ink-900">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-500">
                    {step.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="costs-heading" className="mt-14">
        <SectionHeading
          eyebrow="Costs"
          title="Know the move-in cost before you travel"
          description="Every listing carries a cost sheet: rent, agency fee, legal fee, caution deposit, service charge, and more — each marked as one-time or recurring, required or optional, and known or still unconfirmed."
        />
        <div className="mt-6 space-y-3">
          <Alert variant="info">
            <Receipt className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              When a mandatory cost is not confirmed, the total is shown as{" "}
              <strong>incomplete</strong> — never padded with assumptions. Ask
              the provider to confirm it before you commit.
            </span>
          </Alert>
          <Alert variant="warning">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              My House Plug does not collect rent, deposits, or agency fees. Pay only
              after inspecting, verify the account name you pay to, and keep
              receipts.
            </span>
          </Alert>
        </div>
      </section>

      <section id="verification" aria-labelledby="verification-heading" className="mt-14 scroll-mt-24">
        <SectionHeading
          eyebrow="Verification"
          title="What each check means — and what it does not"
          description="Identity, authorization, and visits are separate checks. Each listing shows its own labels with the date they were last confirmed."
        />
        <div className="mt-6 space-y-3">
          {verificationChecks.map((check) => {
            const Icon = check.icon;
            return (
              <article
                key={check.title}
                className="rounded-2xl border border-line-soft bg-surface-2 p-5 shadow-e1"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <h3 className="text-sm font-semibold text-ink-900">
                    {check.title}
                  </h3>
                  <Badge variant="brand" className="ml-auto gap-1">
                    <BadgeCheck className="size-3" aria-hidden="true" />
                    Separately verified
                  </Badge>
                </div>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <div className="rounded-xl bg-brand-50/60 p-3">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-brand-800">
                      What it means
                    </dt>
                    <dd className="mt-1 leading-relaxed text-brand-900/80">
                      {check.means}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-surface-1 p-3">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                      What it does not mean
                    </dt>
                    <dd className="mt-1 leading-relaxed text-ink-500">
                      {check.notMeans}
                    </dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="safety-heading" className="mt-14">
        <SectionHeading
          eyebrow="Safety"
          title="Rules we ask everyone to follow"
        />
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            "Inspect in person before paying anything — or send someone you trust.",
            "Never pay to reserve a home you have not seen.",
            "Match payment details to the verified provider before transferring.",
            "Report suspicious listings: scam signals, fake prices, or impersonation.",
          ].map((rule) => (
            <li
              key={rule}
              className="flex items-start gap-2.5 rounded-xl border border-line-soft bg-surface-2 p-4 text-sm leading-relaxed text-ink-600 shadow-e1"
            >
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden="true" />
              {rule}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="extras-heading" className="mt-14">
        <SectionHeading
          eyebrow="Beyond listings"
          title="Roommates and providers"
          description="Looking to share costs, or have a space to fill? Both live on My House Plug."
        />
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
            <Users className="size-5 text-brand-700" aria-hidden="true" />
            <h3 className="mt-2 text-sm font-semibold text-brand-950">
              Roommate matching
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-brand-900/80">
              Share a profile with your budget, campus, and living habits, then
              express interest in profiles that fit.
            </p>
            <Button asChild size="sm" className="mt-4">
              <Link href="/roommates">Find a roommate</Link>
            </Button>
          </div>
          <div className="rounded-2xl border border-line-soft bg-surface-2 p-5 shadow-e1">
            <BadgeCheck className="size-5 text-brand-700" aria-hidden="true" />
            <h3 className="mt-2 text-sm font-semibold text-ink-900">
              Providers
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-500">
              List a property with a full cost sheet, keep availability fresh,
              and respond to enquiries and inspection requests in one place.
            </p>
            <Button asChild size="sm" variant="secondary" className="mt-4">
              <Link href="/list-property">List a property</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="mt-14 flex flex-col items-center gap-3 rounded-2xl border border-line-soft bg-surface-1 p-8 text-center">
        <h2 className="text-xl font-semibold tracking-tight text-ink-900">
          Ready to find your place?
        </h2>
        <p className="max-w-md text-sm text-ink-500">
          Start with a search around your campus. You can browse everything
          without creating an account.
        </p>
        <Button asChild size="lg">
          <Link href="/search">Search homes</Link>
        </Button>
      </div>
    </div>
  );
}
