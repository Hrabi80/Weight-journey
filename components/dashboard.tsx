"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  LogOut,
  Plus,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { calculateBMI } from "@/lib/bmi";
import { WeightChart } from "@/components/weight-chart";

export interface Profile {
  height: number;
  age: number;
  initialWeight: number;
}

export interface WeightEntry {
  id: string;
  weight: number;
  recordedAt: string;
}

interface DashboardProps {
  profile: Profile;
  entries: WeightEntry[];
  onLogout: () => void;
  demoMode?: boolean;
}

export function Dashboard({ profile, entries, onLogout, demoMode = false }: DashboardProps) {
  const [weights, setWeights] = useState<WeightEntry[]>(entries);
  const [newWeight, setNewWeight] = useState("");
  const [status, setStatus] = useState<{ type: "info" | "error"; text: string } | null>(null);

  const latestWeight = useMemo(
    () => weights[weights.length - 1]?.weight ?? profile.initialWeight,
    [weights, profile.initialWeight],
  );

  const firstWeight = useMemo(
    () => weights[0]?.weight ?? profile.initialWeight,
    [weights, profile.initialWeight],
  );

  const weightChange = latestWeight - firstWeight;
  const bmiResult = calculateBMI(latestWeight, profile.height);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "underweight":
        return "text-zone-underweight";
      case "healthy":
        return "text-zone-healthy";
      case "overweight":
        return "text-zone-overweight";
      case "obese":
        return "text-zone-obese";
      default:
        return "text-primary";
    }
  };

  const addWeight = () => {
    const parsed = parseFloat(newWeight);
    if (!Number.isFinite(parsed) || parsed < 20 || parsed > 500) {
      setStatus({ type: "error", text: "Enter a weight between 20 and 500 kg." });
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const existingIndex = weights.findIndex(
      (entry) => entry.recordedAt.split("T")[0] === today,
    );

    if (existingIndex >= 0) {
      const updated = [...weights];
      updated[existingIndex] = { ...updated[existingIndex], weight: parsed };
      setWeights(updated);
    } else {
      setWeights([
        ...weights,
        {
          id: `local-${Date.now()}`,
          weight: parseFloat(parsed.toFixed(1)),
          recordedAt: new Date().toISOString(),
        },
      ]);
    }

    setNewWeight("");
    setStatus({ type: "info", text: `${parsed.toFixed(1)} kg logged for today.` });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-serif font-bold text-foreground">WeightWise</h1>
            {demoMode && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                Demo
              </span>
            )}
          </div>
          <Button variant="ghost" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            {demoMode ? "Back" : "Logout"}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-0 shadow-md bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Weight</p>
                  <p className="text-2xl font-bold text-foreground">{latestWeight} kg</p>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Change</p>
                  <p
                    className={`text-2xl font-bold ${
                      weightChange <= 0 ? "text-zone-healthy" : "text-zone-overweight"
                    }`}
                  >
                    {weightChange > 0 ? "+" : ""}
                    {weightChange.toFixed(1)} kg
                  </p>
                </div>
                <div
                  className={`p-3 rounded-full ${
                    weightChange <= 0 ? "bg-zone-healthy/10" : "bg-zone-overweight/10"
                  }`}
                >
                  {weightChange <= 0 ? (
                    <TrendingDown
                      className={`h-5 w-5 ${
                        weightChange <= 0 ? "text-zone-healthy" : "text-zone-overweight"
                      }`}
                    />
                  ) : (
                    <TrendingUp className="h-5 w-5 text-zone-overweight" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current BMI</p>
                  <p className={`text-2xl font-bold ${getCategoryColor(bmiResult.category)}`}>
                    {bmiResult.bmi.toFixed(1)}
                  </p>
                  <p className={`text-xs ${getCategoryColor(bmiResult.category)}`}>
                    {bmiResult.label}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8 border-0 shadow-md bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-serif text-foreground">Log Today&apos;s Weight</CardTitle>
            <CardDescription>Track your daily progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                type="number"
                placeholder="Enter weight in kg"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                min={20}
                max={500}
                step="0.1"
                className="flex-1"
              />
              <Button onClick={addWeight} className="sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Log Weight
              </Button>
            </div>
            {status && (
              <p
                className={`mt-2 text-sm ${
                  status.type === "error" ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                {status.text}
              </p>
            )}
            {demoMode && (
              <p className="mt-2 text-xs text-muted-foreground">
                Demo mode resets when you leave this page. Sign up to keep your progress.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-serif text-foreground">Your Progress</CardTitle>
            <CardDescription>Weight tracking over time with health zones</CardDescription>
          </CardHeader>
          <CardContent>
            {weights.length > 0 ? (
              <WeightChart data={weights} height={profile.height} />
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <p>No weight entries yet. Start by logging your weight above!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
