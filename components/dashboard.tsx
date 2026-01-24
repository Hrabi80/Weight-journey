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
import { WeightChart } from "@/components/weight-chart";
import KPICard from "@/components/KpiCard";
import { calculateBMI } from "@/lib/bmi";

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
    <Box className="min-h-screen bg-background">
      <Box as="header" className="border-b border-border bg-card">
        <Flex
          className="container mx-auto"
          px="md"
          py="md"
          align="center"
          justify="space-between"
          gap="md"
        >
          <Flex align="center" gap="xs">
            <Activity className="h-6 w-6 text-primary" />
            <Title
              order={1}
              size="h4"
              fw="bold"
              className="font-serif text-foreground"
            >
              WeightWise
            </Title>
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

      <Box as="main" className="container mx-auto  max-w-4xl" px="md" py="xl">
        <Grid columns={12} gutter="md" className="mb-8">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <KPICard
              title="Current Weight"
              value={`${latestWeight} kg`}
              icon={<Target className="h-5 w-5 text-primary" />}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <KPICard
              title="Total Change"
              value={
                <>
                  {weightChange > 0 ? "+" : ""}
                  {weightChange.toFixed(1)} kg
                </>
              }
              valueClassName={
                weightChange <= 0 ? "text-zone-healthy" : "text-zone-overweight"
              }
              iconContainerClassName={
                weightChange <= 0 ? "bg-zone-healthy/10" : "bg-zone-overweight/10"
              }
              icon={
                weightChange <= 0 ? (
                  <TrendingDown
                    className={
                      weightChange <= 0
                        ? "text-zone-healthy h-5 w-5"
                        : "text-zone-overweight h-5 w-5"
                    }
                  />
                ) : (
                  <TrendingUp className="h-5 w-5 text-zone-overweight" />
                )
              }
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
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

        <Card className="mb-8 border-0 shadow-md bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-serif text-foreground">Log Today&apos;s Weight</CardTitle>
            <CardDescription>Track your daily progress</CardDescription>
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
                Log Weight
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

        <Card className="border-0 shadow-md bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-serif text-foreground">Your Progress</CardTitle>
            <CardDescription>Weight tracking over time with health zones</CardDescription>
          </CardHeader>
          <CardContent>
            {weights.length > 0 ? (
              <WeightChart data={weights} height={profile.height} />
            ) : (
              <Flex
                className="h-80 text-muted-foreground"
                align="center"
                justify="center"
              >
                <Text>No weight entries yet. Start by logging your weight above!</Text>
              </Flex>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
