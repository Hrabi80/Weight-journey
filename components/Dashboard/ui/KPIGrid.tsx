import { Activity, Target, TrendingDown, TrendingUp } from "lucide-react";

import KPICard from "@/components/KpiCard";
import { Grid, Text } from "@/components/layout";
import type { BMIResult } from "@/src/domaine/services/bmi.service";
import { getUserWeightIndicatorColor } from "@/src/presentation/mappers/bmi-indicator-color";

interface KpiGridProps {
  latestWeight: number;
  weightChange: number;
  lastDelta: number | null;
  bmiResult: BMIResult;
}

export function KpiGrid({ latestWeight,  weightChange, lastDelta, bmiResult }: KpiGridProps) {
  

  return (
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
          valueClassName={lastDelta !== null && lastDelta <= 0 ? "text-primary" : "text-zone-overweight"}
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
          valueClassName={getUserWeightIndicatorColor(bmiResult.category)}
          subTitle={
            <Text size="xs" className={getUserWeightIndicatorColor(bmiResult.category)}>
              {bmiResult.label}
            </Text>
          }
          icon={<Activity className="h-5 w-5 text-primary" />}
        />
      </Grid.Col>
    </Grid>
  );
}
