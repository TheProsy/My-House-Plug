import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CheckCircle2,
  Clock4,
  FileCheck2,
  Handshake,
  Heart,
  Home,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { SectionHeading } from "@/components/spatial/surface";
import { HeroSearch } from "@/components/search/hero-search";
import { PropertyCard } from "@/components/property/property-card";
import {
  getCampusOptions,
  getFeaturedListings,
  getRecentListings,
} from "@/features/accommodation/queries";
import { getSessionUser } from "@/features/authentication/queries";
import { getSavedPropertyIds } from "@/features/saved/queries";

const trustPoints = [
  {
    icon: ShieldCheck,
    title: "Provider identity checked",
    description:
      "We confirm who the provider is and record when the check happened. A verified provider is not automatically an authorised one.",
  },
  {
    icon: FileCheck2,
    title: "Property authorization checked",
    description:
      "Ownership or permission to list is verified separately from identity. Each listing shows exactly which checks passed.",
  },
  {
    icon: Clock4,
    title: "Availability kept fresh",
    description:
      "Every listing shows when availability was last confirmed, so a stale listing is easy to spot before you travel.",
  },
];

const steps = [
  {
    icon: Search,
    title: "Search by campus life",
    description:
      "Filter by campus, neighbourhood, budget, and the kind of space that fits how you want to live.",
  },
  {
    icon: Heart,
    title: "Shortlist what fits",
    description:
      "Save homes and compare known costs side by side, even when some amounts are still unconfirmed.",
  },
  {
    icon: CalendarCheck,
    title: "Book an inspection",
    description:
      "Send an enquiry or request a visit. Your lead moves through a clear, trackable pipeline.",
  },
  {
    icon: Handshake,
    title: "Decide with confidence",
    description:
      "Inspect in person, ask questions, and rent directly with the provider. MY AGENT never holds your rent.",
  },
];

