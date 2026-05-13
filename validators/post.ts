import { z } from "zod";

export const postSchema = z.object({
  caption: z
    .string()
    .max(500, "Caption must be at most 500 characters")
    .optional()
    .nullable(),
});

export type PostFormData = z.infer<typeof postSchema>;
