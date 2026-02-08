export type WellnessMetric = "sleep" | "calories" | "steps";

export type WellnessEntry = {
  id: string;
  email: string;
  metric: WellnessMetric;
  value: number;
  date: string; // YYYY-MM-DD
  created_at: string;
};
