import { z } from "zod";

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers, and underscores only");

export const profileSchema = z.object({
  username: usernameSchema,
  display_name: z.string().max(60).optional().nullable(),
  bio: z.string().max(280).optional().nullable(),
  location: z.string().max(60).optional().nullable(),
});

export const editProfileSchema = profileSchema.omit({ username: true });

export type ProfileFormData = z.infer<typeof profileSchema>;
export type EditProfileFormData = z.infer<typeof editProfileSchema>;
