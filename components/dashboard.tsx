"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  Activity,
  LogOut,
  Plus,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { AdditionalTrackers } from "@/components/additional-trackers";
import KPICard from "@/components/KpiCard";
import type { CaloriesEntry, SleepEntry, StepsEntry } from "@/components/wellness-metrics-chart";
import { Box, Flex, Grid, Text, Title } from "@/components/layout";
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
import { Profile, WeightEntry } from "@/lib/types";

const WeightChart = dynamic(
  () => import("./weight-chart").then((mod) => mod.WeightChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-80 items-center justify-center rounded-xl bg-muted/30 text-sm text-muted-foreground">
        Loading weight chart…
      </div>
    ),
  },
);

const WellnessMetricsChart = dynamic(
  () => import("./wellness-metrics-chart").then((mod) => mod.WellnessMetricsChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[280px] items-center justify-center rounded-xl bg-muted/30 text-sm text-muted-foreground">
        Loading wellness metrics…
      </div>
    ),
  },
);

interface DashboardProps {
  profile: Profile;
  entries: WeightEntry[];
  onLogout: () => void;
  demoMode?: boolean;
}

const DEMO_WELLNESS = {
  sleep: [
    { date: "2026-01-20", hours: 7.2 },
    { date: "2026-01-21", hours: 7.4 },
    { date: "2026-01-22", hours: 7.1 },
    { date: "2026-01-23", hours: 7.6 },
    { date: "2026-01-24", hours: 7.3 },
  ],
  calories: [
    { date: "2026-01-20", kcal: 2220 },
    { date: "2026-01-21", kcal: 2180 },
    { date: "2026-01-22", kcal: 2150 },
    { date: "2026-01-23", kcal: 2190 },
    { date: "2026-01-24", kcal: 2160 },
  ],
  steps: [
    { date: "2026-01-20", steps: 9400 },
    { date: "2026-01-21", steps: 8800 },
    { date: "2026-01-22", steps: 9200 },
    { date: "2026-01-23", steps: 10400 },
    { date: "2026-01-24", steps: 9600 },
  ],
};

