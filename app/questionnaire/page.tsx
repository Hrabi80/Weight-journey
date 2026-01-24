"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Activity } from "lucide-react";

import { QuestionnaireForm } from "@/components/questionnaire-form";
import { SignupForm } from "@/components/signup-form";
import { useSession } from "@/components/session-context";
import { Box, Flex, Text, Title } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { FALLBACK_QUESTIONNAIRE } from "@/lib/session";
import { QuestionnaireData } from "@/lib/types";

type Step = "questionnaire" | "signup";

export default function QuestionnairePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const step: Step = searchParams.get("step") === "signup" ? "signup" : "questionnaire";
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") === "login");

  const { questionnaireData, saveQuestionnaire, completeSignup } = useSession();

  const fallbackData = useMemo(() => FALLBACK_QUESTIONNAIRE, []);

  const handleQuestionnaireComplete = (data: QuestionnaireData) => {
    saveQuestionnaire(data);
    const query = new URLSearchParams();
    query.set("step", "signup");
    if (isLogin) query.set("mode", "login");
    router.replace(`/questionnaire?${query.toString()}`);
  };

  const handleSignupComplete = () => {
    completeSignup();
    router.replace("/dashboard");
  };

  const handleDemoMode = () => {
    router.push("/dashboard?demo=1");
  };

  return (
    <Flex className="min-h-screen" align="center" justify="center" px="md" py="xl">
      <Box className="w-full max-w-4xl rounded-3xl bg-card shadow-xl border border-border/60 p-6 sm:p-10">
        <Flex align="center" justify="center" gap="xs" className="mb-6">
          <Activity className="h-8 w-8 text-primary" />
          <Title order={1} size="h3" fw="bold" className="font-serif text-foreground">
            WeightWise
          </Title>
        </Flex>
        <Text className="text-center text-muted-foreground mb-6">
          {step === "questionnaire"
            ? "Answer a few quick questions so we can tailor your dashboard."
            : isLogin
              ? "Sign in to continue tracking your journey."
              : "Create an account to save your progress."}
        </Text>

        {step === "questionnaire" ? (
          <>
            <QuestionnaireForm onComplete={handleQuestionnaireComplete} />
            <Flex direction={{ base: "column", sm: "row" }} justify="center" gap="sm" mt="md">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsLogin(true);
                  router.replace("/questionnaire?step=signup&mode=login");
                }}
              >
                Already have an account? Sign in
              </Button>
              <Button variant="outline" onClick={handleDemoMode}>
                Try Demo Mode
              </Button>
              <Button variant="ghost" onClick={() => router.push("/")}>
                Back home
              </Button>
            </Flex>
          </>
        ) : (
          <>
            <SignupForm
              userData={questionnaireData ?? fallbackData}
              onComplete={handleSignupComplete}
              onToggleMode={() => setIsLogin((prev) => !prev)}
              isLogin={isLogin}
            />
            {!isLogin && (
              <Button
                variant="ghost"
                className="mt-4"
                onClick={() => router.replace("/questionnaire")}
              >
                ← Back to questionnaire
              </Button>
            )}
          </>
        )}
      </Box>
    </Flex>
  );
}
