import { BMIResult } from "./bmi";

export interface Profile {
  email: string;
  height: number;
  age: number;
  initialWeight: number;
}

export interface WeightEntry {
  id: string;
  weight: number;
  date: string; // YYYY-MM-DD
  email?: string;
}

export interface QuestionnaireData {
  age: number;
  weight: number;
  height: number;
  bmiResult: BMIResult;
  email: string;
  password?: string;
}
