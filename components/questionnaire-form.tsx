"use client";

import { useState } from "react";
import { Activity, ArrowRight, Calendar, Ruler, Scale } from "lucide-react";

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

export interface QuestionnaireData {
  age: number;
  weight: number;
  height: number;
  bmiResult: BMIResult;
}

interface QuestionnaireFormProps {
  onComplete: (data: QuestionnaireData) => void;
}

export function QuestionnaireForm({ onComplete }: QuestionnaireFormProps) {
  const [step, setStep] = useState(1);
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bmiResult, setBmiResult] = useState<BMIResult | null>(null);

  const handleCalculate = () => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    if (Number.isNaN(weightNum) || Number.isNaN(heightNum)) return;

    const result = calculateBMI(weightNum, heightNum);
    setBmiResult(result);
    setStep(4);
  };

  const handleContinue = () => {
    if (!bmiResult) return;
    onComplete({
      age: parseInt(age, 10),
      weight: parseFloat(weight),
      height: parseFloat(height),
      bmiResult,
    });
  };

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

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">How old are you?</h3>
                <p className="text-sm text-muted-foreground">
                  Your age helps us personalize your journey
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age (years)</Label>
              <Input
                id="age"
                type="number"
                placeholder="e.g., 25"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min={10}
                max={120}
              />
            </div>
            <Button
              onClick={() => setStep(2)}
              disabled={!age || parseInt(age, 10) < 10}
              className="w-full"
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      case 2:
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
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min={20}
                max={500}
                step="0.1"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!weight || parseFloat(weight) < 20}
                className="flex-1"
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      case 3:
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
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                min={100}
                max={250}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleCalculate}
                disabled={!height || parseFloat(height) < 100}
                className="flex-1"
              >
                Calculate BMI <Activity className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
            <div className="text-center">
              <div
                className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getCategoryColor(bmiResult!.category)} mb-4`}
              >
                <span className="text-2xl font-bold text-primary-foreground">
                  {bmiResult!.bmi.toFixed(1)}
                </span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{bmiResult!.label}</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                {bmiResult!.description}
              </p>
            </div>

            <div className="relative h-4 rounded-full overflow-hidden bg-gradient-to-r from-zone-underweight via-zone-healthy via-zone-overweight to-zone-obese">
              <div
                className="absolute top-0 w-2 h-full bg-foreground rounded-full shadow-lg transform -translate-x-1/2"
                style={{
                  left: `${Math.min(Math.max(((bmiResult!.bmi - 15) / 25) * 100, 0), 100)}%`,
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

            <Button onClick={handleContinue} className="w-full" size="lg">
              Start Tracking My Progress <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-card">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-serif text-foreground">Let&apos;s Get Started</CardTitle>
        <CardDescription>Step {Math.min(step, 3)} of 3</CardDescription>
        <div className="flex gap-1 justify-center mt-3">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 w-12 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-4">{renderStep()}</CardContent>
    </Card>
  );
}
