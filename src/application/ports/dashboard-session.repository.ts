import type { Profile, WeightEntry } from "@/lib/types";
import type {
  WellnessEntry,
  WellnessMetric,
} from "@/src/domaine/entities/wellness-entry.entity";

export type DashboardSession = {
  profile: Profile;
  entries: WeightEntry[];
  wellnessEntries: WellnessEntry[];
};

export type LogWellnessInput = {
  metric: WellnessMetric;
  value: number;
  date: string;
};

export interface DashboardSessionRepository {
  load(): Promise<DashboardSession | null>;
  log_weight(weight: number, date: string): Promise<WeightEntry>;
  log_wellness(input: LogWellnessInput): Promise<WellnessEntry>;
}
