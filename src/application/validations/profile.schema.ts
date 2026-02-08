import { z } from "zod";

/**
 * Zod schema for validating CreateProfile input.
 *
 * We validate here (Application layer) rather than in Domain to keep Domain pure.
 */
export const createProfileSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  authUserId: z.string().min(1, "auth_user_id is required."),
  age: z.number().int().min(10,"This application do not support user with age under 10").max(120,"age must be realistic"),
  height: z.number().positive(),
  initialWeight: z.number().positive().min(35,'Weight must be realistic.').max(220,"Weight must be realistic."),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;

export const getProfileSchema = z.object({
  authUserId: z.string().min(1, "auth_user_id is required."),
});
export type GetProfileByAuthUserInput = z.infer<typeof getProfileSchema>;

/**
 * We validate each optional field.
 * Note: we require auth_user_id, but other fields are optional.
 */
export const updateProfileSchema = z.object({
  authUserId: z.string().min(1, "auth_user_id is required."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").optional(),
  age: z.number().int().min(10).max(120).optional(),
  height: z.number().positive().optional(),
  initialWeight: z.number().positive().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
