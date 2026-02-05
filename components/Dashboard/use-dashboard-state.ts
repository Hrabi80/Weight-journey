import { DemoWellness } from "@/lib/demo-data";
import { Profile, WeightEntry } from "@/lib/types";
import { CaloriesEntry, SleepEntry, StepsEntry } from "../Charts/wellness-metrics-chart";
import { calculateBMI } from "@/lib/bmi";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "@/components/session-context";
import type { WellnessEntry } from "@/src/domaine/entities/wellness-entry.entity";
export type DashboardStatus = { type: "info" | "error"; text: string } | null;

interface UseDashboardStateParams {
  profile: Profile;
  entries: WeightEntry[];
  demoMode: boolean;
  demoWellness?: DemoWellness;
  wellnessEntries?: WellnessEntry[];
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

  add_weight: () => Promise<void>;
  log_sleep: (start: string, end: string) => Promise<void>;
  log_calories: (value: number) => Promise<void>;
  log_steps: (value: number) => Promise<void>;
}
export function useDashboardState(params: UseDashboardStateParams): UseDashboardStateReturn {
  const { profile, entries, demoMode, demoWellness, wellnessEntries } = params;
  const { addWeight, logWellness } = useSession();

  const [weights, setWeights] = useState<WeightEntry[]>(entries);
  const [newWeight, setNewWeight] = useState("");
  const [status, setStatus] = useState<{ type: "info" | "error"; text: string } | null>(null);

  const mapWellness = (source?: WellnessEntry[]) => {
    const sleep: SleepEntry[] = [];
    const calories: CaloriesEntry[] = [];
    const steps: StepsEntry[] = [];
    (source ?? []).forEach((item) => {
      if (item.metric === "sleep") sleep.push({ date: item.date, hours: item.value });
      if (item.metric === "calories") calories.push({ date: item.date, kcal: item.value });
      if (item.metric === "steps") steps.push({ date: item.date, steps: item.value });
    });
    return { sleep, calories, steps };
  };

  const initialWellness = demoMode ? demoWellness : mapWellness(wellnessEntries);

  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>(initialWellness?.sleep ?? []);
  const [caloriesEntries, setCaloriesEntries] = useState<CaloriesEntry[]>(initialWellness?.calories ?? []);
  const [stepsEntries, setStepsEntries] = useState<StepsEntry[]>(initialWellness?.steps ?? []);

  useEffect(() => {
    setWeights(entries);
  }, [entries]);

  useEffect(() => {
    if (demoMode) {
      setSleepEntries(demoWellness?.sleep ?? []);
      setCaloriesEntries(demoWellness?.calories ?? []);
      setStepsEntries(demoWellness?.steps ?? []);
    } else if (wellnessEntries) {
      const mapped = mapWellness(wellnessEntries);
      setSleepEntries(mapped.sleep);
      setCaloriesEntries(mapped.calories);
      setStepsEntries(mapped.steps);
    }
  }, [demoMode, demoWellness, wellnessEntries]);

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
  const add_weight = async () => {
    const parsed = parseFloat(newWeight);
    if (!Number.isFinite(parsed) || parsed < 20 || parsed > 500) {
      setStatus({ type: "error", text: "Enter a weight between 20 and 500 kg." });
      return;
    }

    const today = todayKey();
    const existingIndex = weights.findIndex((entry) => entry.date === today);

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
          date: today,
        },
      ]);
    }

    try {
      await addWeight(parsed);
      setStatus({ type: "info", text: `${parsed.toFixed(1)} kg logged for today.` });
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Could not save weight.",
      });
    } finally {
      setNewWeight("");
    }
  };

  const log_sleep = async (start: string, end: string) => {
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
    await logWellness("sleep", diffHours, today);
  };
  const log_calories = async (value: number): Promise<void> => {
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
    await logWellness("calories", value, today);
  };

  const log_steps = async (value: number): Promise<void> => {
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
    await logWellness("steps", value, today);
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
