import { BMIResult } from "./bmi";

export interface Profile {
  username: string;
  height: number;
  age: number;
  initialWeight: number;
}

export interface WeightEntry {
  id: string;
  weight: number;
  date: string; // YYYY-MM-DD
  username?: string;
}

export interface QuestionnaireData {
  username: string;
  age: number;
  weight: number;
  height: number;
  bmiResult: BMIResult;
  email?: string;
  password?: string;
}
