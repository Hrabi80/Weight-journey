"use client";

import { Flame, Footprints, Layers, Moon } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type MetricMode = "all" | "sleep" | "calories" | "steps";
export type RangeMode = "7d" | "1m" | "2m" | "1y" | "all";
export type XLabelSize = "sm" | "md" | "lg";

interface WellnessChartControlsProps {
  metric: MetricMode;
  on_metric_change: (value: MetricMode) => void;
  range: RangeMode;
  on_range_change: (value: RangeMode) => void;
  x_label_size: XLabelSize;
  on_x_label_size_change: (value: XLabelSize) => void;
}

export function WellnessChartControls({
  metric,
  on_metric_change,
  range,
  on_range_change,
  x_label_size,
  on_x_label_size_change,
}: WellnessChartControlsProps) {
  return (
    <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <ToggleGroup
        type="single"
        value={metric}
        onValueChange={(value) => {
          if (value) on_metric_change(value as MetricMode);
        }}
        className="justify-start"
      >
        <ToggleGroupItem value="all" aria-label="Show all metrics" className="gap-2">
          <Layers className="h-4 w-4" />
          <span className="hidden sm:inline">All</span>
        </ToggleGroupItem>

        <ToggleGroupItem value="sleep" aria-label="Show sleep" className="gap-2">
          <Moon className="h-4 w-4" />
          <span className="hidden sm:inline">Sleep</span>
        </ToggleGroupItem>

        <ToggleGroupItem value="calories" aria-label="Show calories" className="gap-2">
          <Flame className="h-4 w-4" />
          <span className="hidden sm:inline">Calories</span>
        </ToggleGroupItem>

        <ToggleGroupItem value="steps" aria-label="Show steps" className="gap-2">
          <Footprints className="h-4 w-4" />
          <span className="hidden sm:inline">Steps</span>
        </ToggleGroupItem>
      </ToggleGroup>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={range} onValueChange={(v) => on_range_change(v as RangeMode)}>
          <SelectTrigger className="h-9 w-[170px]">
            <SelectValue placeholder="Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">This week</SelectItem>
            <SelectItem value="1m">Last month</SelectItem>
            <SelectItem value="2m">Last 2 months</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>

        <ToggleGroup
          type="single"
          value={x_label_size}
          onValueChange={(value) => {
            if (value) on_x_label_size_change(value as XLabelSize);
          }}
          className="justify-start"
        >
          <ToggleGroupItem value="sm" aria-label="Small x-axis labels">
            S
          </ToggleGroupItem>
          <ToggleGroupItem value="md" aria-label="Medium x-axis labels">
            M
          </ToggleGroupItem>
          <ToggleGroupItem value="lg" aria-label="Large x-axis labels">
            L
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
