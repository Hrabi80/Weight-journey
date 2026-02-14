import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  CreateProfileInput,
  ProfileRepository,
  UpdateProfilePatch,
} from "@/src/application/ports/profile.repository";
import type { Profile } from "@/src/domaine/entities/profile.entity";

/**
 * We explicitly select only the columns we need.
 * Why?
 * - prevents accidentally returning extra fields
 * - documents the shape we expect from Supabase
 * - keeps payloads smaller
 */
const PROFILE_SELECT_COLUMNS =
  "id, email, auth_user_id, age, height, initial_weight, created_at";

/**
 * Raw row type coming from Supabase.
 *
 * We purposely use `unknown` for each field to force runtime validation.
 * Supabase can return `string | number | null` depending on DB types,
 * query changes, casts, or edge cases.
 *
 * This protects your domain from "silent" bad data.
 */
type RawProfileRow = {
  id: unknown;
  email: unknown;
  auth_user_id: unknown;
  age: unknown;
  height: unknown;
  initial_weight: unknown;
  created_at: unknown;
};

/**
 * SupabaseProfileRepository
 *
 * Infrastructure adapter implementing the `ProfileRepository` port.
 *
 * Key Clean Architecture point:
 * - Application layer depends on the `ProfileRepository` interface (port).
 * - Infrastructure provides this implementation (adapter) using Supabase.
 *
 * We inject the SupabaseClient (dependency injection) instead of creating it
 * inside this class, because:
 * - the Supabase SSR client is request-scoped (cookies/session)
 * - easier to test (mock the client)
 * - avoids hidden dependencies
 */
export class SupabaseProfileRepository implements ProfileRepository {
  private readonly supabase: SupabaseClient;

  /**
   * @param supabase - A request-scoped Supabase client (SSR client in server routes/actions).
   */
  public constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Finds a profile by email.
   *
   * @param email -email you want to search for.
   * @returns The profile if found, otherwise null.
   * @throws {Error} If Supabase returns a query error.
   */
  public async find_by_email(email: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select(PROFILE_SELECT_COLUMNS)
      .eq("email", email)
      .maybeSingle();

    // Query errors: DB permission issues, malformed query, etc.
    if (error) {
      console.error("[SupabaseProfileRepository] find_by_email failed", error);
      throw new Error(`Failed to load profile by email: ${error.message}`);
    }

    // Not found: Supabase returns `data = null` with `maybeSingle()`.
    if (!data) {
      return null;
    }
    // Runtime-validate payload and return a domain-safe Profile.
    return this.map_profile_row(data as RawProfileRow);
  }

  /**
   * Finds a profile by Supabase auth user id.
   *
   * @param auth_user_id - The auth user id (uuid as string).
   * @returns The profile if found, otherwise null.
   * @throws {Error} If Supabase returns a query error.
   */
  public async find_by_auth_user_id(auth_user_id: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select(PROFILE_SELECT_COLUMNS)
      .eq("auth_user_id", auth_user_id)
      .maybeSingle();

    if (error) {
      console.error(
        "[SupabaseProfileRepository] find_by_auth_user_id failed",
        error
      );
      throw new Error(`Failed to load profile by auth user id: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return this.map_profile_row(data as RawProfileRow);
  }

  /**
   * Creates a new profile.
   *
   * IMPORTANT:
   * - The repository accepts persistence-ready data (DB column names),
   *   not the use-case input shape.
   *   Example: `auth_user_id` and `initial_weight` (snake_case).
   *
   * @param data - Persistence DTO (matches Supabase column names).
   * @returns Created profile row as domain Profile.
   * @throws {Error} If insertion fails (permissions, constraints, etc.).
   */
  public async create(data: CreateProfileInput): Promise<Profile> {
    const { data: created, error } = await this.supabase
      .from("profiles")
      .insert(data)
      .select(PROFILE_SELECT_COLUMNS)
      .single();
    console.log("🚀 ~ SupabaseProfileRepository ~ create ~ created:", created)

    if (error) {
      console.error("[SupabaseProfileRepository] create failed", error);
      throw new Error(`Failed to create profile: ${error.message}`);
    }

    return this.map_profile_row(created as RawProfileRow);
  }

  /**
   * Updates a profile by its profile id.
   *
   * @param profile_id - The profile's primary key (uuid string).
   * @param patch - Partial update payload (only fields allowed by the port).
   * @returns Updated profile.
   * @throws {Error} If update fails or row cannot be returned.
   */
  public async update_by_id(
    profile_id: string,
    patch: UpdateProfilePatch
  ): Promise<Profile> {
    const { data: updated, error } = await this.supabase
      .from("profiles")
      .update(patch)
      .eq("id", profile_id)
      .select(PROFILE_SELECT_COLUMNS)
      .single();

    if (error) {
      console.error("[SupabaseProfileRepository] update_by_id failed", error);
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return this.map_profile_row(updated as RawProfileRow);
  }

  /**
   * Maps and validates a raw Supabase row into a domain Profile.
   *
   * This is not a "mapper layer" in the Clean Architecture sense,
   * it's a safety validator that ensures the payload matches what
   * your domain expects (non-empty strings, numeric values).
   *
   * @param raw - Row returned by Supabase.
   * @returns Valid Profile entity.
   * @throws {Error} If any field is missing or invalid.
   */
  private map_profile_row(raw: RawProfileRow): Profile {
    return {
      id: this.require_string(raw.id, "id"),
      email: this.require_string(raw.email, "email"),
      auth_user_id: this.require_string(raw.auth_user_id, "auth_user_id"),
      age: this.require_number(raw.age, "age"),
      height: this.require_number(raw.height, "height"),
      initial_weight: this.require_number(raw.initial_weight, "initial_weight"),
      created_at: this.require_string(raw.created_at, "created_at"),
    };
  }

  /**
   * Ensures a value is a non-empty string.
   *
   * @param value - Any value from DB response.
   * @param field_name - The field name for clear error messages.
   * @returns Non-empty string.
   * @throws {Error} If not a valid string.
   */
  private require_string(value: unknown, field_name: string): string {
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
    throw new Error(`Invalid profile payload: "${field_name}" must be a non-empty string.`);
  }

  /**
   * Ensures a value is numeric.
   *
   * We accept number-like strings as well, because some DB drivers / casts
   * can return numeric types as strings.
   *
   * @param value - Any value from DB response.
   * @param field_name - The field name for clear error messages.
   * @returns A finite number.
   * @throws {Error} If not numeric.
   */
  private require_number(value: unknown, field_name: string): number {
    const normalized = typeof value === "number" ? value : Number(value);

    if (Number.isFinite(normalized)) {
      return normalized;
    }

    throw new Error(`Invalid profile payload: "${field_name}" must be numeric.`);
  }
}
