"use client";

import type { ComponentType, SVGProps } from "react";
import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Activity, Calendar, Ruler, Scale, User } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { calculateBMI } from "@/lib/bmi";
import {
  OnboardingFormInputs,
  OnboardingFormValues,
  OnboardingResult,
  onboardingSchema,
  StepId,
} from "./onboarding-schema";
import { useOnboardingStepper } from "./use-onboarding-stepper";
import { AgeStep } from "./steps/ageStep";
import { WeightStep } from "./steps/weightStep";
import { HeightStep } from "./steps/heightStep";
import { BmiStep } from "./steps/bmiStep";
import { AccountStep } from "./steps/accountStep";
import { StepperHeader } from "./ui/stepperHeader";

type StepConfig = {
  id: StepId;
  title: string;
  description: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  fields: (keyof OnboardingFormInputs)[];
  progressIndex: number;
};

interface OnboardingStepperFormProps {
  onComplete?: (data: OnboardingResult) => void | Promise<void>;
}

export function OnboardingStepperForm({
  onComplete,
}: OnboardingStepperFormProps) {
  // Router is only used for optional navigation after submit
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // RHF + zod: strings come in, numbers come out.
  const form = useForm<OnboardingFormInputs, undefined, OnboardingFormValues>({
    // Cast is needed because @hookform/resolvers ships zod v4.0 typings, while this app uses zod v4.3.
    // Runtime behavior is correct; this only widens the type.
    resolver: zodResolver(onboardingSchema) as unknown as Resolver<
      OnboardingFormInputs,
      undefined,
      OnboardingFormValues
    >,
    defaultValues: {
      age: "",
      weight: "",
      height: "",
      email: "",
      password: "",
    },
    mode: "onTouched",
  });

  const { register, handleSubmit, trigger, getValues, formState } = form;

  // Friendly step definitions keep UI in one place
  const steps: StepConfig[] = useMemo(
    () => [
      {
        id: "age",
        title: "How old are you?",
        description: "Your age helps us personalize your journey.",
        Icon: Calendar,
        fields: ["age"],
        progressIndex: 1,
      },
      {
        id: "weight",
        title: "What's your current weight?",
        description: "This is your starting point.",
        Icon: Scale,
        fields: ["weight"],
        progressIndex: 2,
      },
      {
        id: "height",
        title: "What's your height?",
        description: "We need this to calculate your BMI.",
        Icon: Ruler,
        fields: ["height"],
        progressIndex: 3,
      },
      {
        id: "bmi",
        title: "Your BMI result",
        description: "Here's how your numbers stack up.",
        Icon: Activity,
        fields: [],
        progressIndex: 4,
      },
      {
        id: "account",
        title: "Create your account",
        description: "Save your progress to keep tracking.",
        Icon: User,
        fields: ["email", "password"],
        progressIndex: 5,
      },
    ],
    [],
  );

  const stepper = useOnboardingStepper({
    steps,
    trigger,
    getValues: getValues,
  });
  const currentStepConfig = stepper.currentStep;
  const bmiResult = stepper.bmiResult;

  const onSubmit = handleSubmit(async (values: OnboardingFormValues) => {
    // Build the final payload, log it for now, and kick off a soft redirect.
    setSubmitting(true);
    setSubmitError(null);
    const finalBmi =
      stepper.bmiResult ?? calculateBMI(values.weight, values.height);
    const dataToSend: OnboardingResult = { ...values, bmiResult: finalBmi };

    try {
      await onComplete?.(dataToSend);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Signup failed. Please try again.";
      setSubmitError(message);
      setSubmitting(false);
      return;
    }

    // Optional navigation to the dashboard after a short delay.
    setTimeout(() => router.push("/dashboard"), 2000);
    setSubmitting(false);
  });

  const renderStepContent = () => {
    switch (currentStepConfig.id) {
      case "age":
        return (
          <AgeStep
            register={register}
            errors={formState.errors}
            onNext={() => void stepper.next()}
          />
        );
      case "weight":
        return (
          <WeightStep
            register={register}
            errors={formState.errors}
            onBack={stepper.back}
            onNext={() => void stepper.next()}
          />
        );
      case "height":
        return (
          <HeightStep
            register={register}
            errors={formState.errors}
            onBack={stepper.back}
            onNext={() => void stepper.next()}
          />
        );
      case "bmi":
        return (
          <BmiStep
            bmiResult={bmiResult}
            onBack={stepper.back}
            onNext={() => void stepper.next()}
          />
        );
      case "account":
        return (
          <AccountStep
            register={register}
            errors={formState.errors}
            onBack={stepper.back}
            submitting={submitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xs">
      <CardHeader className="text-center pb-2">
        <CardHeader className="text-center pb-2">
          <StepperHeader
            title="Let's Get Started"
            current={stepper.currentStepIndex + 1}
            total={steps.length}
          />
        </CardHeader>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={onSubmit}>
          {renderStepContent()}
          {submitError && (
            <p className="mt-4 text-sm text-destructive text-center">{submitError}</p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
