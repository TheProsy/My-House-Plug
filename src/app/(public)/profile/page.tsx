import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/spatial/surface";
import { ProfileForm } from "@/app/(public)/profile/profile-form";
import {
  getSessionUser,
  isProvider,
  isStaff,
} from "@/features/authentication/queries";
import { signOutAction } from "@/features/authentication/actions";
import { avatarUrl } from "@/lib/storage";
import { formatDate, initials } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your MY AGENT profile and contact details.",
};

const roleLabels: Record<string, string> = {
  renter: "Renter",
  landlord: "Landlord",
  agent: "Agent",
  verifier: "Verifier",
  moderator: "Moderator",
  admin: "Admin",
};

export default async function ProfilePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent("/profile")}`);
  }

  const profile = user.profile;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <SectionHeading
        eyebrow="Account"
        title="Your profile"
        description="Keep your details current so providers can respond to your enquiries quickly."
        action={
          <Button asChild variant="secondary" size="sm">
            <Link href="/notifications">
              <Bell className="size-4" aria-hidden="true" />
              Notifications
            </Link>
          </Button>
        }
      />

      <section className="mt-6 rounded-2xl border border-line-soft bg-surface-2 p-5 shadow-e1">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar className="size-14">
            {profile.avatar_url && (
              <AvatarImage src={avatarUrl(profile.avatar_url) ?? undefined} alt="" />
            )}
            <AvatarFallback>{initials(profile.full_name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-ink-900">
              {profile.full_name || "Your name"}
            </p>
            <p className="text-sm text-ink-500">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {user.roles.length > 0 ? (
                user.roles.map((role) => (
                  <Badge key={role} variant="brand">
                    {roleLabels[role] ?? role}
                  </Badge>
                ))
              ) : (
                <Badge variant="neutral">Renter</Badge>
              )}
              {isProvider(user) && (
                <Badge variant="neutral">Provider account</Badge>
              )}
              {isStaff(user) && <Badge variant="neutral">Staff</Badge>}
            </div>
          </div>
        </div>
        <p className="mt-4 flex items-center gap-1.5 border-t border-line-soft pt-3 text-xs text-ink-400">
          <CheckCircle2 className="size-3.5 text-brand-600" aria-hidden="true" />
          Member since {formatDate(profile.created_at)}
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-line-soft bg-surface-2 p-5 shadow-e1">
        <h2 className="text-base font-semibold text-ink-900">
          Personal details
        </h2>
        <div className="mt-4">
          <ProfileForm
            defaultValues={{
              fullName: profile.full_name ?? "",
              phone: profile.phone ?? "",
              bio: profile.bio ?? "",
            }}
          />
        </div>
      </section>

      <section className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line-soft bg-surface-1 p-5">
        <div>
          <h2 className="text-sm font-semibold text-ink-900">
            Sign out of this device
          </h2>
          <p className="text-xs text-ink-500">
            You can sign back in any time with your email.
          </p>
        </div>
        <form action={signOutAction}>
          <Button type="submit" variant="secondary">
            Sign out
          </Button>
        </form>
      </section>
    </div>
  );
}
