import { z } from "zod";

/**
 * Shared credentials schema used by auth input schemas.
 */
const auth_credentials_schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

/**
 * Input schema for sign-up.
 */
export const signUpSchema = auth_credentials_schema;

/**
 * Input schema for sign-in.
 */
export const signInSchema = auth_credentials_schema;

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
