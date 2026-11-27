import { z } from "zod";
import { BODY_TYPES, TRANSMISSIONS, FUEL_TYPES } from "@/config/classified-enums";

const optionalNullableText = z.string().trim().min(1).max(200).nullable().optional();
const optionalNullableInteger = z.number().int().nonnegative().nullable().optional();

export const smartSearchFiltersSchema = z.object({
  q: optionalNullableText,
  make: optionalNullableText,
  model: optionalNullableText,
  minYear: optionalNullableInteger,
  maxYear: optionalNullableInteger,
  minPrice: optionalNullableInteger,
  maxPrice: optionalNullableInteger,
  bodyType: z.enum(BODY_TYPES).nullable().optional(),
  transmission: z.enum(TRANSMISSIONS).nullable().optional(),
  fuelType: z.enum(FUEL_TYPES).nullable().optional(),
});

export const smartSearchManualFiltersSchema = smartSearchFiltersSchema.partial();

export const aiSearchResponseSchema = z.object({
  reasoning: z.string().describe("Brief explanation of the selected search criteria."),
  filters: smartSearchFiltersSchema,
});

export type AiSearchOutput = z.infer<typeof aiSearchResponseSchema>;
