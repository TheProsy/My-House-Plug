import { Badge, type BadgeProps } from "@/components/ui/badge";
import {
  INSPECTION_STATUS_LABELS,
  LEAD_STAGE_LABELS,
} from "@/lib/constants";
import type {
  EnquiryStatus,
  InspectionStatus,
  LeadStage,
} from "@/types/database";

const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  open: "Open",
  responded: "Responded",
  closed: "Closed",
};

const enquiryStatusVariant: Record<EnquiryStatus, BadgeProps["variant"]> = {
  open: "brand",
  responded: "info",
  closed: "neutral",
};

const leadStageVariant: Record<LeadStage, BadgeProps["variant"]> = {
  new: "brand",
  contacted: "info",
  qualified: "info",
  inspection_scheduled: "warning",
  inspected: "warning",
  negotiation: "warning",
  rented: "solid",
  lost: "danger",
};

const inspectionVariant: Record<InspectionStatus, BadgeProps["variant"]> = {
  requested: "warning",
  confirmed: "brand",
  rescheduled: "info",
  declined: "danger",
  cancelled: "neutral",
  completed: "brand",
  no_show: "danger",
};

export function EnquiryStatusBadge({ status }: { status: EnquiryStatus }) {
  return (
    <Badge variant={enquiryStatusVariant[status]}>
      {ENQUIRY_STATUS_LABELS[status]}
    </Badge>
  );
}

export function LeadStageBadge({ stage }: { stage: LeadStage }) {
  return (
    <Badge variant={leadStageVariant[stage]}>{LEAD_STAGE_LABELS[stage]}</Badge>
  );
}

export function InspectionStatusBadge({
  status,
}: {
  status: InspectionStatus;
}) {
  return (
    <Badge variant={inspectionVariant[status]}>
      {INSPECTION_STATUS_LABELS[status]}
    </Badge>
  );
}
