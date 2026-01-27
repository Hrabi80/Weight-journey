import { CardDescription, CardTitle } from "@/components/ui/card";
import { StepperProgress } from "./stepperProgress";

interface StepperHeaderProps {
  title: string;
  /** 1-based current step number */
  current: number;
  total: number;
}

/**
 * Header block for the stepper card (title + "Step x of y" + progress bar).
 *
 * Junior note:
 * - Keeping this in a dedicated component avoids re-creating the header markup in every stepper flow.
 * - It is still presentational (no state).
 */
export function StepperHeader({ title, current, total }: StepperHeaderProps) {
  return (
    <>
      <CardTitle className="text-2xl font-serif text-foreground">{title}</CardTitle>
      <CardDescription>
        Step {current} of {total}
      </CardDescription>

      <StepperProgress current={current} total={total} />
    </>
  );
}
