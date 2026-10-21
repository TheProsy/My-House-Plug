import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { SectionHeading } from "@/components/spatial/surface";
import { ReportForm } from "@/components/reports/report-form";
import { getSessionUser } from "@/features/authentication/queries";
import { getReportableProperty } from "@/features/reports/queries";

export const metadata: Metadata = {
  title: "Report a listing",
  description:
    "Report a suspicious, misleading, or unsafe listing to the MY AGENT trust and safety team.",
};

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ property?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawSlug = params.property;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;

  const user = await getSessionUser();

  if (!user) {
    const target = slug
      ? `/report?property=${encodeURIComponent(slug)}`
      : "/report";
    redirect(`/login?redirectTo=${encodeURIComponent(target)}`);
  }

  const property = slug ? await getReportableProperty(slug) : null;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <SectionHeading
        eyebrow="Trust and safety"
        title="Report a listing"
        description="Flag scams, misleading prices, or unsafe behaviour. Reports are private and reviewed by our moderation team."
      />

      <div className="mt-6">
        {property ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
                Reporting
              </p>
              <Link
                href={`/properties/${property.slug}`}
                className="mt-1 block text-sm font-semibold text-ink-900 underline-offset-4 hover:underline"
              >
                {property.title}
              </Link>
            </div>
            <ReportForm
              targetId={property.id}
              propertyTitle={property.title}
              propertySlug={property.slug}
            />
          </div>
        ) : (
          <EmptyState
            icon={<ShieldAlert className="size-6" aria-hidden="true" />}
            title={
              slug
                ? "We could not find that listing"
                : "Report from the listing page"
            }
            description={
              slug
                ? "The listing may have been removed or is no longer published. If the problem is urgent, contact support."
                : "Open the listing you are worried about and use the \"Report this listing\" link at the bottom of the page. For anything else, our support team can help."
            }
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button asChild>
                  <Link href="/search">Browse homes</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/support">Contact support</Link>
                </Button>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}
