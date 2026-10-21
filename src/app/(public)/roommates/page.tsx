import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UsersRound } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { SectionHeading } from "@/components/spatial/surface";
import { RoommateCard } from "@/components/roommates/roommate-card";
import { RoommateTabs } from "@/components/roommates/roommate-tabs";
import { getSessionUser } from "@/features/authentication/queries";
import { getRoommateBrowseData } from "@/features/roommates/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Find a roommate",
  description:
    "Practical roommate matching by campus, budget, and living habits — with contact only when you both opt in.",
};

const SHARING_FILTERS = [
  { value: "any", label: "Any arrangement" },
  { value: "own_room_shared_flat", label: "Own room in shared flat" },
  { value: "shared_room", label: "Shared room" },
];

const pill =
  "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors";
const pillIdle = "border-line bg-surface-2 text-ink-600 hover:bg-surface-1";
const pillActive = "border-brand-700 bg-brand-700 text-white";

function buildHref(params: { campus?: string; sharing?: string }) {
  const query = new URLSearchParams();
  if (params.campus) query.set("campus", params.campus);
  if (params.sharing && params.sharing !== "any") {
    query.set("sharing", params.sharing);
  }
  const qs = query.toString();
  return qs ? `/roommates?${qs}` : "/roommates";
}

interface RoommatesPageProps {
  searchParams: Promise<{ campus?: string; sharing?: string }>;
}

export default async function RoommatesPage({
  searchParams,
}: RoommatesPageProps) {
  const user = await getSessionUser();

  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent("/roommates")}`);
  }

  const { campus, sharing } = await searchParams;
  const data = await getRoommateBrowseData({ campusId: campus, sharing });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <SectionHeading
        eyebrow="Roommate matching"
        title="Find a roommate"
        description="Match on what matters day to day — budget, campus, and living habits. Both sides opt in before any contact is shared."
        action={
          <Button asChild size="sm" variant="secondary">
            <Link href="/roommates/profile">
              {data.me ? "Edit my profile" : "Create my profile"}
            </Link>
          </Button>
        }
      />

      <div className="mt-5">
        <RoommateTabs active="browse" />
      </div>

      {!data.me && (
        <div className="mt-5">
          <Alert variant="info">
            <span>
              Create your roommate profile to see compatibility scores and send
              interests.{" "}
              <Link
                href="/roommates/profile"
                className="font-medium underline underline-offset-2"
              >
                Set it up
              </Link>
            </span>
          </Alert>
        </div>
      )}

      <div className="mt-5 space-y-2.5">
        <div className="hide-scrollbar flex gap-1.5 overflow-x-auto">
          <Link
            href={buildHref({ sharing })}
            className={cn(pill, !campus ? pillActive : pillIdle)}
          >
            All campuses
          </Link>
          {data.campuses.map((option) => (
            <Link
              key={option.id}
              href={buildHref({ campus: option.id, sharing })}
              className={cn(pill, campus === option.id ? pillActive : pillIdle)}
            >
              {option.name}
            </Link>
          ))}
        </div>

        <div className="hide-scrollbar flex gap-1.5 overflow-x-auto">
          {SHARING_FILTERS.map((filter) => (
            <Link
              key={filter.value}
              href={buildHref({
                campus,
                sharing: filter.value === "any" ? undefined : filter.value,
              })}
              className={cn(
                pill,
                (sharing ?? "any") === filter.value ? pillActive : pillIdle,
              )}
            >
              {filter.label}
            </Link>
          ))}
        </div>
      </div>

      {data.cards.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.cards.map((card) => (
            <RoommateCard key={card.row.id} card={card} />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            icon={<UsersRound className="size-6" aria-hidden="true" />}
            title="No roommate profiles here yet"
            description="Try another campus or sharing filter — profiles appear here as students make theirs visible."
            action={
              <Button asChild variant="secondary">
                <Link href="/roommates/profile">Create your profile</Link>
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}
