import { ProfileRepository } from "../../ports/profile.repository";
import { Profile } from "@/src/domaine/entities/profile.entity";
import { ProfileAlreadyExistsForAuthUserError, EmailAlreadyExistsError } from "../../errors/profile.errors";
import { createProfileSchema, CreateProfileInput } from "../../validations/profile.schema";


/**
 * CreateProfileUseCase
 *
 * Responsibilities:
 * - validate input
 * - enforce business rules:
 *   1) email is unique
 *   2) each auth user can have only one profile
 * - create the profile through the repository (port)
 */
export class CreateProfileUseCase {
  private readonly profileRepo: ProfileRepository;

  /**
   * @param profileRepo - Repository port used to access profile persistence.
   */
  public constructor(profileRepo: ProfileRepository) {
    this.profileRepo = profileRepo;
  }

  /**
   * Executes the use case.
   *
   * @param input - Profile creation data.
   * @returns Created Profile.
   * @throws {z.ZodError} If validation fails.
   * @throws {EmailAlreadyExistsError} If email is taken.
   * @throws {ProfileAlreadyExistsForAuthUserError} If auth user already has a profile.
   */
  public async execute(input: CreateProfileInput): Promise<Profile> {
    const validated = createProfileSchema.parse(input);

    // Example: "Ahmed" and "ahmed" become the same email.
    const normalizedEmail = validated.email.toLowerCase();

    // Rule #1: email must be unique.
    const existingByEmail = await this.profileRepo.find_by_email(normalizedEmail);
    if (existingByEmail) {
      throw new EmailAlreadyExistsError(normalizedEmail);
    }

    // Rule #2: one profile per auth user.
    const existingByAuthUser = await this.profileRepo.find_by_auth_user_id(
      validated.authUserId
    );
    if (existingByAuthUser) {
      throw new ProfileAlreadyExistsForAuthUserError(validated.authUserId);
    }

    // Create via the repository.
    return this.profileRepo.create({
      email: normalizedEmail,
      auth_user_id: validated.authUserId,
      age: validated.age,
      height: validated.height,
      initial_weight: validated.initialWeight,
    });
  }
}
