import type {
  CreateProfileInput,
  ProfileRepository,
  UpdateProfilePatch,
} from "@/src/application/ports/profile.repository";
import type { Profile } from "@/src/domaine/entities/profile.entity";
import type { SupabaseClient } from "@supabase/supabase-js";

const PROFILE_SELECT_COLUMNS =
  "id, email, auth_user_id, age, height, initial_weight, created_at";

type RawProfileRow = {
  id: unknown;
  email: unknown;
  auth_user_id: unknown;
  age: unknown;
  height: unknown;
  initial_weight: unknown;
  created_at: unknown;
};

export class SupabaseProfileRepository implements ProfileRepository {
  private readonly supabase: SupabaseClient;

  public constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  public async find_by_email(email: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select(PROFILE_SELECT_COLUMNS)
      .eq("email", email)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load profile by email: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return this.map_profile_row(data as RawProfileRow);
  }

  public async find_by_auth_user_id(auth_user_id: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select(PROFILE_SELECT_COLUMNS)
      .eq("auth_user_id", auth_user_id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load profile by auth user id: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return this.map_profile_row(data as RawProfileRow);
  }

  public async create(input: CreateProfileInput): Promise<Profile> {
    const { data, error } = await this.supabase
      .from("profiles")
      .insert(input)
      .select(PROFILE_SELECT_COLUMNS)
      .single();

    if (error) {
      throw new Error(`Failed to create profile: ${error.message}`);
    }

    return this.map_profile_row(data as RawProfileRow);
  }

  public async update_by_id(profile_id: string, patch: UpdateProfilePatch): Promise<Profile> {
    const { data, error } = await this.supabase
      .from("profiles")
      .update(patch)
      .eq("id", profile_id)
      .select(PROFILE_SELECT_COLUMNS)
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return this.map_profile_row(data as RawProfileRow);
  }

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

  private require_string(value: unknown, field_name: string): string {
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
    throw new Error(`Invalid profile payload: "${field_name}" must be a non-empty string.`);
  }

  private require_number(value: unknown, field_name: string): number {
    const normalized = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(normalized)) {
      return normalized;
    }
    throw new Error(`Invalid profile payload: "${field_name}" must be numeric.`);
  }
}
