import { z } from "zod";

const numericOptional = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.coerce.number().nonnegative().optional(),
);

export const searchParamsSchema = z.object({
  q: z.string().trim().max(120).optional(),
  campus: z.string().uuid().optional(),
  neighbourhood: z.string().uuid().optional(),
  type: z
    .enum([
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
    ])
    .optional(),
  min: numericOptional,
  max: numericOptional,
  furnished: z.enum(["yes", "no"]).optional(),
  sort: z.enum(["relevance", "price_asc", "price_desc", "newest"]).default("relevance"),
  page: z.coerce.number().int().min(1).default(1),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;
