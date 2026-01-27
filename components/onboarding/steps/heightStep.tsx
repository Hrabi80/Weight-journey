"use client";

import { Activity, Ruler } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StepFormProps, StepNavProps } from "./types";

type HeightStepProps = StepFormProps &
  Required<Pick<StepNavProps, "onNext">> &
  Required<Pick<StepNavProps, "onBack">>;

/**
 * Step 3: Collect height.
 * Junior note: next button says "Calculate BMI" but still just calls `on_next`.
 * The stepper engine computes BMI when leaving this step.
 */
export function HeightStep({ register, errors, onNext, onBack }: HeightStepProps) {
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
        <Input
          id="height"
          type="number"
          placeholder="e.g., 175"
          min={100}
          max={250}
          {...register("height")}
        />
        {errors.height?.message && (
          <p className="text-sm text-destructive mt-1">{String(errors.height.message)}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button type="button" onClick={onNext} className="flex-1">
          Calculate BMI <Activity className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
