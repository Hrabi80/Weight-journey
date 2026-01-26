import { z } from "zod";

import type { BMIResult } from "@/lib/bmi";

export const onboardingSchema = z.object({
  age:z.coerce
    .number()
    .int("age do not support months (decimal) in our application please use integer input ")
    .min(10, "Please enter an age between 10 and 120.")
    .max(120, "Please enter an age between 10 and 120."),
  weight: z.coerce
    .number()
    .min(20, "Weight must be at least 20 kg.")
    .max(500, "Weight must be realistic."),
  height: z.coerce
    .number()
    .min(100, "Height must be at least 100 cm.")
    .max(250, "Height must be below 250 cm."),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

// Inputs are whatever zod will accept (strings for the coerced numbers are fine).
export type OnboardingFormInputs = z.input<typeof onboardingSchema>;
// Outputs are the cleaned, typed values we actually want to use.
export type OnboardingFormValues = z.output<typeof onboardingSchema>;

export type OnboardingResult = OnboardingFormValues & { bmiResult: BMIResult };

export type StepId = "age" | "weight" | "height" | "bmi" | "account";