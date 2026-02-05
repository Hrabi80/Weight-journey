import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { ProfileRepository } from "@/src/domaine/repositories/profile-repository";
import type { Profile } from "@/src/domaine/entities/profile.entity";

export class SupabaseProfileRepository implements ProfileRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async create(input: {
    authUserId: string;
    username: string;
    age: number;
    height: number;
    initialWeight: number;
  }): Promise<Profile> {
    const { data, error } = await this.client
      .from("profiles")
      .insert({
        user_id: input.authUserId,
        username: input.username,
        age: input.age,
        height: input.height,
        initial_weight: input.initialWeight,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to create profile");
    }

    return this.mapRow(data);
  }

  async getByUsername(username: string): Promise<Profile | null> {
    const { data, error } = await this.client
      .from("profiles")
      .select("*")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data ? this.mapRow(data) : null;
  }

  async getByAuthUserId(authUserId: string): Promise<Profile | null> {
    const { data, error } = await this.client
      .from("profiles")
      .select("*")
      .eq("user_id", authUserId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data ? this.mapRow(data) : null;
  }

  private mapRow(row: Database["public"]["Tables"]["profiles"]["Row"]): Profile {
    return {
      id: row.id,
      authUserId: row.user_id,
      username: row.username,
      age: row.age,
      height: row.height,
      initialWeight: row.initial_weight,
      createdAt: row.created_at,
    };
  }
}
