"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { OnboardingStepperForm } from "@/components/onboarding/onboarding-stepper-form";
import { useSession } from "@/components/session-context";
import { QuestionnaireData } from "@/lib/types";
import { Flex } from "@/components/layout";
import { OnboardingResult } from "@/components/onboarding/onboarding-schema";

export default function PageClient() {
  const router = useRouter();
  const { saveQuestionnaire, completeSignup, startDemo } = useSession();

  const handleComplete = (data: OnboardingResult) => {
    const questionnaireData: QuestionnaireData = {
      age: data.age,
      weight: data.weight,
      height: data.height,
      bmiResult: data.bmiResult,
    };

    saveQuestionnaire(questionnaireData);
    completeSignup(questionnaireData);
  };

  return (
    <>
      <OnboardingStepperForm onComplete={handleComplete} />

      <Flex direction={{ base: "column", sm: "row" }} justify="center" gap="sm" mt="md">
        <Button
          variant="outline"
          onClick={() => {
            startDemo();
            router.push("/dashboard?demo=1");
          }}
        >
          Try Demo Mode
        </Button>
        <Button variant="ghost" onClick={() => router.push("/")}>
          Back home
        </Button>
      </Flex>
    </>
  );
}
