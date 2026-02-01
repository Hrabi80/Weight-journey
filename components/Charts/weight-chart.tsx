"use client";

import { useMemo, useState } from "react";
import {
  Area,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";

import { getBMIForWeight, getWeightRanges } from "@/lib/bmi";
import type { WeightEntry } from "@/lib/types";
import type { RangeMode, WellnessMetric, XLabelSize } from "./types";
import type { CaloriesEntry, SleepEntry, StepsEntry } from "./wellness-metrics-chart";
import { WeightTooltip } from "./Tooltips/WeightTooltip";
import { WeightChartControls } from "./controls/WeightChartControls";

interface WeightChartProps {
  data: WeightEntry[];
  height: number;
  overlayEnabled?: boolean;
  overlayMetric?: WellnessMetric;
  sleep?: SleepEntry[];
  calories?: CaloriesEntry[];
  steps?: StepsEntry[];
}

type OverlayMap = Map<
  string,
  { sleep?: number; calories?: number; steps?: number; stepsK?: number }
>;

function safe_parse_iso(value: string): Date | null {
  try {
    return new Date(value);
  } catch {
    return null;
  }
}

function get_range_start(end: Date, range: RangeMode): Date | null {
  if (range === "all") return null;
  if (range === "7d") return new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000);
  if (range === "1m") return new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  if (range === "2m") return new Date(end.getTime() - 61 * 24 * 60 * 60 * 1000);
  if (range === "1y") return new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000);
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

