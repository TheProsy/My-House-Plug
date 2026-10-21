import type { Metadata } from "next";
import { SectionHeading } from "@/components/spatial/surface";
import { ProviderPropertyForm } from "@/components/provider/provider-property-form";
import { getCampusOptions } from "@/features/accommodation/queries";

export const metadata: Metadata = {
  title: "New listing",
};

export default async function NewProviderPropertyPage() {
  const campuses = await getCampusOptions();

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Step 1 of 2"
        title="Start a new listing"
        description="Save the basics first. Next you will add units with rent, the full cost sheet, and photos before submitting for review."
      />

      <div className="rounded-2xl border border-line-soft bg-surface-2 p-5 shadow-e1 sm:p-6">
        <ProviderPropertyForm campuses={campuses} mode="create" />
      </div>

      <div className="rounded-2xl border border-line-soft bg-surface-1 p-5 text-sm leading-relaxed text-ink-500">
        <p className="font-medium text-ink-700">What happens after saving?</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Your listing is saved as a private draft.</li>
          <li>Add at least one unit and one photo to submit it for review.</li>
          <li>
            A reviewer checks the listing before it appears in search. You will
            be notified of the outcome.
          </li>
        </ul>
      </div>
    </div>
  );
}
