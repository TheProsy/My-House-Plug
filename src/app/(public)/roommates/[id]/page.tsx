import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  MapPin,
  Wallet,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CompatibilityPanel } from "@/components/roommates/compatibility-panel";
import { InterestActions } from "@/components/roommates/interest-actions";
import { RoommateInterestForm } from "@/components/roommates/roommate-interest-form";
import { RoommateTabs } from "@/components/roommates/roommate-tabs";
import { getRoommateProfileDetail } from "@/features/roommates/queries";
import {
  CLEANLINESS_OPTIONS,
  COOKING_OPTIONS,
  GUEST_POLICY_OPTIONS,
  SHARING_ARRANGEMENT_OPTIONS,
  SLEEP_SCHEDULE_OPTIONS,
  SMOKING_OPTIONS,
  STUDY_ENVIRONMENT_OPTIONS,
  choiceLabel,
} from "@/features/roommates/options";
import { formatDate, formatNaira, initials } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Roommate profile",
};

function budgetLabel(min: number | null, max: number | null): string {
  if (min === null && max === null) return "Budget not set";
  if (min !== null && max !== null) return `${formatNaira(min)} – ${formatNaira(max)}`;
  return min !== null ? `From ${formatNaira(min)}` : `Up to ${formatNaira(max)}`;
}

interface RoommateDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RoommateDetailPage({
  params,
}: RoommateDetailPageProps) {
  const { id } = await params;
  const detail = await getRoommateProfileDetail(id);

  if (!detail) notFound();
  if (detail.isMine) redirect("/roommates/profile");

  const { row, outgoing, incoming } = detail;

  const habits = [
    {
      label: "Sharing arrangement",
      value: choiceLabel(
        SHARING_ARRANGEMENT_OPTIONS,
        row.sharing_arrangement,
      ),
    },
    {
      label: "Sleep schedule",
      value: choiceLabel(SLEEP_SCHEDULE_OPTIONS, row.sleep_schedule),
    },
    {
      label: "Cleanliness",
      value: choiceLabel(CLEANLINESS_OPTIONS, row.cleanliness),
    },
    {
      label: "Cooking",
      value: choiceLabel(COOKING_OPTIONS, row.cooking),
    },
    {
      label: "Study environment",
      value: choiceLabel(STUDY_ENVIRONMENT_OPTIONS, row.study_environment),
    },
    {
      label: "Guests",
      value: choiceLabel(GUEST_POLICY_OPTIONS, row.guest_policy),
    },
    {
      label: "Smoking",
      value: choiceLabel(SMOKING_OPTIONS, row.smoking),
    },
  ].filter((habit) => habit.value !== "Not set");

  const outgoingStatus = outgoing?.status ?? null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href="/roommates"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-brand-800"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to browse
      </Link>

      <div className="mt-4">
        <RoommateTabs active="browse" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="min-w-0 space-y-6">
          <section className="rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1 sm:p-5">
            <div className="flex items-start gap-4">
              <Avatar className="size-14">
                {row.avatar_url && <AvatarImage src={row.avatar_url} alt="" />}
                <AvatarFallback className="text-base">
                  {initials(row.display_name)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold tracking-tight text-ink-900">
                    {row.display_name}
                  </h1>
                  {row.identity_verified && (
                    <Badge variant="brand">
                      <BadgeCheck className="size-3.5" aria-hidden="true" />
                      Identity verified
                    </Badge>
                  )}
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
                  <MapPin className="size-4 shrink-0" aria-hidden="true" />
                  {[row.campus_name, row.neighbourhood_name]
                    .filter(Boolean)
                    .join(" · ") || "Campus not set"}
                </p>
              </div>
            </div>

            {row.bio && (
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink-700">
                {row.bio}
              </p>
            )}

            <div className="mt-4 grid gap-3 border-t border-line-soft pt-4 sm:grid-cols-2">
              <p className="flex items-center gap-2 text-sm text-ink-600">
                <Wallet className="size-4 shrink-0 text-ink-400" aria-hidden="true" />
                {budgetLabel(row.budget_min, row.budget_max)}
              </p>
              {row.move_in_date && (
                <p className="flex items-center gap-2 text-sm text-ink-600">
                  <CalendarClock
                    className="size-4 shrink-0 text-ink-400"
                    aria-hidden="true"
                  />
                  Moves in {formatDate(row.move_in_date)}
                </p>
              )}
            </div>
          </section>

          {habits.length > 0 && (
            <section className="rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1 sm:p-5">
              <h2 className="text-sm font-semibold text-ink-900">
                Living habits
              </h2>
              <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {habits.map((habit) => (
                  <div key={habit.label}>
                    <dt className="text-xs text-ink-400">{habit.label}</dt>
                    <dd className="text-sm font-medium text-ink-800">
                      {habit.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>

        <div className="space-y-6">
          {detail.compatibility ? (
            <CompatibilityPanel result={detail.compatibility} />
          ) : (
            <Alert variant="info">
              <span>
                Create your roommate profile to see compatibility.{" "}
                <Link
                  href="/roommates/profile"
                  className="font-medium underline underline-offset-2"
                >
                  Set it up
                </Link>
              </span>
            </Alert>
          )}

          {detail.compatibility && outgoingStatus === "accepted" && (
            <Alert variant="success">
              <span>
                You are matched!{" "}
                {detail.phone ? (
                  <a
                    href={`tel:${detail.phone}`}
                    className="font-medium underline underline-offset-2"
                  >
                    Call {detail.phone}
                  </a>
                ) : (
                  "They keep their phone private — continue coordinating here."
                )}
              </span>
            </Alert>
          )}

          {detail.compatibility && outgoingStatus === "pending" && outgoing && (
            <div className="space-y-3">
              <Alert variant="info">
                <span>
                  Interest sent — waiting for their response. You&apos;ll get a
                  notification when they decide.
                </span>
              </Alert>
              <InterestActions
                interestId={outgoing.interest_id}
                direction="outgoing"
                status={outgoing.status}
              />
            </div>
          )}

          {detail.compatibility && outgoingStatus === "blocked" && (
            <Alert variant="danger">
              <span>You can no longer send interests to this profile.</span>
            </Alert>
          )}

          {detail.compatibility && incoming?.status === "pending" && (
            <div className="space-y-3 rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1">
              <p className="text-sm font-semibold text-ink-900">
                They sent you an interest
              </p>
              {incoming.message && (
                <p className="whitespace-pre-wrap rounded-xl bg-surface-1 px-3 py-2 text-sm leading-relaxed text-ink-700">
                  {incoming.message}
                </p>
              )}
              <InterestActions
                interestId={incoming.interest_id}
                direction="incoming"
                status={incoming.status}
              />
            </div>
          )}

          {detail.compatibility &&
            incoming?.status !== "pending" &&
            (outgoingStatus === null ||
              outgoingStatus === "declined" ||
              outgoingStatus === "withdrawn") && (
              <RoommateInterestForm toProfileId={row.id} />
            )}
        </div>
      </div>
    </div>
  );
}
