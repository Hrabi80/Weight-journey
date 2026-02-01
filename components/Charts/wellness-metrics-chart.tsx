"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO, subMonths, subYears } from "date-fns";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { WellnessTooltip } from "./Tooltips/WellnessTooltip";
import { WellnessChartControls } from "./controls/WellnessChartControls";
import type { RangeMode, WellnessMetric as MetricMode, XLabelSize } from "./types";


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

function safe_parse_iso(value: string): Date | null {
  try {
    return parseISO(value);
  } catch {
    return null;
  }
}

function get_range_start(end: Date, range: RangeMode): Date | null {
  if (range === "all") return null;
  if (range === "7d") return new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000);
  if (range === "1m") return subMonths(end, 1);
  if (range === "2m") return subMonths(end, 2);
  if (range === "1y") return subYears(end, 1);
  return null;
}

function format_x_tick(value: string, range: RangeMode): string {
  const d = safe_parse_iso(value);
  if (!d) return value;

  if (range === "7d") return format(d, "EEE");
  if (range === "1m" || range === "2m") return format(d, "MMM d");
  if (range === "1y") return format(d, "MMM");
  return format(d, "MMM yy");
}

function x_axis_font_size(size: XLabelSize): number {
  if (size === "sm") return 11;
  if (size === "lg") return 14;
  return 12;
}

export function WellnessMetricsChart({
  sleep,
  calories,
  steps,
}: WellnessMetricsChartProps) {
  const [metric, set_metric] = useState<MetricMode>("all");
  const [range, set_range] = useState<RangeMode>("1m");
  const [x_label_size, set_x_label_size] = useState<XLabelSize>("md");

  const merged_data = useMemo(() => {
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

  const visible_data = useMemo(() => {
    if (merged_data.length === 0) return merged_data;

    const end_str = merged_data[merged_data.length - 1]?.date;
    const end_date = end_str ? safe_parse_iso(end_str) : null;
    if (!end_date) return merged_data;

    const start = get_range_start(end_date, range);
    if (!start) return merged_data;

    return merged_data.filter((row) => {
      const d = safe_parse_iso(row.date);
      return d ? d >= start && d <= end_date : false;
    });
  }, [merged_data, range]);

  const show_sleep = metric === "all" || metric === "sleep";
  const show_calories = metric === "all" || metric === "calories";
  const show_steps = metric === "all" || metric === "steps";

  const show_calories_axis = show_calories;
  const show_wellness_axis = show_sleep || show_steps;

  const wellness_orientation = show_calories_axis ? "right" : "left";

  return (
    <Card className="border-border/60 shadow-md h-full">
      <CardHeader className="pb-2">
        <CardTitle className="font-serif text-lg text-foreground">
          Wellness metrics
        </CardTitle>
        <CardDescription>Sleep, calories, and steps in one view</CardDescription>

        <WellnessChartControls
          metric={metric}
          on_metric_change={set_metric}
          range={range}
          on_range_change={set_range}
          x_label_size={x_label_size}
          on_x_label_size_change={set_x_label_size}
        />
      </CardHeader>

      <CardContent>
        {visible_data.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center text-muted-foreground">
            No wellness entries yet. Log sleep, calories, or steps to see the chart.
          </div>
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={visible_data}
                margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  opacity={0.35}
                />

                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => format_x_tick(String(v), range)}
                  stroke="var(--muted-foreground)"
                  fontSize={x_axis_font_size(x_label_size)}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={18}
                  interval="preserveStartEnd"
                />

                {show_calories_axis && (
                  <YAxis
                    yAxisId="calories"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}`}
                  />
                )}

                {show_wellness_axis && (
                  <YAxis
                    yAxisId="wellness"
                    orientation={wellness_orientation}
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}`}
                  />
                )}

                <Tooltip content={<WellnessTooltip />} />
                {metric === "all" && <Legend />}

                {show_sleep && (
                  <Line
                    yAxisId="wellness"
                    type="monotone"
                    dataKey="sleep"
                    name="Sleep (h)"
                    stroke="var(--night)"
                    strokeWidth={3}
                    dot={false}
                  />
                )}

                {show_calories && (
                  <Line
                    yAxisId="calories"
                    type="monotone"
                    dataKey="calories"
                    name="Calories"
                    stroke="var(--chart-3)"
                    strokeWidth={3}
                    dot={false}
                  />
                )}

                {show_steps && (
                  <Line
                    yAxisId="wellness"
                    type="monotone"
                    dataKey="stepsK"
                    name="Steps (k)"
                    stroke="var(--zone-overweight)"
                    strokeWidth={3}
                    dot={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
