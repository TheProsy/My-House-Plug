import { Badge } from "@/components/ui/badge";
import { LISTING_STATUS_LABELS } from "@/lib/constants";
import type { ListingStatus } from "@/types/database";

const variantMap: Record<
  ListingStatus,
  "neutral" | "brand" | "warning" | "danger" | "info"
> = {
  draft: "neutral",
  pending_review: "info",
  changes_requested: "warning",
  published: "brand",
  paused: "warning",
  rented: "neutral",
  archived: "neutral",
  suspended: "danger",
  rejected: "danger",
};

export function ListingStatusBadge({ status }: { status: ListingStatus }) {
  return (
    <Badge variant={variantMap[status]}>
      {LISTING_STATUS_LABELS[status]}
    </Badge>
  );
}
