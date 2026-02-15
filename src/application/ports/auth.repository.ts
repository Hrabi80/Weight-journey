/**
 * Authenticated user data shared by auth operations.
 */
export type AuthUser = {
  user_id: string;
  email: string;
};

/**
 * Port used by auth use cases.
 *
 * Implementations live in Infrastructure (for example Supabase adapter).
 */
export interface AuthRepository {
  /**
   * Creates a new account and starts a session.
   *
   * @param email - User email.
   * @param password - Plain password.
   * @returns Authenticated user data.
   */
  sign_up(email: string, password: string): Promise<AuthUser>;

  /**
   * Authenticates an existing account.
   *
   * @param email - User email.
   * @param password - Plain password.
   * @returns Authenticated user data.
   */
  sign_in(email: string, password: string): Promise<AuthUser>;

  /**
   * Ends the current session.
   */
  sign_out(): Promise<void>;

  /**
   * Returns the authenticated user for the current request/session.
   *
   * @returns Current user or null when not authenticated.
   */
  get_current_user(): Promise<AuthUser | null>;
}
