"use client";

import { useMemo } from "react";
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
import { WeightTooltip } from "./Tooltips/WeightTooltip";

interface WeightChartProps {
  data: WeightEntry[];
  height: number;
}





export function WeightChart({ data, height }: WeightChartProps) {
  const ranges = useMemo(() => getWeightRanges(height), [height]);

  const chartData = useMemo(
    () =>
      data.map((entry) => ({
        ...entry,
        displayDate: format(new Date(entry.recordedAt), "MMM d"),
        bmi: getBMIForWeight(entry.weight, height),
      })),
    [data, height],
  );

  const yDomain = useMemo(() => {
    if (data.length === 0) return [50, 120];
    const weights = data.map((d) => d.weight);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const padding = (max - min) * 0.2 || 10;
    return [
      Math.floor(Math.min(min, ranges.underweightMax * 0.8) - padding),
      Math.ceil(Math.max(max, ranges.obeseLevel2Max) + padding),
    ];
  }, [data, ranges.obeseLevel2Max, ranges.underweightMax]);

  return (
    <div className="w-full h-80 relative">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
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
            dataKey="displayDate"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <YAxis
            domain={yDomain}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            width={40}
          />
          <Tooltip content={<WeightTooltip />} />

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
  );
}
