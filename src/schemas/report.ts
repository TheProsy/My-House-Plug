import { z } from "zod";

export const reportSchema = z.object({
  targetType: z.enum(["listing", "user", "message", "enquiry"]),
  targetId: z.string().uuid(),
  reason: z.enum([
    "suspected_scam",
    "misleading_price",
    "unauthorized_listing",
    "duplicate_property",
    "harassment",
    "incorrect_availability",
    "unsafe_conduct",
    "discrimination",
    "impersonation",
    "other",
  ]),
  details: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type ReportInput = z.infer<typeof reportSchema>;
