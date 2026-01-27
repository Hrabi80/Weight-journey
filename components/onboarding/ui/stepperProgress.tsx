import { cn } from "@/lib/utils";

interface StepperProgressProps {
  /** 1-based current step number (e.g. 1..total) */
  current: number;
  /** total number of steps (e.g. 5) */
  total: number;
  className?: string;
  /** width class for each segment (keeps  current design by default) */
  segment_class_name?: string;
}

/**
 * Progress indicator used by the onboarding stepper.
 *
 * Junior note:
 * - This component is "dumb": it only renders UI.
 * - Business logic (validation, moving between steps) must live elsewhere (hook/controller).
 */
export function StepperProgress({
  current,
  total,
  className,
  segment_class_name,
}: StepperProgressProps) {
  const safe_total = Math.max(1, total);
  const safe_current = Math.min(Math.max(current, 1), safe_total);

  return (
    <div className={cn("flex gap-1 justify-center mt-3", className)}>
      {Array.from({ length: safe_total }).map((_, index) => (
        <div
          // index is stable here because it's derived from a fixed-length array
          key={index}
          className={cn(
            "h-1.5 rounded-full transition-colors",
            segment_class_name ?? "w-12",
            index < safe_current ? "bg-primary" : "bg-muted",
          )}
        />
      ))}
    </div>
  );
}
