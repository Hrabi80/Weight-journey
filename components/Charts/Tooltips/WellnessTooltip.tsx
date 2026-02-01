"use client";

import { format, parseISO } from "date-fns";
import type { TooltipProps } from "recharts";

type WellnessTooltipProps = TooltipProps<number, string>;

export function WellnessTooltip({
  active,
  payload,
  label,
}: WellnessTooltipProps) {
  if (!active || !payload || !payload.length || typeof label !== "string") {
    return null;
  }

  const sleep_val = payload.find((p) => p.dataKey === "sleep")?.value as
    | number
    | undefined;

  const calories_val = payload.find((p) => p.dataKey === "calories")?.value as
    | number
    | undefined;

  const steps_val = payload.find((p) => p.dataKey === "stepsK")?.payload?.steps as
    | number
    | undefined;

  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-sm">
      <p className="text-muted-foreground mb-1">
        {format(parseISO(label), "MMMM d, yyyy")}
      </p>

      {sleep_val !== undefined && (
        <p className="text-foreground">
          Sleep: <span className="font-semibold">{sleep_val} h</span>
        </p>
      )}

      {calories_val !== undefined && (
        <p className="text-foreground">
          Calories:{" "}
          <span className="font-semibold">{calories_val} kcal</span>
        </p>
      )}

      {steps_val !== undefined && (
        <p className="text-foreground">
          Steps:{" "}
          <span className="font-semibold">
            {steps_val.toLocaleString()} steps
          </span>
        </p>
      )}
    </div>
  );
}
