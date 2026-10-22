import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { SectionHeading } from "@/components/spatial/surface";
import { PropertyCard } from "@/components/property/property-card";
import { getSessionUser } from "@/features/authentication/queries";
import { getSavedListings, getSavedPropertyIds } from "@/features/saved/queries";

export const metadata: Metadata = {
  title: "Saved homes",
  description: "Your shortlist of homes across My House Plug.",
};

export default async function SavedPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent("/saved")}`);
  }

  const [listings, savedIds] = await Promise.all([
    getSavedListings(),
    getSavedPropertyIds(),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <SectionHeading
        eyebrow="Your shortlist"
        title="Saved homes"
        description="Compare the homes you like side by side — costs, verification, and availability freshness included."
        action={
          <Button asChild variant="secondary" size="sm">
            <Link href="/search">Keep searching</Link>
          </Button>
        }
      />

      {listings.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <PropertyCard
              key={listing.id}
              listing={listing}
              saved={savedIds.has(listing.id)}
              isAuthenticated
            />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            icon={<Heart className="size-6" aria-hidden="true" />}
            title="Nothing saved yet"
            description="Tap the heart on any listing to build a shortlist you can compare later."
            action={
              <Button asChild>
                <Link href="/search">Find homes</Link>
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}
