import type { AuthRepository, AuthUser } from "@/src/application/ports/auth.repository";
import {
  AuthSessionMissingError,
  AuthUnexpectedError,
} from "@/src/application/errors/auth.errors";

/**
 * Use case to read the current authenticated user for the request.
 */
export class GetCurrentUserUseCase {
  private readonly auth_repository: AuthRepository;

  /**
   * @param auth_repository - Auth repository port implementation.
   */
  public constructor(auth_repository: AuthRepository) {
    this.auth_repository = auth_repository;
  }

  /**
   * Returns the current user or null when unauthenticated.
   *
   * @returns Current user or null.
   * @throws {AuthUnexpectedError}
   */
  public async execute(): Promise<AuthUser | null> {
    try {
      return await this.auth_repository.get_current_user();
    } catch (error) {
      if (error instanceof AuthSessionMissingError) {
        return null;
      }

      if (error instanceof AuthUnexpectedError) {
        throw error;
      }

      throw new AuthUnexpectedError("Unable to load current user.");
    }
  }
}
