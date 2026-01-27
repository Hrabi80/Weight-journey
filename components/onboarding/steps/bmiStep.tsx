"use client";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { BmiStepProps } from "./types";

/**
 * Step 4: Show BMI result.
 * Junior note: BMI is computed in the stepper hook. This step only displays it.
 */
export function BmiStep({ bmiResult, onNext, onBack }: BmiStepProps) {
  if (!bmiResult) {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-right duration-300">
        <p className="text-sm text-muted-foreground">We need your height and weight to show BMI.</p>
        <Button type="button" onClick={onBack} variant="outline">
          Back to height
        </Button>
      </div>
    );
  }

  const get_category_color = (category: string) => {
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
          className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${get_category_color(
            bmiResult.category
          )} mb-4`}
        >
          <span className="text-2xl font-bold text-primary-foreground">
            {bmiResult.bmi.toFixed(1)}
          </span>
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
