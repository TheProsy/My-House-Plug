import { z } from "zod";
import { parseLagosDateTime } from "@/lib/utils";

export const enquirySchema = z.object({
  propertyId: z.string().uuid(),
  message: z
    .string()
    .trim()
    .min(15, "Write a short message so the provider can help you")
    .max(1000),
  contactPreference: z.enum(["in_app", "whatsapp", "phone"]).default("in_app"),
});

export const enquiryMessageSchema = z.object({
  enquiryId: z.string().uuid(),
  body: z.string().trim().min(1, "Write a message").max(2000),
});

export const propertyInspectionRequestSchema = z.object({
  propertyId: z.string().uuid(),
  scheduledAt: z
    .string()
    .min(1, "Choose a date and time")
    .refine((value) => parseLagosDateTime(value).getTime() > Date.now(), {
      message: "Choose a time in the future",
    }),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
  contactPreference: z.enum(["in_app", "whatsapp", "phone"]).default("in_app"),
});

export const inspectionRequestSchema = z.object({
  enquiryId: z.string().uuid(),
  scheduledAt: z
    .string()
    .min(1, "Choose a date and time")
    .refine((value) => parseLagosDateTime(value).getTime() > Date.now(), {
      message: "Choose a time in the future",
    }),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const inspectionResponseSchema = z.object({
  inspectionId: z.string().uuid(),
  action: z.enum(["confirm", "reschedule", "decline", "complete", "cancel", "no_show"]),
  scheduledAt: z
    .string()
    .optional()
    .refine(
      (value) => !value || parseLagosDateTime(value).getTime() > Date.now(),
      { message: "Choose a time in the future" },
    ),
  outcome: z
    .enum([
      "positive",
      "negative",
      "property_unavailable",
      "no_show_renter",
      "no_show_provider",
      "unknown",
    ])
    .optional(),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const leadStageSchema = z.object({
  enquiryId: z.string().uuid(),
  stage: z.enum([
    "new",
    "contacted",
    "qualified",
    "inspection_scheduled",
    "inspected",
    "negotiation",
    "rented",
    "lost",
  ]),
  lostReason: z.string().trim().max(300).optional().or(z.literal("")),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
export type EnquiryMessageInput = z.infer<typeof enquiryMessageSchema>;
export type PropertyInspectionRequestInput = z.infer<
  typeof propertyInspectionRequestSchema
>;
export type InspectionRequestInput = z.infer<typeof inspectionRequestSchema>;
export type InspectionResponseInput = z.infer<typeof inspectionResponseSchema>;
export type LeadStageInput = z.infer<typeof leadStageSchema>;
