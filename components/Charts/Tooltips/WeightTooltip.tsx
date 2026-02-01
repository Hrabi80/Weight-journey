import { TooltipProps } from "recharts";

interface WeightTooltipProps extends TooltipProps<number, string> {
  overlayEnabled?: boolean;
  showSleep?: boolean;
  showCalories?: boolean;
  showSteps?: boolean;
}
type ChartTooltipPayload = {
  displayDate: string;
  weight: number;
  bmi: number;
  sleep?: number;
  calories?: number;
  steps?: number;
};
export function WeightTooltip({
  active,
  payload,
  overlayEnabled = false,
  showSleep = false,
  showCalories = false,
  showSteps = false,
}: WeightTooltipProps) {
  if (active && payload && payload.length) {
    const entry = payload[0]?.payload as ChartTooltipPayload | undefined;
    if (!entry) return null;

    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground">{entry.displayDate}</p>
        <p className="text-lg font-bold text-primary">{entry.weight} kg</p>
        <p className="text-xs text-muted-foreground">BMI: {entry.bmi.toFixed(1)}</p>
        {overlayEnabled && (
          <div className="mt-2 space-y-1 text-sm">
            {showSleep && entry.sleep !== undefined && (
              <p className="text-foreground">
                Sleep: <span className="font-semibold">{entry.sleep} h</span>
              </p>
            )}
            {showCalories && entry.calories !== undefined && (
              <p className="text-foreground">
                Calories: <span className="font-semibold">{entry.calories} kcal</span>
              </p>
            )}
            {showSteps && entry.steps !== undefined && (
              <p className="text-foreground">
                Steps: <span className="font-semibold">{entry.steps.toLocaleString()}</span>
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
  return null;
}
