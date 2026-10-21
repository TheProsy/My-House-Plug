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

export const roommateProfileSchema = z
  .object({
    displayName: z.string().trim().min(2, "Enter the name you want to show").max(60),
    campusId: z.string().uuid("Select a campus"),
    neighbourhoodId: z.string().uuid().optional().or(z.literal("")),
    budgetMin: z.coerce.number().nonnegative().optional(),
    budgetMax: z.coerce.number().nonnegative().optional(),
    moveInDate: z.string().optional().or(z.literal("")),
    accommodationType: propertyTypeEnum.optional(),
    bio: z.string().trim().max(600).optional().or(z.literal("")),
    isVisible: z.boolean().default(false),
    contactVisibility: z
      .enum(["on_match", "after_request", "private"])
      .default("after_request"),
    sharingArrangement: z
      .enum(["own_room_shared_flat", "shared_room", "any"])
      .default("any"),
    sleepSchedule: z.enum(["early_bird", "night_owl", "flexible"]).optional(),
    cleanliness: z.enum(["tidy", "moderate", "relaxed"]).optional(),
    cooking: z.enum(["often", "sometimes", "rarely"]).optional(),
    studyEnvironment: z.enum(["quiet", "some_noise", "flexible"]).optional(),
    guestPolicy: z.enum(["rarely", "occasionally", "often"]).optional(),
    smoking: z.enum(["no", "outside_only", "yes"]).optional(),
  })
  .refine(
    (data) =>
      data.budgetMin === undefined ||
      data.budgetMax === undefined ||
      data.budgetMin <= data.budgetMax,
    { message: "Minimum budget cannot exceed maximum budget", path: ["budgetMax"] },
  );

export const roommateInterestSchema = z.object({
  toProfile: z.string().uuid(),
  message: z.string().trim().max(400).optional().or(z.literal("")),
});

export type RoommateProfileInput = z.infer<typeof roommateProfileSchema>;
export type RoommateInterestInput = z.infer<typeof roommateInterestSchema>;
