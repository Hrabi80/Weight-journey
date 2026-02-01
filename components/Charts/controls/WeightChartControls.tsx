"use client";

import { CalendarRange, Type } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RangeMode, XLabelSize } from "../types";

interface WeightChartControlsProps {
  range: RangeMode;
  on_range_change: (value: RangeMode) => void;
  x_label_size: XLabelSize;
  on_x_label_size_change: (value: XLabelSize) => void;
}

export function WeightChartControls({
  range,
  on_range_change,
  x_label_size,
  on_x_label_size_change,
}: WeightChartControlsProps) {
  return (
    <div className="mb-3 flex flex-col gap-3 rounded-lg border border-border/60 bg-muted/40 px-3 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <CalendarRange className="h-4 w-4 text-primary" />
        <span>Time range</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={range} onValueChange={(v) => on_range_change(v as RangeMode)}>
          <SelectTrigger className="h-10 w-[190px] border-border/70">
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

        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Type className="h-4 w-4 text-primary" />
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
    </div>
  );
}
