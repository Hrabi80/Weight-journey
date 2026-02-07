import { ProfileRepository } from "../../ports/profile.repository";
import { ProfileNotFoundForAuthUserError } from "../../errors/profile.errors";
import { Profile } from "@/src/domaine/entities/profile.entity";
import { GetProfileByAuthUserInput, getProfileSchema } from "../../validations/profile.schema";






/**
 * GetProfileByAuthUserUseCase
 *
 * Responsibility:
 * - Load the current user's profile by auth_user_id.
 *
 * Why a use case for a "simple fetch"?
 * - It gives the UI a stable API.
 * - It centralizes error handling (not found) in one place.
 * - It stays independent from Supabase/Next.js.
 */
export class GetProfileByAuthUserUseCase {
  private readonly profileRepo: ProfileRepository;

  public constructor(profileRepo: ProfileRepository) {
    this.profileRepo = profileRepo;
  }

  /**
   * @param input - Auth user identifier.
   * @returns The profile belonging to this auth user.
   * @throws {z.ZodError} If validation fails.
   * @throws {ProfileNotFoundForAuthUserError} If profile does not exist.
   */
  public async execute(input: GetProfileByAuthUserInput): Promise<Profile> {
    const validated = getProfileSchema.parse(input);

    const profile = await this.profileRepo.find_by_auth_user_id(validated.authUserId);
    if (!profile) {
      throw new ProfileNotFoundForAuthUserError(validated.authUserId);
    }

    return profile;
  }
}
