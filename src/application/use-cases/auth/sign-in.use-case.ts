import type { AuthRepository, AuthUser } from "@/src/application/ports/auth.repository";
import {
  AuthSessionMissingError,
  AuthUnexpectedError,
  InvalidCredentialsError,
} from "@/src/application/errors/auth.errors";
import { signInSchema } from "@/src/application/validations/auth.schema";

/**
 * Use case for email/password authentication.
 */
export class SignInUseCase {
  private readonly auth_repository: AuthRepository;

  /**
   * @param auth_repository - Auth repository port implementation.
   */
  public constructor(auth_repository: AuthRepository) {
    this.auth_repository = auth_repository;
  }

  /**
   * Validates input and authenticates the user.
   *
   * @param input - Untrusted input payload.
   * @returns Authenticated user.
   * @throws {z.ZodError} When input is invalid.
   * @throws {InvalidCredentialsError}
   * @throws {AuthSessionMissingError}
   * @throws {AuthUnexpectedError}
   */
  public async execute(input: unknown): Promise<AuthUser> {
    const validated_input = signInSchema.parse(input);

    try {
      return await this.auth_repository.sign_in(
        validated_input.email,
        validated_input.password
      );
    } catch (error) {
      if (
        error instanceof InvalidCredentialsError ||
        error instanceof AuthSessionMissingError ||
        error instanceof AuthUnexpectedError
      ) {
        throw error;
      }

      throw new AuthUnexpectedError("Unable to complete sign in.");
    }
  }
}
