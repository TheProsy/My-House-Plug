import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Bell,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  Heart,
  Search,
  UserRound,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/spatial/surface";
import {
  getSessionUser,
  isProvider,
  isStaff,
} from "@/features/authentication/queries";
import {
  getEnquiriesForRenter,
  getInspectionsForUser,
} from "@/features/enquiries/queries";
import { getUnreadNotificationCount } from "@/features/notifications/queries";
import { getSavedPropertyIds } from "@/features/saved/queries";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Your dashboard",
  description:
    "Your saved homes, enquiries, inspections, and roommate activity in one place.",
};

const OPEN_INSPECTION_STATUSES = new Set([
  "requested",
  "confirmed",
  "rescheduled",
]);

function isUpcoming(scheduledAt: string): boolean {
  return new Date(scheduledAt).getTime() >= Date.now();
}

export default async function DashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent("/dashboard")}`);
  }

  if (isStaff(user)) redirect("/admin/dashboard");
  if (isProvider(user)) redirect("/provider/dashboard");

  const [savedIds, enquiries, inspections, unread] = await Promise.all([
    getSavedPropertyIds(),
    getEnquiriesForRenter(user.id),
    getInspectionsForUser(user.id),
    getUnreadNotificationCount(user.id),
  ]);

  const activeEnquiries = enquiries.filter(
    (item) => item.enquiry.status !== "closed",
  );
  const upcomingInspections = inspections.filter(
    (item) =>
      OPEN_INSPECTION_STATUSES.has(item.inspection.status) &&
      isUpcoming(item.inspection.scheduled_at),
  );
  const nextInspection = upcomingInspections[0] ?? null;

  const stats = [
    { label: "Saved homes", value: savedIds.size, icon: Heart },
    {
      label: "Active enquiries",
      value: activeEnquiries.length,
      icon: ClipboardList,
    },
    {
      label: "Upcoming inspections",
      value: upcomingInspections.length,
      icon: CalendarCheck,
    },
    { label: "Unread alerts", value: unread, icon: Bell },
  ];

  const quickLinks = [
    {
      href: "/search",
      title: "Find a home",
      description: "Search transparent listings near your campus.",
      icon: Search,
    },
    {
      href: "/roommates",
      title: "Find a roommate",
      description: "Compare practical compatibility and budgets.",
      icon: Users,
    },
    {
      href: "/enquiries",
      title: "My enquiries",
      description: "Continue conversations with providers.",
      icon: ClipboardList,
    },
    {
      href: "/inspections",
      title: "Inspections",
      description: "Track requested and confirmed visits.",
      icon: CalendarCheck,
    },
    {
      href: "/saved",
      title: "Saved homes",
      description: "Your shortlist, ready to compare.",
      icon: Heart,
    },
    {
      href: "/profile",
      title: "Profile",
      description: "Keep your details and contact preferences current.",
      icon: UserRound,
    },
  ];

  const firstName = user.profile.full_name.split(" ")[0] || "there";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <SectionHeading
        eyebrow="Your workspace"
        title={`Welcome back, ${firstName}`}
        description="Everything you are tracking as you search, inspect, and settle in."
        action={
          <Button asChild variant="secondary" size="sm">
            <Link href="/search">Find a home</Link>
          </Button>
        }
      />

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-ink-400">
                  {stat.label}
                </span>
                <Icon className="size-4 text-ink-400" aria-hidden="true" />
              </div>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-ink-900">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {nextInspection && (
        <section className="mt-6 rounded-2xl border border-brand-200 bg-brand-50 p-5">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-800">
            <CalendarDays className="size-4" aria-hidden="true" />
            Next inspection
          </p>
          <p className="mt-2 text-sm font-medium text-ink-900">
            {nextInspection.property?.title ?? "Property"}
          </p>
          <p className="text-sm text-ink-500">
            {formatDateTime(nextInspection.inspection.scheduled_at)} ·{" "}
            {nextInspection.inspection.status.replaceAll("_", " ")}
          </p>
          <Link
            href="/inspections"
            className="mt-2 inline-block text-sm font-medium text-brand-800 underline-offset-4 hover:underline"
          >
            View inspection details
          </Link>
        </section>
      )}

      <section className="mt-8" aria-labelledby="quick-links-heading">
        <h2
          id="quick-links-heading"
          className="text-sm font-semibold uppercase tracking-wide text-ink-400"
        >
          Quick links
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
              >
                <div className="flex size-9 items-center justify-center rounded-xl bg-surface-1 text-brand-700 transition-colors group-hover:bg-brand-50">
                  <Icon className="size-4" aria-hidden="true" />
                </div>
                <p className="mt-3 text-sm font-semibold text-ink-900">
                  {link.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-ink-400">
                  {link.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
