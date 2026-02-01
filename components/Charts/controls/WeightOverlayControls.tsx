"use client";

import { Flame, Footprints, Layers, Moon } from "lucide-react";

import type { WellnessMetric } from "@/components/Charts/types";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface WeightOverlayControlsProps {
  overlayEnabled: boolean;
  metric: WellnessMetric;
  onToggleOverlay: () => void;
  onMetricChange: (metric: WellnessMetric) => void;
}

export function WeightOverlayControls({
  overlayEnabled,
  metric,
  onToggleOverlay,
  onMetricChange,
}: WeightOverlayControlsProps) {
  return (
    <div className="mb-3 flex flex-col gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={overlayEnabled ? "secondary" : "outline"}
          size="sm"
          onClick={onToggleOverlay}
        >
          {overlayEnabled ? "Back to weight only" : "Overlay wellness"}
        </Button>
        {overlayEnabled && (
          <span className="text-xs text-muted-foreground">
            Compare weight vs. sleep, calories, and steps
          </span>
        )}
      </div>

      {overlayEnabled && (
        <ToggleGroup
          type="single"
          value={metric}
          onValueChange={(value) => {
            if (value) onMetricChange(value as WellnessMetric);
          }}
          className="justify-start"
        >
          <ToggleGroupItem value="all" aria-label="Show all metrics" className="gap-1">
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">All</span>
          </ToggleGroupItem>

          <ToggleGroupItem value="sleep" aria-label="Show sleep overlay" className="gap-1">
            <Moon className="h-4 w-4" />
            <span className="hidden sm:inline">Sleep</span>
          </ToggleGroupItem>

          <ToggleGroupItem value="calories" aria-label="Show calories overlay" className="gap-1">
            <Flame className="h-4 w-4" />
            <span className="hidden sm:inline">Calories</span>
          </ToggleGroupItem>

          <ToggleGroupItem value="steps" aria-label="Show steps overlay" className="gap-1">
            <Footprints className="h-4 w-4" />
            <span className="hidden sm:inline">Steps</span>
          </ToggleGroupItem>
        </ToggleGroup>
      )}
    </div>
  );
}
