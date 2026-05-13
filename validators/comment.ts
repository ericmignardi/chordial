import { z } from "zod";

export const commentSchema = z.object({
  body: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(500, "Comment must be at most 500 characters"),
});

export type CommentFormData = z.infer<typeof commentSchema>;