export function WeightChart({
  data,
  height,
  overlayEnabled = false,
  overlayMetric = "all",
  sleep = [],
  calories = [],
  steps = [],
}: WeightChartProps) {
  const [range, setRange] = useState<RangeMode>("1m");
  const [xLabelSize, setXLabelSize] = useState<XLabelSize>("md");
  const ranges = useMemo(() => getWeightRanges(height), [height]);

  const overlayMap = useMemo<OverlayMap>(() => {
    if (!overlayEnabled) return new Map();
    const map: OverlayMap = new Map();
    const ensure = (date: string) => {
      if (!map.has(date)) map.set(date, { });
      return map.get(date)!;
    };

    sleep.forEach((entry) => {
      ensure(entry.date).sleep = entry.hours;
    });
    calories.forEach((entry) => {
      ensure(entry.date).calories = entry.kcal;
    });
    steps.forEach((entry) => {
      const target = ensure(entry.date);
      target.steps = entry.steps;
      target.stepsK = Math.round((entry.steps / 1000) * 10) / 10;
    });

    return map;
  }, [overlayEnabled, sleep, calories, steps]);

  const chartData = useMemo(() => {
    return data.map((entry) => {
      const date = new Date(entry.recordedAt);
      const dateKey = entry.recordedAt.split("T")[0];
      const overlay = overlayMap.get(dateKey);
      return {
        ...entry,
        displayDate: format(date, "MMM d"),
        bmi: getBMIForWeight(entry.weight, height),
        sleep: overlay?.sleep,
        calories: overlay?.calories,
        steps: overlay?.steps,
        stepsK: overlay?.stepsK,
        isoDate: entry.recordedAt,
      };
    });
  }, [data, height, overlayMap]);

  const visibleData = useMemo(() => {
    if (chartData.length === 0) return chartData;
    const end = safe_parse_iso(chartData[chartData.length - 1].isoDate);
    if (!end) return chartData;
    const start = get_range_start(end, range);
    if (!start) return chartData;
    return chartData.filter((row) => {
      const d = safe_parse_iso(row.isoDate);
      return d ? d >= start && d <= end : false;
    });
  }, [chartData, range]);

  const yDomain = useMemo(() => {
    if (visibleData.length === 0) return [50, 120];
    const weights = visibleData.map((d) => d.weight);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const padding = (max - min) * 0.2 || 10;
    return [
      Math.floor(Math.min(min, ranges.underweightMax * 0.8) - padding),
      Math.ceil(Math.max(max, ranges.obeseLevel2Max) + padding),
    ];
  }, [visibleData, ranges.obeseLevel2Max, ranges.underweightMax]);

  const showSleep = overlayEnabled && (overlayMetric === "all" || overlayMetric === "sleep");
  const showCalories = overlayEnabled && (overlayMetric === "all" || overlayMetric === "calories");
  const showSteps = overlayEnabled && (overlayMetric === "all" || overlayMetric === "steps");

  const showWellnessAxis = showSleep || showSteps;
  const wellnessOrientation: "left" | "right" = "right";

  return (
    <div className="w-full">
      <WeightChartControls
        range={range}
        on_range_change={setRange}
        x_label_size={xLabelSize}
        on_x_label_size_change={setXLabelSize}
      />

      <div className="relative h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={visibleData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
          <defs>
            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>

          <ReferenceArea
            y2={ranges.underweightMax}
            fill="var(--zone-underweight)"
            fillOpacity={0.16}
          />
          <ReferenceArea
            y1={ranges.underweightMax}
            y2={ranges.healthyMax}
            fill="var(--zone-healthy)"
            fillOpacity={0.14}
          />
          <ReferenceArea
            y1={ranges.healthyMax}
            y2={ranges.overweightMax}
            fill="var(--zone-overweight)"
            fillOpacity={0.16}
          />
          <ReferenceArea
            y1={ranges.overweightMax}
            y2={ranges.obeseLevel1Max}
            fill="var(--zone-obese)"
            fillOpacity={0.18}
          />
          <ReferenceArea
            y1={ranges.obeseLevel1Max}
            y2={ranges.obeseLevel2Max}
            fill="var(--zone-obese-strong)"
            fillOpacity={0.2}
          />
          <ReferenceArea
            y1={ranges.obeseLevel2Max}
            fill="var(--zone-obese-strong)"
            fillOpacity={0.28}
          />

          <XAxis
            dataKey="isoDate"
            tickFormatter={(v) => format_x_tick(String(v), range)}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: x_axis_font_size(xLabelSize) }}
            minTickGap={16}
          />
          <YAxis
            domain={yDomain}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            width={40}
          />
          {showCalories && (
            <YAxis
              yAxisId="calories"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              width={40}
            />
          )}

          {showWellnessAxis && (
            <YAxis
              yAxisId="wellness"
              orientation={wellnessOrientation as "left" | "right"}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              width={40}
            />
          )}

          <Tooltip
            content={
              <WeightTooltip
                overlayEnabled={overlayEnabled}
                showSleep={showSleep}
                showCalories={showCalories}
                showSteps={showSteps}
              />
            }
          />

          <ReferenceLine
            y={ranges.underweightMax}
            stroke="var(--zone-underweight)"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
          <ReferenceLine
            y={ranges.healthyMax}
            stroke="var(--zone-healthy)"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
          <ReferenceLine
            y={ranges.overweightMax}
            stroke="var(--zone-overweight)"
            strokeDasharray="4 4"
            strokeWidth={1}
          />

          <Area type="monotone" dataKey="weight" stroke="none" fill="url(#weightGradient)" />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="var(--primary)"
            strokeWidth={3}
            dot={{ fill: "var(--primary)", strokeWidth: 2, r: 5, stroke: "var(--primary)" }}
            activeDot={{ r: 7, stroke: "red", strokeWidth: 2, fill: "var(--card)" }}
          />

          {showSleep && (
            <Line
              yAxisId="wellness"
              type="monotone"
              dataKey="sleep"
              name="Sleep (h)"
              stroke="var(--night)"
              strokeWidth={3}
              dot={false}
              strokeDasharray="4 2"
            />
          )}

          {showCalories && (
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

          {showSteps && (
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
        </ComposedChart>
        </ResponsiveContainer>

        <div className="absolute top-2 right-2 flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-zone-underweight" />
            <span className="text-muted-foreground">Underweight (caution)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-zone-healthy" />
            <span className="text-muted-foreground">Healthy</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-zone-overweight" />
            <span className="text-muted-foreground">Overweight</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-zone-obese" />
            <span className="text-muted-foreground">Obesity I</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-zone-obese-strong" />
            <span className="text-muted-foreground">Obesity II+</span>
          </div>
        </div>
      </div>
    </div>
  );
}
