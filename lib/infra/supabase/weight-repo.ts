import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { WeightRepository } from "@/src/domaine/repositories/weight-repository";
import type { WeightEntry } from "@/src/domaine/entities/weight-entry.entity";

export class SupabaseWeightRepository implements WeightRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async list(username: string): Promise<WeightEntry[]> {
    const { data, error } = await this.client
      .from("weight_entries")
      .select("*")
      .eq("username", username)
      .order("recorded_at", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map(this.mapRow);
  }

  async add(input: { username: string; weight: number; date?: string }): Promise<WeightEntry> {
    const iso = input.date ? new Date(input.date).toISOString() : new Date().toISOString();
    const { data, error } = await this.client
      .from("weight_entries")
      .insert({
        username: input.username,
        weight: input.weight,
        recorded_at: iso,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to insert weight entry");
    }

    return this.mapRow(data);
  }

  private mapRow = (row: Database["public"]["Tables"]["weight_entries"]["Row"]): WeightEntry => ({
    id: row.id,
    username: row.username,
    weight: row.weight,
    date: row.recorded_at.split("T")[0],
  });
}
