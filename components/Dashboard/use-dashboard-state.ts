import { DemoWellness } from "@/lib/demo-data";
import { Profile, WeightEntry } from "@/lib/types";
import { CaloriesEntry, SleepEntry, StepsEntry } from "../Charts/wellness-metrics-chart";
import { calculateBMI } from "@/lib/bmi";
import { useMemo, useState } from "react";
export type DashboardStatus = { type: "info" | "error"; text: string } | null;

interface UseDashboardStateParams {
  profile: Profile;
  entries: WeightEntry[];
  demoMode: boolean;
  demoWellness?: DemoWellness;
}
interface UseDashboardStateReturn {
  weights: WeightEntry[];
  newWeight: string;
  status: DashboardStatus;

  sleepEntries: SleepEntry[];
  caloriesEntries: CaloriesEntry[];
  stepsEntries: StepsEntry[];

  latestWeight: number;
  firstWeight: number;
  previousWeight: number | null;
  weightChange: number;
  lastDelta: number | null;
  bmiResult: ReturnType<typeof calculateBMI>;

  set_new_weight: (value: string) => void;

  add_weight: () => void;
  log_sleep: (start: string, end: string) => void;
  log_calories: (value: number) => void;
  log_steps: (value: number) => void;
}
export function useDashboardState(params: UseDashboardStateParams): UseDashboardStateReturn {
    const { profile, entries, demoMode, demoWellness } = params;
     const [weights, setWeights] = useState<WeightEntry[]>(entries);
     const [newWeight, setNewWeight] = useState("");
      const [status, setStatus] = useState<{ type: "info" | "error"; text: string } | null>(null);

      const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>(
        () => (demoMode ? (demoWellness?.sleep ?? []) : []),
      );
      
      const [caloriesEntries, setCaloriesEntries] = useState<CaloriesEntry[]>(
        () => (demoMode ? (demoWellness?.calories ?? []) : []),
      );
      
      const [stepsEntries, setStepsEntries] = useState<StepsEntry[]>(
        () => (demoMode ? (demoWellness?.steps ?? []) : []),
      );

      const latestWeight = useMemo(
          () => weights[weights.length - 1]?.weight ?? profile.initialWeight,
          [weights, profile.initialWeight],
        );
      
        const firstWeight = useMemo(
          () => weights[0]?.weight ?? profile.initialWeight,
          [weights, profile.initialWeight],
        );
      
        const previousWeight = useMemo(
          () => (weights.length > 1 ? weights[weights.length - 2]?.weight : null),
          [weights],
        );

    const weightChange = latestWeight - firstWeight;
  const lastDelta = previousWeight ? latestWeight - previousWeight : null;
  const bmiResult = calculateBMI(latestWeight, profile.height);
  const todayKey = () => new Date().toISOString().split("T")[0];
        const add_weight = () => {
    const parsed = parseFloat(newWeight);
    if (!Number.isFinite(parsed) || parsed < 20 || parsed > 500) {
      setStatus({ type: "error", text: "Enter a weight between 20 and 500 kg." });
      return;
    }

    const today = todayKey();
    const existingIndex = weights.findIndex(
      (entry) => entry.recordedAt.split("T")[0] === today,
    );

    if (existingIndex >= 0) {
      const updated = [...weights];
      updated[existingIndex] = { ...updated[existingIndex], weight: parsed };
      setWeights(updated);
    } else {
      setWeights([
        ...weights,
        {
          id: `local-${Date.now()}`,
          weight: parseFloat(parsed.toFixed(1)),
          recordedAt: new Date().toISOString(),
        },
      ]);
    }

    setNewWeight("");
    setStatus({ type: "info", text: `${parsed.toFixed(1)} kg logged for today.` });
  };

  const log_sleep = (start: string, end: string) => {
    if (!start || !end) throw new Error("Please provide both start and end times.");
    const [sH, sM] = start.split(":").map(Number);
    const [eH, eM] = end.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(sH, sM, 0, 0);
    const endDate = new Date();
    endDate.setHours(eH, eM, 0, 0);
    if (endDate <= startDate) endDate.setDate(endDate.getDate() + 1);
    const diffHours = Math.round(((endDate.getTime() - startDate.getTime()) / 36e5) * 10) / 10;
    const today = todayKey();
    setSleepEntries((prev) => {
      const idx = prev.findIndex((item) => item.date === today);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], hours: diffHours };
        return copy;
      }
      return [...prev, { date: today, hours: diffHours }];
    });
  };
  const log_calories = (value: number): void => {
    const today = todayKey();

    setCaloriesEntries((prev) => {
      const idx = prev.findIndex((item) => item.date === today);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], kcal: value };
        return copy;
      }
      return [...prev, { date: today, kcal: value }];
    });
  };

  const log_steps = (value: number): void => {
    const today = todayKey();

    setStepsEntries((prev) => {
      const idx = prev.findIndex((item) => item.date === today);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], steps: value };
        return copy;
      }
      return [...prev, { date: today, steps: value }];
    });
  };
  return {
    weights,
    newWeight,
    status,

    sleepEntries,
    caloriesEntries,
    stepsEntries,

     latestWeight,
    firstWeight,
     previousWeight,
     weightChange,
    lastDelta,
     bmiResult,

    set_new_weight: setNewWeight,

    add_weight,
    log_sleep,
    log_calories,
    log_steps,
  };
      
}