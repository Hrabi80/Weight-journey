"use client";

import { ArrowRight, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StepFormProps, StepNavProps } from "./types";

type AgeStepProps = StepFormProps & StepNavProps;

/**
 * Step 1: Collect age.
 * Junior note: we keep this step dumb/presentational. Validation happens in the stepper engine via `trigger`.
 */
export function AgeStep({ register, errors, onNext }: AgeStepProps) {
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
        <Input
          id="age"
          type="number"
          placeholder="e.g., 25"
          min={10}
          max={120}
          {...register("age")}
        />
        {errors.age?.message && (
          <p className="text-sm text-destructive mt-1">{String(errors.age.message)}</p>
        )}
      </div>

      <Button type="button" onClick={onNext} className="w-full">
        Continue <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
