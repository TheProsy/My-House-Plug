import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  CalendarCheck,
  ClipboardList,
  Coins,
  FileCheck2,
  Gauge,
  Home,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/spatial/surface";
import {
  getSessionUser,
  isProvider,
} from "@/features/authentication/queries";

export const metadata: Metadata = {
  title: "List a property",
  description:
    "List accommodation near Nigerian campuses with transparent costs, accurate availability, and verification that builds trust.",
};

const benefits = [
  {
    icon: Receipt,
    title: "Full cost sheet, no surprises",
    body: "Publish rent, agency fees, deposits, and service charges — or mark them unconfirmed so renters know exactly what to ask.",
  },
  {
    icon: Gauge,
    title: "Availability that stays fresh",
    body: "Confirm availability in one tap. Stale listings are labelled automatically so serious renters keep coming back.",
  },
  {
    icon: ClipboardList,
    title: "A clear lead pipeline",
    body: "See every enquiry and inspection request as a trackable stage — from new to rented — with notes and follow-ups.",
  },
  {
    icon: ShieldCheck,
    title: "Verification that means something",
    body: "Identity and property authorization are checked separately, so your verified badges carry real weight.",
  },
];

const steps = [
  {
    icon: Home,
    title: "Create your listing",
    body: "Describe the property, units, amenities, and the exact costs a renter will face.",
  },
  {
    icon: FileCheck2,
    title: "Submit for verification",
    body: "Upload identity and ownership or mandate documents for review (optional but recommended).",
  },
  {
    icon: CalendarCheck,
    title: "Respond to renters",
    body: "Confirm inspections, answer enquiries, and move leads through your pipeline.",
  },
  {
    icon: Coins,
    title: "Close and record",
    body: "Mark outcomes and, where agreed, keep commission records accurate for both sides.",
  },
];

export default async function ListPropertyPage() {
  const user = await getSessionUser();
  const provider = isProvider(user);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="max-w-2xl space-y-3">
        <Badge variant="brand" className="gap-1.5">
          <BadgeCheck className="size-3" aria-hidden="true" />
          For landlords and agents
        </Badge>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
          Reach renters who are ready to inspect
        </h1>
        <p className="text-pretty text-base leading-relaxed text-ink-600">
          MY AGENT is built around trust signals students actually check:
          known costs, honest verification labels, and fresh availability.
          Listing is free during the pilot.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button asChild size="lg">
            <Link
              href={
                provider
                  ? "/provider/dashboard"
                  : user
                    ? "/provider/dashboard"
                    : "/register?type=landlord"
              }
            >
              {provider
                ? "Go to your dashboard"
                : user
                  ? "Become a provider"
                  : "Create a provider account"}
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/how-it-works#verification">
              How verification works
            </Link>
          </Button>
        </div>
        <p className="text-xs text-ink-400">
          Already registered?{" "}
          <Link
            href="/login?redirectTo=%2Fprovider%2Fdashboard"
            className="font-medium text-ink-600 underline-offset-4 hover:underline"
          >
            Sign in
          </Link>{" "}
          to continue.
        </p>
      </div>

      <section aria-labelledby="benefits-heading" className="mt-12">
        <SectionHeading
          eyebrow="Why list here"
          title="Built to close rentals, not just collect leads"
        />
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <article
                key={benefit.title}
                className="rounded-2xl border border-line-soft bg-surface-2 p-5 shadow-e1"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-3 text-sm font-semibold text-ink-900">
                  {benefit.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-500">
                  {benefit.body}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="steps-heading" className="mt-12">
        <SectionHeading eyebrow="Getting started" title="Four steps to your first listing" />
        <ol className="mt-6 space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className="flex gap-3 rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-0 text-brand-700">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold tabular-nums text-ink-400">
                    Step 0{index + 1}
                  </p>
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

      <section className="mt-12 rounded-2xl border border-line-soft bg-surface-1 p-6 sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight text-ink-900">
          Fees during the pilot
        </h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-600">
          <li className="flex items-start gap-2">
            <BadgeCheck className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden="true" />
            Listing is free. No pay-to-rank, no boosted placement.
          </li>
          <li className="flex items-start gap-2">
            <BadgeCheck className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden="true" />
            Commission arrangements, where they exist, are agreed in writing on
            the platform before a deal closes.
          </li>
          <li className="flex items-start gap-2">
            <BadgeCheck className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden="true" />
            MY AGENT never collects rent or deposits from renters.
          </li>
        </ul>
        <p className="mt-4 text-xs text-ink-400">
          Full details in{" "}
          <Link href="/fees" className="font-medium text-ink-600 underline-offset-4 hover:underline">
            Fees &amp; commissions
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
