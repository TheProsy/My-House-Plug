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

export const providerPropertySchema = z.object({
  title: z
    .string()
    .trim()
    .min(8, "Title should be at least 8 characters")
    .max(120, "Keep the title under 120 characters"),
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
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});

export const providerUnitSchema = z.object({
  title: z.string().trim().min(2, "Name this unit").max(80),
  unitType: propertyTypeEnum,
  bedrooms: z.coerce.number().int().min(0).max(20).optional(),
  bathrooms: z.coerce.number().int().min(0).max(20).optional(),
  isShared: z.boolean().default(false),
  rentAmount: z.coerce.number().positive("Enter the rent amount"),
  rentPeriod: z.enum(["per_year", "per_six_months", "per_semester", "per_month"]),
  availableFrom: z.string().optional().or(z.literal("")),
});

export const providerCostSchema = z
  .object({
    label: z.string().trim().min(2, "Give this cost a label").max(80),
    category: z.enum([
      "rent",
      "agency_fee",
      "legal_fee",
      "caution_deposit",
      "service_charge",
      "maintenance",
      "utility",
      "other",
    ]),
    amount: z.coerce.number().nonnegative("Amount cannot be negative").optional(),
    isKnown: z.boolean().default(true),
    isMandatory: z.boolean().default(true),
    isRefundable: z.boolean().default(false),
    recurrence: z.enum(["one_time", "monthly", "quarterly", "annually", "other"]).default("one_time"),
    notes: z.string().trim().max(300).optional().or(z.literal("")),
  })
  .refine((cost) => !cost.isKnown || cost.amount !== undefined, {
    message: "Enter the amount, or mark it as not yet known",
    path: ["amount"],
  });

export type ProviderPropertyInput = z.infer<typeof providerPropertySchema>;
export type ProviderUnitInput = z.infer<typeof providerUnitSchema>;
export type ProviderCostInput = z.infer<typeof providerCostSchema>;
