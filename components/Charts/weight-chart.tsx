"use client";

import { useEffect, useMemo, useState } from "react";
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

import { getBMIForWeight, getWeightRanges } from "@/src/domaine/services/bmi.service";
import { BuildWeightChartExportUseCase } from "@/src/application/useCases/dashboard/build-weight-chart-export.usecase";
import { download_binary_file, download_text_file } from "@/src/infrastructure/browser/file-download";
import {
  map_tabular_export_to_csv,
  map_tabular_export_to_pdf_bytes,
} from "@/src/presentation/mappers/tabular-export.mapper";
import type { WeightEntry } from "@/lib/types";
import type { RangeMode, WellnessMetric, XLabelSize } from "./types";
import type { CaloriesEntry, SleepEntry, StepsEntry } from "./wellness-metrics-chart";
import { WeightTooltip } from "./Tooltips/WeightTooltip";
import { ChartExportButtons } from "./controls/ChartExportButtons";
import { WeightChartControls } from "./controls/WeightChartControls";

interface WeightChartProps {
  data: WeightEntry[];
  height: number;
  userEmail?: string | null;
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

const BMI_LEGEND_ITEMS = [
  {
    colorClass: "bg-zone-underweight",
    desktopLabel: "Underweight (caution)",
    mobileLabel: "Underweight",
  },
  { colorClass: "bg-zone-healthy", desktopLabel: "Healthy", mobileLabel: "Healthy" },
  { colorClass: "bg-zone-overweight", desktopLabel: "Overweight", mobileLabel: "Overweight" },
  { colorClass: "bg-zone-obese", desktopLabel: "Obesity I", mobileLabel: "Obesity I" },
  { colorClass: "bg-zone-obese-strong", desktopLabel: "Obesity II+", mobileLabel: "Obesity II+" },
] as const;

const build_weight_chart_export = new BuildWeightChartExportUseCase();

export function WeightChart({
  data,
  height,
  userEmail,
  overlayEnabled = false,
  overlayMetric = "all",
  sleep = [],
  calories = [],
  steps = [],
}: WeightChartProps) {
  const [range, setRange] = useState<RangeMode>("1m");
  const [xLabelSize, setXLabelSize] = useState<XLabelSize>("md");
  const [isMobile, setIsMobile] = useState(false);
  const ranges = useMemo(() => getWeightRanges(height), [height]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const syncIsMobile = () => setIsMobile(mediaQuery.matches);
    syncIsMobile();
    mediaQuery.addEventListener("change", syncIsMobile);
    return () => mediaQuery.removeEventListener("change", syncIsMobile);
  }, []);

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
      const date = new Date(entry.date);
      const dateKey = entry.date;
      const overlay = overlayMap.get(dateKey);
      return {
        ...entry,
        displayDate: format(date, "MMM d"),
        bmi: getBMIForWeight(entry.weight, height),
        sleep: overlay?.sleep,
        calories: overlay?.calories,
        steps: overlay?.steps,
        stepsK: overlay?.stepsK,
        isoDate: entry.date,
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
  const chartMargin = isMobile
    ? { top: 12, right: 8, left: 0, bottom: 8 }
    : { top: 20, right: 30, left: 0, bottom: 10 };
  const xTickFontSize = isMobile
    ? Math.max(10, x_axis_font_size(xLabelSize) - 1)
    : x_axis_font_size(xLabelSize);
  const yTickFontSize = isMobile ? 11 : 12;
  const yAxisWidth = isMobile ? 34 : 40;

  const build_export_document = () =>
    build_weight_chart_export.execute({
      range,
      overlayEnabled,
      showSleep,
      showCalories,
      showSteps,
      userEmail: userEmail ?? undefined,
      rows: visibleData.map((row) => ({
        date: row.isoDate,
        weight: row.weight,
        sleep: row.sleep,
        calories: row.calories,
        steps: row.steps,
      })),
    });

  const handle_export_csv = () => {
    const document = build_export_document();
    const csv = map_tabular_export_to_csv(document);
    download_text_file(`${document.fileNameStem}.csv`, csv, "text/csv;charset=utf-8");
  };

  const handle_export_pdf = () => {
    const document = build_export_document();
    const pdf = map_tabular_export_to_pdf_bytes(document);
    download_binary_file(`${document.fileNameStem}.pdf`, pdf, "application/pdf");
  };

  return (
    <div className="w-full">
      <WeightChartControls
        range={range}
        on_range_change={setRange}
        x_label_size={xLabelSize}
        on_x_label_size_change={setXLabelSize}
      />
      <ChartExportButtons
        className="mb-3 flex flex-wrap items-center gap-2"
        onExportCsv={handle_export_csv}
        onExportPdf={handle_export_pdf}
        disabled={visibleData.length === 0}
      />

      <div className="relative h-[18rem] w-full sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={visibleData} margin={chartMargin}>
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
            tick={{ fill: "var(--muted-foreground)", fontSize: xTickFontSize }}
            minTickGap={isMobile ? 28 : 16}
            interval={isMobile ? "preserveStartEnd" : undefined}
          />
          <YAxis
            domain={yDomain}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: yTickFontSize }}
            width={yAxisWidth}
          />
          {showCalories && (
            <YAxis
              yAxisId="calories"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: yTickFontSize }}
              width={yAxisWidth}
            />
          )}

          {showWellnessAxis && (
            <YAxis
              yAxisId="wellness"
              orientation={wellnessOrientation as "left" | "right"}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: yTickFontSize }}
              width={yAxisWidth}
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
            dot={{
              fill: "var(--primary)",
              strokeWidth: isMobile ? 1.5 : 2,
              r: isMobile ? 3.5 : 5,
              stroke: "var(--primary)",
            }}
            activeDot={{ r: isMobile ? 5 : 7, stroke: "red", strokeWidth: 2, fill: "var(--card)" }}
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

        <div className="absolute top-2 right-2 hidden flex-col gap-1 text-xs sm:flex">
          {BMI_LEGEND_ITEMS.map((item) => (
            <div key={item.desktopLabel} className="flex items-center gap-1">
              <div className={`h-3 w-3 rounded ${item.colorClass}`} />
              <span className="text-muted-foreground">{item.desktopLabel}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] sm:hidden">
        {BMI_LEGEND_ITEMS.map((item) => (
          <div key={item.mobileLabel} className="flex items-center gap-1">
            <div className={`h-2.5 w-2.5 rounded ${item.colorClass}`} />
            <span className="text-muted-foreground">{item.mobileLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
