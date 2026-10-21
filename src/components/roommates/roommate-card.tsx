import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  SHARING_ARRANGEMENT_OPTIONS,
  choiceLabel,
} from "@/features/roommates/options";
import type { RoommateCardData } from "@/features/roommates/queries";
import { formatDate, formatNaira, initials } from "@/lib/utils";

function budgetLabel(min: number | null, max: number | null): string {
  if (min === null && max === null) return "Budget not set";
  if (min !== null && max !== null) return `${formatNaira(min)} – ${formatNaira(max)}`;
  return min !== null ? `From ${formatNaira(min)}` : `Up to ${formatNaira(max)}`;
}

export function RoommateCard({ card }: { card: RoommateCardData }) {
  const { row, compatibility } = card;

  return (
    <Link
      href={`/roommates/${row.id}`}
      className="block rounded-2xl border border-line-soft bg-surface-2 p-4 shadow-e1 transition-shadow hover:shadow-e3"
    >
      <div className="flex items-start gap-3">
        <Avatar className="size-11">
          {row.avatar_url && <AvatarImage src={row.avatar_url} alt="" />}
          <AvatarFallback>{initials(row.display_name)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-semibold text-ink-900">
              {row.display_name}
            </p>
            {row.identity_verified && (
              <>
                <BadgeCheck
                  className="size-4 shrink-0 text-brand-700"
                  aria-hidden="true"
                />
                <span className="sr-only">Identity verified</span>
              </>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-ink-500">
            {[row.campus_name, row.neighbourhood_name]
              .filter(Boolean)
              .join(" · ") || "Campus not set"}
          </p>
        </div>

        {compatibility !== null && (
          <Badge
            variant={
              compatibility >= 75
                ? "brand"
                : compatibility >= 50
                  ? "info"
                  : "neutral"
            }
          >
            {compatibility}% match
          </Badge>
        )}
      </div>

      {row.bio && (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-600">
          {row.bio}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
        <span>{budgetLabel(row.budget_min, row.budget_max)}</span>
        {row.sharing_arrangement && (
          <span>
            {choiceLabel(
              SHARING_ARRANGEMENT_OPTIONS,
              row.sharing_arrangement,
            )}
          </span>
        )}
        {row.move_in_date && <span>Moves in {formatDate(row.move_in_date)}</span>}
      </div>
    </Link>
  );
}
