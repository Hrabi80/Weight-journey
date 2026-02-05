import type { WellnessEntry, WellnessMetric } from "../entities/wellness-entry.entity";

export interface WellnessRepository {
  list(username: string): Promise<WellnessEntry[]>;
  upsert(input: { username: string; metric: WellnessMetric; value: number; date: string }): Promise<WellnessEntry>;
}
