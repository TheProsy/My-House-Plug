import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Info } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/spatial/surface";
import { RoommateProfileForm } from "@/components/roommates/roommate-profile-form";
import { RoommateTabs } from "@/components/roommates/roommate-tabs";
import { getCampusOptions } from "@/features/accommodation/queries";
import { getSessionUser } from "@/features/authentication/queries";
import { getMyRoommateProfile } from "@/features/roommates/queries";

export const metadata: Metadata = {
  title: "My roommate profile",
};

export default async function RoommateProfilePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect(
      `/login?redirectTo=${encodeURIComponent("/roommates/profile")}`,
    );
  }

  const [bundle, campuses] = await Promise.all([
    getMyRoommateProfile(),
    getCampusOptions(),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <SectionHeading
        eyebrow="Roommate matching"
        title="My roommate profile"
        description="You choose what is shared — budget, campus area, living habits — and nothing is visible unless you turn visibility on."
        action={
          <Button asChild size="sm" variant="secondary">
            <Link href="/roommates">Browse profiles</Link>
          </Button>
        }
      />

      <div className="mt-5">
        <RoommateTabs active="profile" />
      </div>

      <div className="mt-5">
        <Alert variant="info">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            Your phone number is never shown on this profile page. It only
            appears to someone you match with, following your contact setting
            below.
          </span>
        </Alert>
      </div>

      <div className="mt-6 rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1 sm:p-6">
        <RoommateProfileForm
          campuses={campuses}
          profile={bundle?.profile ?? null}
          preferences={bundle?.preferences ?? null}
        />
      </div>
    </div>
  );
}
