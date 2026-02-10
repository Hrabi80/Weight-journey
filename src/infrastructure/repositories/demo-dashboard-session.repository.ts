import demo_json from "@/data/demo.json";
import type {
  DashboardSession,
  DashboardSessionRepository,
  LogWellnessInput,
} from "@/src/application/ports/dashboard-session.repository";
import type { Profile, WeightEntry } from "@/lib/types";
import type {
  WellnessEntry,
  WellnessMetric,
} from "@/src/domaine/entities/wellness-entry.entity";

type DemoSleepRow = { date: string; hours: number };
type DemoCaloriesRow = { date: string; kcal: number };
type DemoStepsRow = { date: string; steps: number };
type DemoWeightRow = { id?: string; weight: number; date: string };

const DEMO_EMAIL = "demo@example.com";

export class DemoDashboardSessionRepository implements DashboardSessionRepository {
  private readonly seed_weight_entries: WeightEntry[];
  private readonly seed_wellness_entries: WellnessEntry[];

  public constructor() {
    this.seed_weight_entries = this.build_seed_weight_entries();
    this.seed_wellness_entries = this.build_seed_wellness_entries();
  }

  public async load(): Promise<DashboardSession | null> {
    return this.create_seed_session();
  }

  public async log_weight(weight: number, date: string): Promise<WeightEntry> {
    return {
      id: this.local_id("weight", date),
      email: DEMO_EMAIL,
      weight: Number(weight.toFixed(1)),
      date,
    };
  }

  public async log_wellness(input: LogWellnessInput): Promise<WellnessEntry> {
    return {
      id: this.local_id(input.metric, input.date),
      email: DEMO_EMAIL,
      metric: input.metric,
      value: input.value,
      date: input.date,
      created_at: new Date().toISOString(),
    };
  }

  public create_seed_session(): DashboardSession {
    const initial_weight = this.seed_weight_entries[0]?.weight ?? 95;
    const profile: Profile = {
      email: DEMO_EMAIL,
      age: 30,
      height: 175,
      initialWeight: initial_weight,
    };

    return {
      profile,
      entries: this.seed_weight_entries.map((entry) => ({ ...entry })),
      wellnessEntries: this.seed_wellness_entries.map((entry) => ({ ...entry })),
    };
  }

  private build_seed_weight_entries(): WeightEntry[] {
    const rows = demo_json.weight as DemoWeightRow[];
    return rows.map((row, index) => ({
      id: row.id ?? `demo-weight-${index}`,
      email: DEMO_EMAIL,
      weight: row.weight,
      date: row.date,
    }));
  }

  private build_seed_wellness_entries(): WellnessEntry[] {
    const sleep_rows = (demo_json.wellness.sleep ?? []) as DemoSleepRow[];
    const calories_rows = (demo_json.wellness.calories ?? []) as DemoCaloriesRow[];
    const steps_rows = (demo_json.wellness.steps ?? []) as DemoStepsRow[];

    return [
      ...this.map_wellness_rows("sleep", sleep_rows, (row) => row.hours),
      ...this.map_wellness_rows("calories", calories_rows, (row) => row.kcal),
      ...this.map_wellness_rows("steps", steps_rows, (row) => row.steps),
    ];
  }

  private map_wellness_rows<T extends { date: string }>(
    metric: WellnessMetric,
    rows: T[],
    value_of: (row: T) => number
  ): WellnessEntry[] {
    return rows.map((row, index) => ({
      id: `demo-${metric}-${index}`,
      email: DEMO_EMAIL,
      metric,
      value: value_of(row),
      date: row.date,
      created_at: `${row.date}T00:00:00.000Z`,
    }));
  }

  private local_id(scope: string, date: string): string {
    return `local-${scope}-${date}-${Date.now()}`;
  }
}
