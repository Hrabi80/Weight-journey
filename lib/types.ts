import { BMIResult } from "./bmi";

export interface Profile {
  height: number;
  age: number;
  initialWeight: number;
}

export interface WeightEntry {
  id: string;
  weight: number;
  recordedAt: string;
}

export interface QuestionnaireData {
  age: number;
  weight: number;
  height: number;
  bmiResult: BMIResult;
}
