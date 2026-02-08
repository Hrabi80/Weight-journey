import { Profile } from "@/src/domaine/entities/profile.entity";

/**
 * Data required to create a Profile.
 * The database is responsible for generating id and created_at.
 */
export type CreateProfileInput = Omit<Profile, "id" | "created_at">;
/**
 * Fields allowed to be updated.
 */
export type UpdateProfilePatch = Partial<
  Pick<Profile, "email" | "age" | "height" | "initial_weight">
>;
export interface ProfileRepository {
    /**
   * Finds a profile by its unique email.
   *
   * Use cases need this to:
   * - enforce email uniqueness on signup
   * - load profile data by email
   *
   * @param email - Unique email chosen by the user.
   * @returns The profile if found, otherwise null.
   */
    find_by_email(email: string): Promise<Profile | null>;

    /**
   * Finds a profile by the auth provider user id.
   *
   * Use cases need this to:
   * - ensure a logged-in auth user has at most one profile
   * - load the current user's profile
   *
   * @param auth_user_id - User id from Supabase Auth (auth.users).
   * @returns The profile if found, otherwise null.
   */
  find_by_auth_user_id(auth_user_id: string): Promise<Profile | null>;
  /**
   * Creates a new profile record.
   *
   * @param input - Profile creation fields.
   * @returns The newly created profile with generated fields filled.
   */
  create(input: CreateProfileInput): Promise<Profile>;

  /**
   * Updates a profile by its id.
   *
   * @param profile_id - Profile identifier.
   * @param patch - Fields to update.
   * @returns The updated profile.
   */
  update_by_id(profile_id: string, patch: UpdateProfilePatch): Promise<Profile>;
}