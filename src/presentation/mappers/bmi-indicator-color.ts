import type { BMICategory } from "@/src/domaine/services/bmi.service";

export function getUserWeightIndicatorColor(category: BMICategory): string {
  switch (category) {
    case "underweight":
      return "text-zone-underweight";
    case "healthy":
      return "text-primary";
    case "overweight":
      return "text-zone-overweight";
    case "obese":
      return "text-zone-obese";
  }
}
