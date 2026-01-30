export interface BMIResult {
  bmi: number;
  category: "underweight" | "healthy" | "overweight" | "obese";
  label: string;
  description: string;
}

export function calculateBMI(weightKg: number, heightCm: number): BMIResult {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  if (bmi < 18.5) {
    return {
      bmi,
      category: "underweight",
      label: "Underweight",
      description:
        "Your BMI indicates you may be underweight. Consider consulting a healthcare provider.",
    };
  }

  if (bmi < 25) {
    return {
      bmi,
      category: "healthy",
      label: "Healthy Weight",
      description:
        "Congratulations! Your BMI is within the healthy range. Keep up the good work!",
    };
  }

  if (bmi < 30) {
    return {
      bmi,
      category: "overweight",
      label: "Overweight",
      description:
        "Your BMI indicates you may be overweight. Small lifestyle changes can make a big difference.",
    };
  }

  return {
    bmi,
    category: "obese",
    label: "Obese",
    description:
      "Your BMI indicates obesity. We recommend consulting a healthcare provider for personalized advice.",
  };
}

export function getBMIForWeight(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function getWeightRanges(heightCm: number) {
  const heightM = heightCm / 100;
  const heightSquared = heightM * heightM;

  return {
    underweightMax: 18.5 * heightSquared,
    healthyMax: 25 * heightSquared,
    overweightMax: 30 * heightSquared,
    obeseLevel1Max: 35 * heightSquared,
    obeseLevel2Max: 40 * heightSquared,
  };
}

export const getUserWeighIndicatorColor = (category: string) => {
    switch (category) {
      case "underweight":
        return "text-zone-underweight";
      case "healthy":
        return "text-primary"; // keep palette, swap greens for orange accent
      case "overweight":
        return "text-zone-overweight";
      case "obese":
        return "text-zone-obese";
      default:
        return "text-primary";
    }
  };