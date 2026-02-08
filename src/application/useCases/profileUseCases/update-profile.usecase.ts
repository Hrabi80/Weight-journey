import { ProfileRepository, UpdateProfilePatch } from "@/src/application/ports/profile.repository";
import { Profile } from "@/src/domaine/entities/profile.entity";
import { EmptyProfileUpdateError, ProfileNotFoundForAuthUserError, EmailAlreadyExistsError } from "@/src/application/errors/profile.errors";
import { UpdateProfileInput, updateProfileSchema } from "@/src/application/validations/profile.schema";




/**
 * UpdateProfileUseCase
 *
 * Responsibilities:
 * - validate input
 * - ensure the profile exists for the auth user
 * - enforce business rules on changes:
 *   - if email changes, it must remain unique
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
   * @throws {EmailAlreadyExistsError} If new email is taken.
   */
  public async execute(input: UpdateProfileInput): Promise<Profile> {
    const validated = updateProfileSchema.parse(input);

    // 1) Load current profile (we need its id + current email).
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

    if (typeof validated.email === "string") {
      // Normalize email so uniqueness behaves consistently.
      const normalizedEmail = validated.email.toLowerCase();

      // Only check uniqueness if the email actually changes.
      if (normalizedEmail !== currentProfile.email) {
        const existing = await this.profileRepo.find_by_email(normalizedEmail);

        // If another profile has it, reject.
        if (existing && existing.id !== currentProfile.id) {
          throw new EmailAlreadyExistsError(normalizedEmail);
        }
      }

      patch.email = normalizedEmail;
    }

    // 3) Ensure there is something to update.
    if (Object.keys(patch).length === 0) {
      throw new EmptyProfileUpdateError();
    }

    // 4) Persist changes.
    return this.profileRepo.update_by_id(currentProfile.id, patch);
  }
}
