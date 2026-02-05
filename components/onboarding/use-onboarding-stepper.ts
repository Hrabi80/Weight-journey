"use client";

import { UseFormGetValues, UseFormTrigger } from "react-hook-form";
import {
  OnboardingFormInputs,
  onboardingSchema,
  StepId,
} from "./onboarding-schema";
import { BMIResult, calculateBMI } from "@/lib/bmi";
import { useState } from "react";
import { z } from "zod";
/* note for future me in case this hook is used for bigger project add callback for goTo, next , back  */
type StepLike = {
  id: StepId;
  fields: Array<keyof OnboardingFormInputs>;
};

interface UseOnboardingStepperParams<TStep extends StepLike> {
  steps: readonly TStep[];
  trigger: UseFormTrigger<OnboardingFormInputs>;
  getValues: UseFormGetValues<OnboardingFormInputs>;
}

interface UseOnboardingStepperReturn<TStep extends StepLike> {
  currentStepIndex: number;
  currentStep: TStep;
  bmiResult: BMIResult | null;
  canGoBack: boolean;
  canGoNext: boolean;
  next: () => Promise<boolean>;
  back: () => void;
  goTo: (index: number) => void;
}

/**
 * Stepper engine for the onboarding flow.
 * - Enforces per-step validation via RHF `trigger`.
 * - Computes BMI when leaving the height step.
 * - Keeps logic separate from UI so it can be reused.
 */
export function useOnboardingStepper<TStep extends StepLike>(
  params: UseOnboardingStepperParams<TStep>,
): UseOnboardingStepperReturn<TStep> {
  const { steps, trigger, getValues } = params;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [bmiResult, setBmiResult] = useState<BMIResult | null>(null);

  const currentStep = steps[currentStepIndex];
  const canGoBack = currentStepIndex > 0;
  const canGoNext = currentStepIndex < steps.length - 1;

  const computeBmiFromForm = (): BMIResult | null => {
    try {
      const parsed = onboardingSchema
        .pick({ weight: true, height: true })
        .parse(getValues());
      return calculateBMI(parsed.weight, parsed.height);
    } catch (error) {
      if (error instanceof z.ZodError) return null;
      throw error;
    }
  };
  const next = async (): Promise<boolean> => {
    const { fields, id } = currentStep;

    if (fields.length > 0) {
      const ok = await trigger(fields, { shouldFocus: true });
      if (!ok) return false;
    }

    if (id === "height") {
      const computed = computeBmiFromForm();
      if (!computed) return false;
      setBmiResult(computed);
    }

    setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    return true;
  };

  const back = (): void => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const goTo = (index: number): void => {
    const clamped = Math.max(0, Math.min(index, steps.length - 1));
    setCurrentStepIndex(clamped);
  };
  return {
    currentStepIndex,
    currentStep,
    bmiResult,
    canGoBack,
    canGoNext,
    next,
    back,
    goTo,
  };
}
