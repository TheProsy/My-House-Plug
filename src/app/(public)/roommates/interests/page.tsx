import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Inbox, Send, UsersRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { SectionHeading } from "@/components/spatial/surface";
import { InterestActions } from "@/components/roommates/interest-actions";
import { RoommateTabs } from "@/components/roommates/roommate-tabs";
import { getSessionUser } from "@/features/authentication/queries";
import {
  getMyRoommateInterests,
  type RoommateInterestInboxRow,
} from "@/features/roommates/queries";
import { ROOMMATE_INTEREST_STATUS_LABELS } from "@/lib/constants";
import { initials, timeAgo } from "@/lib/utils";
import type { RoommateInterestStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "Roommate interests",
};

const STATUS_VARIANTS: Record<
  RoommateInterestStatus,
  "info" | "brand" | "neutral" | "danger"
> = {
  pending: "info",
  accepted: "brand",
  declined: "neutral",
  withdrawn: "neutral",
  blocked: "danger",
};

function InterestCard({ row }: { row: RoommateInterestInboxRow }) {
  return (
    <li className="rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1">
      <div className="flex items-start gap-3">
        <Avatar className="size-10">
          {row.counterpart_avatar_url && (
            <AvatarImage src={row.counterpart_avatar_url} alt="" />
          )}
          <AvatarFallback>
            {initials(row.counterpart_display_name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/roommates/${row.counterpart_profile_id}`}
              className="text-sm font-semibold text-ink-900 hover:text-brand-800"
            >
              {row.counterpart_display_name}
            </Link>
            <Badge variant={STATUS_VARIANTS[row.status]}>
              {ROOMMATE_INTEREST_STATUS_LABELS[row.status]}
            </Badge>
          </div>

          <p className="mt-0.5 text-xs text-ink-500">
            {[row.counterpart_campus_name, row.counterpart_neighbourhood_name]
              .filter(Boolean)
              .join(" · ") || "Campus not set"}{" "}
            · {timeAgo(row.created_at)}
          </p>

          {row.message && (
            <p className="mt-2 whitespace-pre-wrap rounded-xl bg-surface-1 px-3 py-2 text-sm leading-relaxed text-ink-700">
              {row.message}
            </p>
          )}

          {row.status === "accepted" && (
            <div className="mt-2">
              {row.counterpart_phone ? (
                <a
                  href={`tel:${row.counterpart_phone}`}
                  className="text-sm font-medium text-brand-700 hover:text-brand-800"
                >
                  Call {row.counterpart_phone}
                </a>
              ) : (
                <p className="text-xs text-ink-500">
                  They keep their phone private — continue here or share yours
                  from your profile settings.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line-soft pt-3">
        <InterestActions
          interestId={row.interest_id}
          direction={row.direction}
          status={row.status}
        />
        <Button asChild size="sm" variant="link">
          <Link href={`/roommates/${row.counterpart_profile_id}`}>
            View profile
          </Link>
        </Button>
      </div>
    </li>
  );
}

export default async function RoommateInterestsPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect(
      `/login?redirectTo=${encodeURIComponent("/roommates/interests")}`,
    );
  }

  const data = await getMyRoommateInterests();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <SectionHeading
        eyebrow="Roommate matching"
        title="Interests"
        description="Requests you received and sent. Contact details appear only after a match, following each person's contact setting."
        action={
          <Button asChild size="sm" variant="secondary">
            <Link href="/roommates">Browse profiles</Link>
          </Button>
        }
      />

      <div className="mt-5">
        <RoommateTabs active="interests" />
      </div>

      {!data.me ? (
        <div className="mt-6">
          <EmptyState
            icon={<UsersRound className="size-6" aria-hidden="true" />}
            title="Create your roommate profile first"
            description="Interests you receive and send live here. Set up your profile to start matching."
            action={
              <Button asChild>
                <Link href="/roommates/profile">Create my profile</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          <section>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
              <Inbox className="size-4 text-brand-700" aria-hidden="true" />
              Requests to you
            </h2>
            {data.incoming.length > 0 ? (
              <ul className="mt-3 space-y-3">
                {data.incoming.map((row) => (
                  <InterestCard key={row.interest_id} row={row} />
                ))}
              </ul>
            ) : (
              <p className="mt-3 rounded-2xl border border-dashed border-line bg-surface-1 px-4 py-6 text-center text-sm text-ink-500">
                No requests yet. When someone is interested, you decide whether
                to accept.
              </p>
            )}
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
              <Send className="size-4 text-brand-700" aria-hidden="true" />
              Sent by you
            </h2>
            {data.outgoing.length > 0 ? (
              <ul className="mt-3 space-y-3">
                {data.outgoing.map((row) => (
                  <InterestCard key={row.interest_id} row={row} />
                ))}
              </ul>
            ) : (
              <p className="mt-3 rounded-2xl border border-dashed border-line bg-surface-1 px-4 py-6 text-center text-sm text-ink-500">
                You have not sent any interests yet.{" "}
                <Link
                  href="/roommates"
                  className="font-medium text-brand-700 hover:text-brand-800"
                >
                  Browse profiles
                </Link>
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
