import { z } from "zod";

export const gearKindSchema = z.enum([
  "guitar",
  "bass",
  "amp",
  "pedal",
  "other",
]);

export const gearSchema = z.object({
  kind: gearKindSchema,
  brand: z.string().min(1, "Brand is required").max(60),
  model: z.string().min(1, "Model is required").max(80),
  year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1)
    .optional()
    .nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export type GearFormData = z.infer<typeof gearSchema>;
export type GearKind = z.infer<typeof gearKindSchema>;
