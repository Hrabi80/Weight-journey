import type { AuthRepository } from "@/src/application/ports/auth.repository";
import {
  AuthSessionMissingError,
  AuthUnexpectedError,
} from "@/src/application/errors/auth.errors";

/**
 * Use case for ending the current auth session.
 */
export class SignOutUseCase {
  private readonly auth_repository: AuthRepository;

  /**
   * @param auth_repository - Auth repository port implementation.
   */
  public constructor(auth_repository: AuthRepository) {
    this.auth_repository = auth_repository;
  }

  /**
   * Ends the current session.
   *
   * @throws {AuthSessionMissingError}
   * @throws {AuthUnexpectedError}
   */
  public async execute(): Promise<void> {
    try {
      await this.auth_repository.sign_out();
    } catch (error) {
      if (
        error instanceof AuthSessionMissingError ||
        error instanceof AuthUnexpectedError
      ) {
        throw error;
      }

      throw new AuthUnexpectedError("Unable to complete sign out.");
    }
  }
}
