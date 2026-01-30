"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";
import { format, parseISO } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type WellnessTooltipProps = TooltipProps<number, string>;

function WellnessTooltip({ active, payload, label }: WellnessTooltipProps) {
  if (active && payload && payload.length && typeof label === "string") {
    const sleepVal = payload.find((p) => p.dataKey === "sleep")?.value as number | undefined;
    const caloriesVal = payload.find((p) => p.dataKey === "calories")?.value as number | undefined;
    const stepsVal = payload.find((p) => p.dataKey === "stepsK")?.payload?.steps as
      | number
      | undefined;

    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-sm">
        <p className="text-muted-foreground mb-1">
          {format(parseISO(label), "MMMM d, yyyy")}
        </p>
        {sleepVal !== undefined && (
          <p className="text-foreground">
            Sleep: <span className="font-semibold">{sleepVal} h</span>
          </p>
        )}
        {caloriesVal !== undefined && (
          <p className="text-foreground">
            Calories: <span className="font-semibold">{caloriesVal} kcal</span>
          </p>
        )}
        {stepsVal !== undefined && (
          <p className="text-foreground">
            Steps: <span className="font-semibold">{stepsVal.toLocaleString()} steps</span>
          </p>
        )}
      </div>
    );
  }
  return null;
}

export type SleepEntry = { date: string; hours: number };
export type CaloriesEntry = { date: string; kcal: number };
export type StepsEntry = { date: string; steps: number };

interface WellnessMetricsChartProps {
  sleep: SleepEntry[];
  calories: CaloriesEntry[];
  steps: StepsEntry[];
}

type Merged = {
  date: string;
  sleep?: number;
  calories?: number;
  steps?: number;
  stepsK?: number;
};

export function WellnessMetricsChart({ sleep, calories, steps }: WellnessMetricsChartProps) {
  const mergedData = useMemo(() => {
    const map = new Map<string, Merged>();
    const ensure = (date: string) => {
      if (!map.has(date)) map.set(date, { date });
      return map.get(date)!;
    };

    sleep.forEach((entry) => {
      const target = ensure(entry.date);
      target.sleep = entry.hours;
    });

    calories.forEach((entry) => {
      const target = ensure(entry.date);
      target.calories = entry.kcal;
    });

    steps.forEach((entry) => {
      const target = ensure(entry.date);
      target.steps = entry.steps;
      target.stepsK = Math.round((entry.steps / 1000) * 10) / 10;
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [sleep, calories, steps]);

  return (
    <Card className="border-border/60 shadow-md h-full">
      <CardHeader className="pb-2">
        <CardTitle className="font-serif text-lg text-foreground">Wellness metrics</CardTitle>
        <CardDescription>Sleep, calories, and steps in one view</CardDescription>
      </CardHeader>
      <CardContent>
        {mergedData.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center text-muted-foreground">
            No wellness entries yet. Log sleep, calories, or steps to see the chart.
          </div>
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mergedData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.35} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => {
                    try {
                      return format(parseISO(value), "MMM d");
                    } catch {
                      return value;
                    }
                  }}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="calories"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}`}
                />
                <YAxis
                  yAxisId="wellness"
                  orientation="right"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}`}
                />
                <Tooltip content={<WellnessTooltip />} />
                <Legend />

                <Line
                  yAxisId="wellness"
                  type="monotone"
                  dataKey="sleep"
                  name="Sleep (h)"
                  stroke="hsl(var(--accent-foreground))"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  yAxisId="calories"
                  type="monotone"
                  dataKey="calories"
                  name="Calories"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  yAxisId="wellness"
                  type="monotone"
                  dataKey="stepsK"
                  name="Steps (k)"
                  stroke="hsl(var(--zone-overweight))"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
