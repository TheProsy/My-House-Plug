import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, ClipboardCheck, Eye, ShieldCheck } from "lucide-react";
import { ProviderUpgradeForm } from "@/components/provider/provider-upgrade-form";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/spatial/surface";
import { getSessionUser, isProvider } from "@/features/authentication/queries";

export const metadata: Metadata = {
  title: "Become a provider",
  description:
    "Upgrade your My House Plug account to list and manage properties as a landlord or agent.",
};

const benefits = [
  {
    icon: ClipboardCheck,
    title: "Publish with known costs",
    description:
      "Add rent, fees, and deposits so renters can compare honestly.",
  },
  {
    icon: Eye,
    title: "Track real interest",
    description:
      "Manage enquiries, inspections, and availability from one dashboard.",
  },
  {
    icon: ShieldCheck,
    title: "Build trust over time",
    description:
      "Optional verification checks give renters clearer signals.",
  },
];

export default async function BecomeAProviderPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect(
      `/login?redirectTo=${encodeURIComponent("/become-a-provider")}`,
    );
  }

  if (isProvider(user)) {
    redirect("/provider/dashboard");
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="max-w-2xl space-y-3">
        <Badge variant="brand" className="gap-1.5">
          <BadgeCheck className="size-3" aria-hidden="true" />
          Provider onboarding
        </Badge>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
          Start listing with your existing account
        </h1>
        <p className="text-pretty text-base leading-relaxed text-ink-600">
          Keep your renter activity and add provider tools. Listing is free
          during the pilot. You can stop at any time.
        </p>
      </div>

      <section className="mt-8 grid gap-3 sm:grid-cols-3" aria-label="Provider benefits">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <div
              key={benefit.title}
              className="rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1"
            >
              <Icon className="size-5 text-brand-700" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-ink-900">
                {benefit.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-400">
                {benefit.description}
              </p>
            </div>
          );
        })}
      </section>

      <section className="mt-8 rounded-2xl border border-line-soft bg-surface-2 p-5 shadow-e1 sm:p-6">
        <SectionHeading
          eyebrow={`Signed in as ${user.profile.full_name}`}
          title="How will you list?"
          description="Choose the role that matches how you work. You can add both later if needed."
        />
        <div className="mt-5">
          <ProviderUpgradeForm />
        </div>
      </section>

      <p className="mt-6 text-center text-xs text-ink-400">
        Need help?{" "}
        <Link
          href="/support"
          className="font-medium text-ink-600 underline-offset-4 hover:underline"
        >
          Contact support
        </Link>
        .
      </p>
    </div>
  );
}
