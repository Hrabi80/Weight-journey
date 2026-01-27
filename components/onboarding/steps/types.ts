"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { BMIResult } from "@/lib/bmi";
import type { OnboardingFormInputs } from "../onboarding-schema";

/**
 * Props shared by steps that render form inputs.
 * Keeping this in one place makes steps easy to copy into other projects.
 */
export type StepFormProps = {
  register: UseFormRegister<OnboardingFormInputs>;
  errors: FieldErrors<OnboardingFormInputs>;
};

/**
 * Props shared by steps that have navigation controls.
 */
export type StepNavProps = {
  onNext: () => void;
  onBack?: () => void;
};

/**
 * Props for the BMI step.
 */
export type BmiStepProps = StepNavProps & {
  bmiResult: BMIResult | null;
};
