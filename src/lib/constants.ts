import type {
  CostCategory,
  CostRecurrence,
  InspectionStatus,
  LeadStage,
  ListingStatus,
  PropertyType,
  ReportReason,
  RoommateInterestStatus,
  VerificationStatus,
} from "@/types/database";

export const SITE_NAME = "MY AGENT";
export const SITE_TAGLINE = "Find your place. Know the cost. Move with confidence.";
export const AVAILABILITY_STALE_DAYS = 14;

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  single_room: "Single room",
  shared_room: "Shared room",
  self_contain: "Self-contain",
  mini_flat: "Mini flat",
  one_bedroom: "1-bedroom",
  two_bedroom: "2-bedroom",
  three_bedroom: "3-bedroom",
  duplex: "Duplex",
  bungalow: "Bungalow",
  hostel_space: "Hostel space",
  other: "Other",
};

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  draft: "Draft",
  pending_review: "Pending review",
  changes_requested: "Changes requested",
  published: "Published",
  paused: "Paused",
  rented: "Rented",
  archived: "Archived",
  suspended: "Suspended",
  rejected: "Rejected",
};

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  not_started: "Not started",
  pending_review: "Pending review",
  verified: "Verified",
  more_info_required: "More information required",
  rejected: "Rejected",
  expired: "Expired",
  suspended: "Suspended",
};

export const COST_CATEGORY_LABELS: Record<CostCategory, string> = {
  rent: "Rent",
  agency_fee: "Agency fee",
  legal_fee: "Legal fee",
  caution_deposit: "Caution deposit",
  service_charge: "Service charge",
  maintenance: "Maintenance",
  utility: "Utility",
  other: "Other",
};

export const COST_RECURRENCE_LABELS: Record<CostRecurrence, string> = {
  one_time: "One-time",
  monthly: "Monthly",
  quarterly: "Quarterly",
  annually: "Annually",
  other: "Other",
};

export const LEAD_STAGES: LeadStage[] = [
  "new",
  "contacted",
  "qualified",
  "inspection_scheduled",
  "inspected",
  "negotiation",
  "rented",
  "lost",
];

export const LEAD_STAGE_LABELS: Record<LeadStage, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  inspection_scheduled: "Inspection scheduled",
  inspected: "Inspected",
  negotiation: "Negotiation",
  rented: "Rented",
  lost: "Lost",
};

export const INSPECTION_STATUS_LABELS: Record<InspectionStatus, string> = {
  requested: "Requested",
  confirmed: "Confirmed",
  rescheduled: "Rescheduled",
  declined: "Declined",
  cancelled: "Cancelled",
  completed: "Completed",
  no_show: "No-show",
};

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  suspected_scam: "Suspected scam",
  misleading_price: "Misleading price",
  unauthorized_listing: "Unauthorized listing",
  duplicate_property: "Duplicate property",
  harassment: "Harassment",
  incorrect_availability: "Incorrect availability",
  unsafe_conduct: "Unsafe or discriminatory conduct",
  discrimination: "Discrimination",
  impersonation: "Suspected impersonation",
  other: "Other",
};

export const ROOMMATE_INTEREST_STATUS_LABELS: Record<
  RoommateInterestStatus,
  string
> = {
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
  withdrawn: "Withdrawn",
  blocked: "Blocked",
};

export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;

export const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "newest", label: "Newest" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];
