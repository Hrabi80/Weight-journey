"use client";

import dynamic from "next/dynamic";

import type { CaloriesEntry, SleepEntry, StepsEntry } from "@/components/Charts/wellness-metrics-chart";
import { WeightOverlayControls } from "@/components/Charts/controls/WeightOverlayControls";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Flex, Grid, Text } from "@/components/layout";
import type { WeightEntry } from "@/lib/types";
import { useWeightOverlay } from "../use-weight-overlay";

const WeightChart = dynamic(() => import("@/components/Charts/weight-chart").then((m) => m.WeightChart), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 items-center justify-center rounded-xl bg-muted/30 text-sm text-muted-foreground">
      Loading weight chart…
    </div>
  ),
});

const WellnessMetricsChart = dynamic(
  () => import("@/components/Charts/wellness-metrics-chart").then((m) => m.WellnessMetricsChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[280px] items-center justify-center rounded-xl bg-muted/30 text-sm text-muted-foreground">
        Loading wellness metrics…
      </div>
    ),
  },
);

interface ProgressSectionProps {
  weights: WeightEntry[];
  height: number;
  sleep: SleepEntry[];
  calories: CaloriesEntry[];
  steps: StepsEntry[];
}

export function ProgressSection({ weights, height, sleep, calories, steps }: ProgressSectionProps) {
  const { overlayEnabled, overlayMetric, setOverlayMetric, toggleOverlay } = useWeightOverlay();

  return (
    <Grid columns={{ base: 1, lg: 12 }} gutter="lg" className="mb-8">
      <Grid.Col span={{ base: 1, lg: 12 }}>
        <Card className="border-0 shadow-md bg-card h-full">
          <CardHeader>
            <CardTitle className="text-lg font-serif text-foreground">Weight progress</CardTitle>
            <CardDescription>Trends with BMI-colored zones</CardDescription>
          </CardHeader>
          <CardContent>
            <WeightOverlayControls
              overlayEnabled={overlayEnabled}
              metric={overlayMetric}
              onToggleOverlay={toggleOverlay}
              onMetricChange={setOverlayMetric}
            />
            {weights.length > 0 ? (
              <WeightChart
                data={weights}
                height={height}
                overlayEnabled={overlayEnabled}
                overlayMetric={overlayMetric}
                sleep={sleep}
                calories={calories}
                steps={steps}
              />
            ) : (
              <Flex className="h-64 text-muted-foreground" align="center" justify="center">
                <Text>No weight entries yet. Start by logging your weight.</Text>
              </Flex>
            )}
          </CardContent>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 1, lg: 12 }}>
        <WellnessMetricsChart sleep={sleep} calories={calories} steps={steps} />
      </Grid.Col>
    </Grid>
  );
}
