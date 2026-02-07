import { ProfileRepository, UpdateProfilePatch } from "@/src/application/ports/profile.repository";
import { Profile } from "@/src/domaine/entities/profile.entity";
import { EmptyProfileUpdateError, ProfileNotFoundForAuthUserError, UsernameAlreadyExistsError } from "@/src/application/errors/profile.errors";
import { UpdateProfileInput, updateProfileSchema } from "@/src/application/validations/profile.schema";




/**
 * UpdateProfileUseCase
 *
 * Responsibilities:
 * - validate input
 * - ensure the profile exists for the auth user
 * - enforce business rules on changes:
 *   - if username changes, it must remain unique
 * - apply the patch via the repository
 */
export class UpdateProfileUseCase {
  private readonly profileRepo: ProfileRepository;

  public constructor(profileRepo: ProfileRepository) {
    this.profileRepo = profileRepo;
  }

  /**
   * @param input - Update payload.
   * @returns Updated profile.
   * @throws {z.ZodError} If validation fails.
   * @throws {EmptyProfileUpdateError} If no updatable fields are provided.
   * @throws {ProfileNotFoundForAuthUserError} If profile does not exist.
   * @throws {UsernameAlreadyExistsError} If new username is taken.
   */
  public async execute(input: UpdateProfileInput): Promise<Profile> {
    const validated = updateProfileSchema.parse(input);

    // 1) Load current profile (we need its id + current username).
    const currentProfile = await this.profileRepo.find_by_auth_user_id(validated.authUserId);
    if (!currentProfile) {
      throw new ProfileNotFoundForAuthUserError(validated.authUserId);
    }

    // 2) Build patch (only allowed fields).
    const patch: UpdateProfilePatch = {};

    if (typeof validated.age === "number") {
      patch.age = validated.age;
    }

    if (typeof validated.height === "number") {
      patch.height = validated.height;
    }

    if (typeof validated.initialWeight === "number") {
      patch.initial_weight = validated.initialWeight;
    }

    if (typeof validated.username === "string") {
      // Normalize username so uniqueness behaves consistently.
      const normalizedUsername = validated.username.toLowerCase();

      // Only check uniqueness if the username actually changes.
      if (normalizedUsername !== currentProfile.username) {
        const existing = await this.profileRepo.find_by_username(normalizedUsername);

        // If another profile has it, reject.
        if (existing && existing.id !== currentProfile.id) {
          throw new UsernameAlreadyExistsError(normalizedUsername);
        }
      }

      patch.username = normalizedUsername;
    }

    // 3) Ensure there is something to update.
    if (Object.keys(patch).length === 0) {
      throw new EmptyProfileUpdateError();
    }

    // 4) Persist changes.
    return this.profileRepo.update_by_id(currentProfile.id, patch);
  }
}