export function Dashboard({ profile, entries, onLogout, demoMode = false }: DashboardProps) {
  const [weights, setWeights] = useState<WeightEntry[]>(entries);
  const [newWeight, setNewWeight] = useState("");
  const [status, setStatus] = useState<{ type: "info" | "error"; text: string } | null>(null);
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>(() =>
    demoMode ? DEMO_WELLNESS.sleep : [],
  );
  const [caloriesEntries, setCaloriesEntries] = useState<CaloriesEntry[]>(() =>
    demoMode ? DEMO_WELLNESS.calories : [],
  );
  const [stepsEntries, setStepsEntries] = useState<StepsEntry[]>(() =>
    demoMode ? DEMO_WELLNESS.steps : [],
  );

  const latestWeight = useMemo(
    () => weights[weights.length - 1]?.weight ?? profile.initialWeight,
    [weights, profile.initialWeight],
  );

  const firstWeight = useMemo(
    () => weights[0]?.weight ?? profile.initialWeight,
    [weights, profile.initialWeight],
  );

  const previousWeight = useMemo(
    () => (weights.length > 1 ? weights[weights.length - 2]?.weight : null),
    [weights],
  );

  const weightChange = latestWeight - firstWeight;
  const lastDelta = previousWeight ? latestWeight - previousWeight : null;
  const bmiResult = calculateBMI(latestWeight, profile.height);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "underweight":
        return "text-zone-underweight";
      case "healthy":
        return "text-primary"; // keep palette, swap greens for orange accent
      case "overweight":
        return "text-zone-overweight";
      case "obese":
        return "text-zone-obese";
      default:
        return "text-primary";
    }
  };

  const todayKey = () => new Date().toISOString().split("T")[0];

  const addWeight = () => {
    const parsed = parseFloat(newWeight);
    if (!Number.isFinite(parsed) || parsed < 20 || parsed > 500) {
      setStatus({ type: "error", text: "Enter a weight between 20 and 500 kg." });
      return;
    }

    const today = todayKey();
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

  const logSleep = (start: string, end: string) => {
    if (!start || !end) throw new Error("Please provide both start and end times.");
    const [sH, sM] = start.split(":").map(Number);
    const [eH, eM] = end.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(sH, sM, 0, 0);
    const endDate = new Date();
    endDate.setHours(eH, eM, 0, 0);
    if (endDate <= startDate) endDate.setDate(endDate.getDate() + 1);
    const diffHours = Math.round(((endDate.getTime() - startDate.getTime()) / 36e5) * 10) / 10;
    const today = todayKey();
    setSleepEntries((prev) => {
      const idx = prev.findIndex((item) => item.date === today);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], hours: diffHours };
        return copy;
      }
      return [...prev, { date: today, hours: diffHours }];
    });
  };

  const logCalories = (value: number) => {
    const today = todayKey();
    setCaloriesEntries((prev) => {
      const idx = prev.findIndex((item) => item.date === today);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], kcal: value };
        return copy;
      }
      return [...prev, { date: today, kcal: value }];
    });
  };

  const logSteps = (value: number) => {
    const today = todayKey();
    setStepsEntries((prev) => {
      const idx = prev.findIndex((item) => item.date === today);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], steps: value };
        return copy;
      }
      return [...prev, { date: today, steps: value }];
    });
  };

  return (
    <Box className="min-h-screen bg-background">
      <Box as="header" className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <Flex
          className="container mx-auto"
          px="md"
          py="md"
          align="center"
          justify="space-between"
          gap="md"
        >
          <Flex align="center" gap="sm">
            <Box className="p-2 rounded-xl bg-primary/10">
              <Activity className="h-6 w-6 text-primary" />
            </Box>
            <Box>
              <Title order={1} size="h4" fw="bold" className="font-serif text-foreground">
                WeightWise
              </Title>
              <Text size="xs" className="text-muted-foreground">
                Stay on top of your wellness journey
              </Text>
            </Box>
            {demoMode && (
              <Box
                as="span"
                px="xs"
                py="xs"
                radius="full"
                className="text-xs bg-primary/10 text-primary"
              >
                Demo
              </Box>
            )}
          </Flex>
          <Button variant="ghost" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            {demoMode ? "Back" : "Logout"}
          </Button>
        </Flex>
      </Box>

      <Box as="main" className="container mx-auto max-w-6xl" px="md" py="xl">
        {demoMode && (
          <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardContent className="py-3 text-sm text-muted-foreground">
              You are viewing demo data. Start the questionnaire to create your own journey.
            </CardContent>
          </Card>
        )}

        <Grid columns={12} gutter="md" className="mb-8">
          <Grid.Col span={{ base: 12, md: 3 }}>
            <KPICard
              title="Current weight"
              value={`${latestWeight.toFixed(1)} kg`}
              icon={<Target className="h-5 w-5 text-primary" />}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <KPICard
              title="Last change"
              value={
                lastDelta !== null ? (
                  <>
                    {lastDelta > 0 ? "+" : ""}
                    {lastDelta.toFixed(1)} kg
                  </>
                ) : (
                  "--"
                )
              }
              valueClassName={
                lastDelta !== null && lastDelta <= 0 ? "text-primary" : "text-zone-overweight"
              }
              icon={
                lastDelta !== null && lastDelta <= 0 ? (
                  <TrendingDown className="h-5 w-5 text-primary" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-zone-overweight" />
                )
              }
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <KPICard
              title="Total change"
              value={
                <>
                  {weightChange > 0 ? "+" : ""}
                  {weightChange.toFixed(1)} kg
                </>
              }
              valueClassName={weightChange <= 0 ? "text-primary" : "text-zone-overweight"}
              icon={
                weightChange <= 0 ? (
                  <TrendingDown className="h-5 w-5 text-primary" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-zone-overweight" />
                )
              }
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <KPICard
              title="Current BMI"
              value={bmiResult.bmi.toFixed(1)}
              valueClassName={getCategoryColor(bmiResult.category)}
              subTitle={
                <Text size="xs" className={getCategoryColor(bmiResult.category)}>
                  {bmiResult.label}
                </Text>
              }
              icon={<Activity className="h-5 w-5 text-primary" />}
            />
          </Grid.Col>
        </Grid>

        <Grid columns={{ base: 1, lg: 12 }} gutter="lg" className="mb-8">
          <Grid.Col span={{ base: 1, lg: 7 }}>
            <Card className="border-0 shadow-md bg-card h-full">
              <CardHeader>
                <CardTitle className="text-lg font-serif text-foreground">Weight progress</CardTitle>
                <CardDescription>Trends with BMI-colored zones</CardDescription>
              </CardHeader>
              <CardContent>
                {weights.length > 0 ? (
                  <WeightChart data={weights} height={profile.height} />
                ) : (
                  <Flex
                    className="h-64 text-muted-foreground"
                    align="center"
                    justify="center"
                  >
                    <Text>No weight entries yet. Start by logging your weight.</Text>
                  </Flex>
                )}
              </CardContent>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 1, lg: 5 }}>
            <WellnessMetricsChart
              sleep={sleepEntries}
              calories={caloriesEntries}
              steps={stepsEntries}
            />
          </Grid.Col>
        </Grid>

        <Grid columns={{ base: 1, md: 2 }} gutter="lg">
          <Grid.Col>
            <Card className="border-0 shadow-md bg-card h-full">
              <CardHeader>
                <CardTitle className="text-lg font-serif text-foreground">
                  Log today&apos;s weight
                </CardTitle>
                <CardDescription>Keep daily momentum</CardDescription>
              </CardHeader>
              <CardContent>
                <Flex direction={{ base: "column", sm: "row" }} gap="sm" align={{ sm: "center" }}>
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
                    Log weight
                  </Button>
                </Flex>
                {status && (
                  <Text
                    size="sm"
                    className={`mt-2 ${
                      status.type === "error" ? "text-destructive" : "text-muted-foreground"
                    }`}
                  >
                    {status.text}
                  </Text>
                )}
                {demoMode && (
                  <Text size="xs" className="mt-2 text-muted-foreground">
                    Demo mode resets when you leave this page. Sign up to keep your progress.
                  </Text>
                )}
              </CardContent>
            </Card>
          </Grid.Col>

          <Grid.Col>
            <AdditionalTrackers
              onLogSleep={logSleep}
              onLogCalories={logCalories}
              onLogSteps={logSteps}
              disabled={demoMode}
            />
          </Grid.Col>
        </Grid>
      </Box>
    </Box>
  );
}
