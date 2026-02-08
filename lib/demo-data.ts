import demo_json from "@/data/demo.json";
import { WeightEntry } from "./types";

export type DemoSleepEntry = { date: string; hours: number };
export type DemoCaloriesEntry = { date: string; kcal: number };
export type DemoStepsEntry = { date: string; steps: number };

export type DemoWellness = {
  sleep: DemoSleepEntry[];
  calories: DemoCaloriesEntry[];
  steps: DemoStepsEntry[];
};

type DemoWeightRaw = { id?: string; weight: number; date: string };

/**
 * note:
 * Keep a tiny adapter layer between raw JSON and the app.
 * If the JSON shape changes later, only this file should need edits.
 */
export const demoWellness: DemoWellness = demo_json.wellness;

export const demoWeight: WeightEntry[] = (demo_json.weight as DemoWeightRaw[]).map((row, idx) => ({
  id: row.id ?? `demo-weight-${idx}`,
  weight: row.weight,
  date: row.date,
  email: "demo@example.com",
}));