export default async function HomePage() {
  const [campuses, featured, recent, user, savedIds] = await Promise.all([
    getCampusOptions(),
    getFeaturedListings(6),
    getRecentListings(3),
    getSessionUser(),
    getSavedPropertyIds(),
  ]);

  const isAuthenticated = Boolean(user);
  const recentListings = recent.filter(
    (listing) => !featured.some((feature) => feature.id === listing.id),
  );
  const hasListings = featured.length > 0 || recentListings.length > 0;

  return (
    <>
      <section className="relative overflow-hidden border-b border-line-soft bg-surface-1">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_15%_0%,rgba(16,185,129,0.10),transparent_60%),radial-gradient(50%_50%_at_95%_10%,rgba(4,120,87,0.07),transparent_55%)]"
        />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-14">
          <div className="max-w-3xl animate-rise">
            <Badge variant="brand" className="gap-1.5">
              <span className="size-1.5 rounded-full bg-brand-600" aria-hidden="true" />
              Now piloting around FUTA, Akure
            </Badge>
            <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-ink-900 sm:text-5xl">
              Find your place. Know the cost.
              <span className="text-brand-800"> Move with confidence.</span>
            </h1>
            <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-ink-600 sm:text-lg">
              Accommodation near Nigerian campuses with transparent move-in
              costs, clear verification labels, and inspections you can actually
              schedule.
            </p>
          </div>

          <div className="mt-7 max-w-4xl animate-rise sm:mt-9">
            <HeroSearch campuses={campuses} />
          </div>

          <ul className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-ink-500">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-brand-600" aria-hidden="true" />
              Search without an account
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-brand-600" aria-hidden="true" />
              Known costs shown upfront
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-brand-600" aria-hidden="true" />
              No escrow — rent direct
            </li>
          </ul>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl space-y-16 px-4 py-12 sm:px-6 sm:py-16">
        {hasListings ? (
          <>
            {featured.length > 0 && (
              <section aria-labelledby="featured-heading">
                <SectionHeading
                  eyebrow="Featured homes"
                  title="Places worth a closer look"
                  description="Each card shows what is known about cost, verification, and availability — including what is still unconfirmed."
                  action={
                    <Button asChild variant="secondary" size="sm">
                      <Link href="/search">
                        Browse all
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  }
                />
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {featured.map((listing, index) => (
                    <PropertyCard
                      key={listing.id}
                      listing={listing}
                      saved={savedIds.has(listing.id)}
                      isAuthenticated={isAuthenticated}
                      priority={index < 2}
                    />
                  ))}
                </div>
              </section>
            )}

            {recentListings.length > 0 && (
              <section aria-labelledby="recent-heading">
                <SectionHeading
                  eyebrow="Just added"
                  title="Fresh around campus"
                  description="Newly published homes from providers in the pilot area."
                  action={
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/search?sort=newest">
                        See newest
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  }
                />
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {recentListings.map((listing) => (
                    <PropertyCard
                      key={listing.id}
                      listing={listing}
                      saved={savedIds.has(listing.id)}
                      isAuthenticated={isAuthenticated}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <section aria-label="Getting started">
            <EmptyState
              icon={<Home className="size-6" aria-hidden="true" />}
              title="We are onboarding providers around FUTA"
              description="Homes will appear here as providers publish and pass review. If you have a place near campus, you can be among the first."
              action={
                <Button asChild>
                  <Link href="/list-property">
                    List a property
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              }
            />
          </section>
        )}

        <section
          id="trust"
          aria-labelledby="trust-heading"
          className="rounded-2xl border border-line-soft bg-surface-1 p-5 sm:p-8"
        >
          <SectionHeading
            eyebrow="Trust, explained"
            title="Verification labels that say what was actually checked"
            description="Identity, property authorization, and visit availability are separate checks. We show each one on its own, with the date it was last confirmed."
            action={
              <Button asChild variant="secondary" size="sm">
                <Link href="/how-it-works#verification">
                  How verification works
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            }
          />
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {trustPoints.map((point) => {
              const Icon = point.icon;
              return (
                <div
                  key={point.title}
                  className="rounded-xl border border-line-soft bg-surface-2 p-4 shadow-e1"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-ink-900">
                    {point.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-500">
                    {point.description}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="mt-4 flex items-start gap-2 rounded-xl border border-warning-100 bg-warning-50 px-4 py-3 text-xs leading-relaxed text-warning-700">
            <BadgeCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            MY AGENT does not collect rent or act as an escrow. Always inspect the
            property, confirm the provider&apos;s authority, and pay through
            traceable channels.
          </p>
        </section>

        <section aria-labelledby="how-heading">
          <SectionHeading
            eyebrow="How it works"
            title="From search to keys, in four clear steps"
            description="No hidden fees and no pressure. You control the pace at every stage."
          />
          <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.title}
                  className="relative rounded-xl border border-line-soft bg-surface-2 p-4 shadow-e1"
                >
                  <span className="text-xs font-semibold tabular-nums text-ink-400">
                    0{index + 1}
                  </span>
                  <div className="mt-2 flex size-10 items-center justify-center rounded-xl bg-surface-0 text-brand-700">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-ink-900">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-500">
                    {step.description}
                  </p>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="grid gap-4 lg:grid-cols-2" aria-label="More ways to use MY AGENT">
          <div className="relative overflow-hidden rounded-2xl border border-brand-200 bg-brand-50 p-6 sm:p-8">
            <Sparkles
              className="absolute -right-4 -top-4 size-28 text-brand-200/70"
              aria-hidden="true"
            />
            <div className="relative">
              <div className="flex size-11 items-center justify-center rounded-xl bg-surface-2 text-brand-700 shadow-e1">
                <Users className="size-5" aria-hidden="true" />
              </div>
              <h2 className="mt-4 text-xl font-semibold tracking-tight text-brand-950">
                Not ready to live alone?
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-brand-900/80">
                Create a roommate profile, share your budget and living habits,
                and find people looking around the same campus.
              </p>
              <Button asChild className="mt-5">
                <Link href="/roommates">
                  Find a roommate
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-line-soft bg-surface-2 p-6 shadow-e1 sm:p-8">
            <MapPin
              className="absolute -right-4 -top-4 size-28 text-surface-0"
              aria-hidden="true"
            />
            <div className="relative">
              <div className="flex size-11 items-center justify-center rounded-xl bg-surface-0 text-brand-700">
                <Home className="size-5" aria-hidden="true" />
              </div>
              <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink-900">
                Have a place near campus?
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-500">
                List it with clear costs and accurate availability. Reach
                students who are actively searching, not just browsing.
              </p>
              <Button asChild variant="secondary" className="mt-5">
                <Link href="/list-property">
                  List a property
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
