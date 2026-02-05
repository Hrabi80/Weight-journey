import type { WeightEntry } from "../entities/weight-entry.entity";

export interface WeightRepository {
  list(username: string): Promise<WeightEntry[]>;
  add(input: { username: string; weight: number; date?: string }): Promise<WeightEntry>;
}
