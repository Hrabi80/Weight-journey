import type { SupabaseClient } from "@supabase/supabase-js";

import type { AuthRepository, AuthUser } from "@/src/application/ports/auth.repository";
import {
  AuthEmailAlreadyInUseError,
  AuthSessionMissingError,
  AuthUnexpectedError,
  InvalidCredentialsError,
} from "@/src/application/errors/auth.errors";

type SupabaseAuthError = {
  message?: string;
  code?: string;
};

/**
 * Supabase adapter implementing the auth repository port.
 *
 * The Supabase client is injected so this adapter stays request-scoped for SSR cookies.
 */
export class SupabaseAuthRepository implements AuthRepository {
  private readonly supabase: SupabaseClient;

  /**
   * @param supabase - Request-scoped Supabase client.
   */
  public constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Registers a user and expects an active session.
   *
   * @param email - Normalized email.
   * @param password - Plain password.
   * @returns Authenticated user data.
   */
  public async sign_up(email: string, password: string): Promise<AuthUser> {
    const { data, error } = await this.supabase.auth.signUp({ email, password });

    if (error) {
      throw this.map_sign_up_error(error);
    }

    if (!data.user || !data.session) {
      throw new AuthSessionMissingError(
        "Sign up succeeded but no active session was returned."
      );
    }

    return this.map_auth_user(data.user.id, data.user.email);
  }

  /**
   * Signs in a user and expects an active session.
   *
   * @param email - Normalized email.
   * @param password - Plain password.
   * @returns Authenticated user data.
   */
  public async sign_in(email: string, password: string): Promise<AuthUser> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw this.map_sign_in_error(error);
    }

    if (!data.user || !data.session) {
      throw new AuthSessionMissingError(
        "Sign in succeeded but no active session was returned."
      );
    }

    return this.map_auth_user(data.user.id, data.user.email);
  }

  /**
   * Signs out the current session.
   */
  public async sign_out(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      throw this.map_generic_auth_error(error, "Unable to sign out.");
    }
  }

  /**
   * Reads current authenticated user from SSR cookies/session.
   *
   * @returns Current user or null.
   */
  public async get_current_user(): Promise<AuthUser | null> {
    const { data, error } = await this.supabase.auth.getUser();

    if (error) {
      if (this.is_session_missing_error(error)) {
        throw new AuthSessionMissingError();
      }

      throw this.map_generic_auth_error(error, "Unable to load current user.");
    }

    if (!data.user) {
      return null;
    }

    return this.map_auth_user(data.user.id, data.user.email);
  }

  /**
   * Maps Supabase sign-up failures into application errors.
   *
   * @param error - Supabase auth error.
   * @returns Application error.
   */
  private map_sign_up_error(error: SupabaseAuthError): Error {
    if (this.is_email_already_in_use_error(error)) {
      return new AuthEmailAlreadyInUseError();
    }

    if (this.is_session_missing_error(error)) {
      return new AuthSessionMissingError();
    }

    return this.map_generic_auth_error(error, "Unable to sign up.");
  }

  /**
   * Maps Supabase sign-in failures into application errors.
   *
   * @param error - Supabase auth error.
   * @returns Application error.
   */
  private map_sign_in_error(error: SupabaseAuthError): Error {
    if (this.is_invalid_credentials_error(error)) {
      return new InvalidCredentialsError();
    }

    if (this.is_session_missing_error(error)) {
      return new AuthSessionMissingError();
    }

    return this.map_generic_auth_error(error, "Unable to sign in.");
  }

  /**
   * Maps unknown/unmapped auth failures to a safe application error.
   *
   * @param error - Supabase auth error.
   * @param safe_message - Safe user-facing message.
   * @returns Application error.
   */
  private map_generic_auth_error(
    error: SupabaseAuthError,
    safe_message: string
  ): Error {
    if (this.is_session_missing_error(error)) {
      return new AuthSessionMissingError();
    }

    return new AuthUnexpectedError(safe_message);
  }

  /**
   * Converts Supabase user payload into application shape.
   *
   * @param user_id - Supabase user id.
   * @param email - Supabase user email.
   * @returns Normalized auth user.
   */
  private map_auth_user(
    user_id: string,
    email: string | null | undefined
  ): AuthUser {
    const normalized_email = email?.trim().toLowerCase() ?? "";
    if (!user_id || !normalized_email) {
      throw new AuthSessionMissingError("Authenticated user data is incomplete.");
    }

    return {
      user_id,
      email: normalized_email,
    };
  }

  /**
   * Checks if Supabase returned an invalid-credentials error.
   *
   * @param error - Supabase auth error.
   * @returns True when credentials are invalid.
   */
  private is_invalid_credentials_error(error: SupabaseAuthError): boolean {
    const message = error.message?.toLowerCase() ?? "";
    const code = error.code?.toLowerCase() ?? "";

    return (
      code === "invalid_credentials" ||
      message.includes("invalid login credentials")
    );
  }

  /**
   * Checks if Supabase returned an already-registered email error.
   *
   * @param error - Supabase auth error.
   * @returns True when email is already used.
   */
  private is_email_already_in_use_error(error: SupabaseAuthError): boolean {
    const message = error.message?.toLowerCase() ?? "";
    const code = error.code?.toLowerCase() ?? "";

    return (
      code === "user_already_exists" ||
      code === "email_exists" ||
      message.includes("already registered") ||
      message.includes("already exists")
    );
  }

  /**
   * Checks whether Supabase is reporting a missing auth session.
   *
   * @param error - Supabase auth error.
   * @returns True when session is missing.
   */
  private is_session_missing_error(error: SupabaseAuthError): boolean {
    const message = error.message?.toLowerCase() ?? "";
    const code = error.code?.toLowerCase() ?? "";

    return (
      code === "session_not_found" ||
      message.includes("auth session missing") ||
      message.includes("session missing")
    );
  }
}
