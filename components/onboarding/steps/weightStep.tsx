"use client";

import { ArrowRight, Scale } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StepFormProps, StepNavProps } from "./types";

type WeightStepProps = StepFormProps & Required<Pick<StepNavProps, "onNext">> &
  Required<Pick<StepNavProps, "onBack">>;

/**
 * Step 2: Collect weight.
 * Junior note: this component does not decide if user can continue.
 * The stepper calls RHF `trigger()` before moving forward.
 */
export function WeightStep({ register, errors, onNext, onBack }: WeightStepProps) {
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
        {errors.weight?.message && (
          <p className="text-sm text-destructive mt-1">{String(errors.weight.message)}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button type="button" onClick={onNext} className="flex-1">
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
