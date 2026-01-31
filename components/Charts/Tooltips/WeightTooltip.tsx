import { TooltipProps } from "recharts";
type ChartTooltipPayload = {
  displayDate: string;
  weight: number;
  bmi: number;
};
export function WeightTooltip({ active, payload }: TooltipProps<number, string>) {
  if (active && payload && payload.length) {
    const entry = payload[0]?.payload as ChartTooltipPayload | undefined;
    if (!entry) return null;

    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground">{entry.displayDate}</p>
        <p className="text-lg font-bold text-primary">{entry.weight} kg</p>
        <p className="text-xs text-muted-foreground">BMI: {entry.bmi.toFixed(1)}</p>
      </div>
    );
  }
  return null;
}