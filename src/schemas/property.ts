import { z } from "zod";

const propertyTypeEnum = z.enum([
  "single_room",
  "shared_room",
  "self_contain",
  "mini_flat",
  "one_bedroom",
  "two_bedroom",
  "three_bedroom",
  "duplex",
  "bungalow",
  "hostel_space",
  "other",
]);

const costCategoryEnum = z.enum([
  "rent",
  "agency_fee",
  "legal_fee",
  "caution_deposit",
  "service_charge",
  "maintenance",
  "utility",
  "other",
]);

const costRecurrenceEnum = z.enum([
  "one_time",
  "monthly",
  "quarterly",
  "annually",
  "other",
]);

export const costSchema = z
  .object({
    label: z.string().trim().min(2, "Give this cost a label").max(80),
    category: costCategoryEnum,
    amount: z.coerce.number().nonnegative("Amount cannot be negative").optional(),
    isKnown: z.boolean().default(true),
    isMandatory: z.boolean().default(true),
    isRefundable: z.boolean().default(false),
    recurrence: costRecurrenceEnum.default("one_time"),
    notes: z.string().trim().max(300).optional().or(z.literal("")),
  })
  .refine((cost) => !cost.isKnown || cost.amount !== undefined, {
    message: "Enter the amount, or mark it as not yet known",
    path: ["amount"],
  });

export const unitSchema = z.object({
  title: z.string().trim().min(2, "Name this unit").max(80),
  unitType: propertyTypeEnum,
  bedrooms: z.coerce.number().int().min(0).max(20).optional(),
  bathrooms: z.coerce.number().int().min(0).max(20).optional(),
  isShared: z.boolean().default(false),
  rentAmount: z.coerce.number().positive("Enter the annual rent"),
  rentPeriod: z.enum(["per_year", "per_six_months", "per_semester", "per_month"]),
  availableFrom: z.string().optional().or(z.literal("")),
});

export const listingSchema = z.object({
  title: z.string().trim().min(8, "Title should be at least 8 characters").max(120),
  description: z
    .string()
    .trim()
    .min(40, "Describe the property in at least 40 characters")
    .max(4000),
  propertyType: propertyTypeEnum,
  campusId: z.string().uuid("Select a campus"),
  neighbourhoodId: z.string().uuid("Select a neighbourhood"),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  furnished: z.enum(["yes", "no", "unspecified"]).default("unspecified"),
  unit: unitSchema,
  costs: z.array(costSchema).min(1, "Add at least the rent and any known fees"),
  amenities: z.array(z.string()).default([]),
});

export const listingReviewSchema = listingSchema
  .omit({ costs: true, unit: true, amenities: true })
  .extend({});

export const availabilityConfirmationSchema = z.object({
  propertyId: z.string().uuid(),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
  stillAvailable: z.literal(true),
});

export type ListingInput = z.infer<typeof listingSchema>;
export type CostInput = z.infer<typeof costSchema>;
export type UnitInput = z.infer<typeof unitSchema>;
