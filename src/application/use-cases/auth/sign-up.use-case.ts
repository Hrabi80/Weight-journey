import type { AuthRepository, AuthUser } from "@/src/application/ports/auth.repository";
import {
  AuthEmailAlreadyInUseError,
  AuthSessionMissingError,
  AuthUnexpectedError,
} from "@/src/application/errors/auth.errors";
import { signUpSchema } from "@/src/application/validations/auth.schema";

/**
 * Use case for account registration with email/password.
 */
export class SignUpUseCase {
  private readonly auth_repository: AuthRepository;

  /**
   * @param auth_repository - Auth repository port implementation.
   */
  public constructor(auth_repository: AuthRepository) {
    this.auth_repository = auth_repository;
  }

  /**
   * Validates input and registers the user.
   *
   * @param input - Untrusted input payload.
   * @returns Created/authenticated user.
   * @throws {z.ZodError} When input is invalid.
   * @throws {AuthEmailAlreadyInUseError}
   * @throws {AuthSessionMissingError}
   * @throws {AuthUnexpectedError}
   */
  public async execute(input: unknown): Promise<AuthUser> {
    const validated_input = signUpSchema.parse(input);

    try {
      return await this.auth_repository.sign_up(
        validated_input.email,
        validated_input.password
      );
    } catch (error) {
      if (
        error instanceof AuthEmailAlreadyInUseError ||
        error instanceof AuthSessionMissingError ||
        error instanceof AuthUnexpectedError
      ) {
        throw error;
      }

      throw new AuthUnexpectedError("Unable to complete sign up.");
    }
  }
}
