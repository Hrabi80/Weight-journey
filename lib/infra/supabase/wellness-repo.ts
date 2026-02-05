import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { WellnessRepository } from "@/src/domaine/repositories/wellness-repository";
import type { WellnessEntry, WellnessMetric } from "@/src/domaine/entities/wellness-entry.entity";

export class SupabaseWellnessRepository implements WellnessRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async list(username: string): Promise<WellnessEntry[]> {
    const { data, error } = await this.client
      .from("wellness_entries")
      .select("*")
      .eq("username", username)
      .order("date", { ascending: true });

    if (error) throw new Error(error.message);

    return (data ?? []).map(this.mapRow);
  }

  async upsert(input: { username: string; metric: WellnessMetric; value: number; date: string }): Promise<WellnessEntry> {
    const { data, error } = await this.client
      .from("wellness_entries")
      .upsert(
        {
          username: input.username,
          metric: input.metric,
          value: input.value,
          date: input.date,
        },
        { onConflict: "username,metric,date" },
      )
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to upsert wellness entry");
    }

    return this.mapRow(data);
  }

  private mapRow = (row: Database["public"]["Tables"]["wellness_entries"]["Row"]): WellnessEntry => ({
    id: row.id,
    username: row.username,
    metric: row.metric,
    value: row.value,
    date: row.date,
    createdAt: row.created_at,
  });
}
