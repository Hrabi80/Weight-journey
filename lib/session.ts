import { calculateBMI } from "./bmi";
import { demoWeight } from "./demo-data";
import { Profile, QuestionnaireData, WeightEntry } from "./types";

export const FALLBACK_QUESTIONNAIRE: QuestionnaireData = {
  username: "user",
  age: 30,
  weight: 82,
  height: 170,
  bmiResult: calculateBMI(82, 170),
};

export const generateDemoData = (): { profile: Profile; entries: WeightEntry[] } => {
  const entries = demoWeight;
  const initialWeight = entries[0]?.weight ?? 95;

  return {
    profile: { username: "demo-user", height: 175, age: 30, initialWeight },
    entries,
  };
};

export const buildUserSession = (
  data: QuestionnaireData,
): { profile: Profile; entries: WeightEntry[] } => {
  const today = new Date();
  const entries: WeightEntry[] = [];
  let weight = data.weight;

  for (let i = 14; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Gentle downward trend with small daily noise.
    weight = weight - Math.random() * 0.25 + Math.random() * 0.1;
    entries.push({
      id: `user-${i}`,
      weight: parseFloat(weight.toFixed(1)),
      date: date.toISOString().split("T")[0],
      username: data.username ?? "user",
    });
  }

  return {
    profile: {
      username: data.username ?? "user",
      height: data.height,
      age: data.age,
      initialWeight: data.weight,
    },
    entries,
  };
};
