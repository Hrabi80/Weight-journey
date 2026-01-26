"use client";

import type { ComponentType, SVGProps } from "react";
import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Activity, ArrowRight, Calendar, Lock, Ruler, Scale, User } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BMIResult, calculateBMI } from "@/lib/bmi";
import { OnboardingFormInputs, OnboardingFormValues, OnboardingResult, onboardingSchema, StepId } from "./onboarding-schema";

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

export function OnboardingStepperForm({ onComplete }: OnboardingStepperFormProps) {
  // Router is only used for optional navigation after submit
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [bmiResult, setBmiResult] = useState<BMIResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  const currentStepConfig = steps[currentStep];
  const totalProgressSteps = 5;

  const computeBmiFromValues = () => {
    // Re-use the schema so BMI math always receives valid numeric inputs.
    const parsed = onboardingSchema.pick({ weight: true, height: true }).parse(getValues());
    return calculateBMI(parsed.weight, parsed.height);
  };

  const handleNext = async () => {
    // Gate progress until the current step fields validate.
    const { fields, id } = currentStepConfig;

    if (fields.length) {
      const isValid = await trigger(fields, { shouldFocus: true });
      if (!isValid) return;
    }

    if (id === "height") {
      const result = computeBmiFromValues();
      setBmiResult(result);
    }

    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = handleSubmit(async (values: OnboardingFormValues) => {
    // Build the final payload, log it for now, and kick off a soft redirect.
    setSubmitting(true);
    const finalBmi = bmiResult ?? calculateBMI(values.weight, values.height);
    const dataToSend: OnboardingResult = { ...values, bmiResult: finalBmi };

    // Logging here for now because there is no backend yet.
    console.log("dataToSend", dataToSend);

    await onComplete?.(dataToSend);

    // Optional navigation to the dashboard after a short delay.
    setTimeout(() => router.push("/dashboard"), 2000);
    setSubmitting(false);
  });

  const renderFieldError = (field: keyof typeof formState.errors) => {
    const error = formState.errors[field];
    if (!error) return null;
    return <p className="text-sm text-destructive mt-1">{error.message as string}</p>;
  };

  const renderStepContent = () => {
    switch (currentStepConfig.id) {
      case "age":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">How old are you?</h3>
                <p className="text-sm text-muted-foreground">Your age helps us personalize your journey</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age (years)</Label>
              <Input id="age" type="number" placeholder="e.g., 25" min={10} max={120} {...register("age")} />
              {renderFieldError("age")}
            </div>
            <Button type="button" onClick={handleNext} className="w-full">
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      case "weight":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Scale className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">What&apos;s your current weight?</h3>
                <p className="text-sm text-muted-foreground">This is your starting point</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="e.g., 75"
                min={20}
                max={500}
                step="0.1"
                {...register("weight")}
              />
              {renderFieldError("weight")}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button type="button" onClick={handleNext} className="flex-1">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      case "height":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Ruler className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">What&apos;s your height?</h3>
                <p className="text-sm text-muted-foreground">We need this to calculate your BMI</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input id="height" type="number" placeholder="e.g., 175" min={100} max={250} {...register("height")} />
              {renderFieldError("height")}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button type="button" onClick={handleNext} className="flex-1">
                Calculate BMI <Activity className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      case "bmi": {
        if (!bmiResult) {
          return (
            <div className="space-y-4 animate-in fade-in slide-in-from-right duration-300">
              <p className="text-sm text-muted-foreground">We need your height and weight to show BMI.</p>
              <Button type="button" onClick={handleBack} variant="outline">
                Back to height
              </Button>
            </div>
          );
        }

        const getCategoryColor = (category: string) => {
          switch (category) {
            case "underweight":
              return "bg-zone-underweight";
            case "healthy":
              return "bg-zone-healthy";
            case "overweight":
              return "bg-zone-overweight";
            case "obese":
              return "bg-zone-obese";
            default:
              return "bg-primary";
          }
        };

        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
            <div className="text-center">
              <div
                className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getCategoryColor(bmiResult.category)} mb-4`}
              >
                <span className="text-2xl font-bold text-primary-foreground">{bmiResult.bmi.toFixed(1)}</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{bmiResult.label}</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">{bmiResult.description}</p>
            </div>

            <div className="relative h-4 rounded-full overflow-hidden bg-gradient-to-r from-zone-underweight via-zone-healthy via-zone-overweight to-zone-obese">
              <div
                className="absolute top-0 w-2 h-full bg-foreground rounded-full shadow-lg transform -translate-x-1/2"
                style={{
                  left: `${Math.min(Math.max(((bmiResult.bmi - 15) / 25) * 100, 0), 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>15</span>
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
              <span>40</span>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button type="button" onClick={handleNext} className="flex-1">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      }
      case "account":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Create your account</h3>
                <p className="text-sm text-muted-foreground">Save your progress and continue tracking</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  {...register("email")}
                />
              </div>
              {renderFieldError("email")}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  minLength={6}
                  {...register("password")}
                />
              </div>
              {renderFieldError("password")}
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? "Creating..." : "Create account"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xs">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-serif text-foreground">Let&apos;s Get Started</CardTitle>
        <CardDescription>
          Step {currentStepConfig.progressIndex} of {totalProgressSteps}
        </CardDescription>
        <div className="flex gap-1 justify-center mt-3">
          {Array.from({ length: totalProgressSteps }).map((_, index) => (
            <div
              key={index}
              className={`h-1.5 w-12 rounded-full transition-colors ${
                index < currentStepConfig.progressIndex ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={onSubmit}>{renderStepContent()}</form>
      </CardContent>
    </Card>
  );
}
