import demo_json from "@/data/demo.json";

export type DemoSleepEntry = { date: string; hours: number };
export type DemoCaloriesEntry = { date: string; kcal: number };
export type DemoStepsEntry = { date: string; steps: number };

export type DemoWellness = {
  sleep: DemoSleepEntry[];
  calories: DemoCaloriesEntry[];
  steps: DemoStepsEntry[];
};

/**
 * note:
 * Keep a tiny adapter layer between raw JSON and the app.
 * If the JSON shape changes later, only this file should need edits.
 */
export const demoWellness: DemoWellness = demo_json.wellness;
