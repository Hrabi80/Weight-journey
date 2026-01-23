"use client";

import { useMemo, useState } from "react";
import { Activity } from "lucide-react";

import { Dashboard, Profile, WeightEntry } from "@/components/dashboard";
import { QuestionnaireForm, QuestionnaireData } from "@/components/questionnaire-form";
import { SignupForm } from "@/components/signup-form";
import { Button } from "@/components/ui/button";
import { Box, Flex } from "@/components/layout";
import { calculateBMI } from "@/lib/bmi";

type AppState = "questionnaire" | "signup" | "dashboard" | "demo";

const generateDemoData = (): { profile: Profile; entries: WeightEntry[] } => {
  const today = new Date();
  const entries: WeightEntry[] = [];
  let weight = 95;

  for (let i = 29; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    weight = weight - Math.random() * 0.3 + Math.random() * 0.15;
    weight = Math.max(weight, 82);
    entries.push({
      id: `demo-${i}`,
      weight: parseFloat(weight.toFixed(1)),
      recordedAt: date.toISOString(),
    });
  }

  return {
    profile: { height: 175, age: 30, initialWeight: 95 },
    entries,
  };
};

const buildUserSession = (data: QuestionnaireData): { profile: Profile; entries: WeightEntry[] } => {
  const today = new Date();
  const entries: WeightEntry[] = [];
  let weight = data.weight;

  for (let i = 14; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Gentle downward trend with small daily noise.
    weight = weight - (Math.random() * 0.25) + Math.random() * 0.1;
    entries.push({
      id: `user-${i}`,
      weight: parseFloat(weight.toFixed(1)),
      recordedAt: date.toISOString(),
    });
  }

  return {
    profile: {
      height: data.height,
      age: data.age,
      initialWeight: data.weight,
    },
    entries,
  };
};

export default function Home() {
  const [state, setState] = useState<AppState>("questionnaire");
  const [userData, setUserData] = useState<QuestionnaireData | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [isLogin, setIsLogin] = useState(false);

  const fallbackData = useMemo(
    () => ({
      age: 30,
      weight: 82,
      height: 170,
      bmiResult: calculateBMI(82, 170),
    }),
    [],
  );

  const handleQuestionnaireComplete = (data: QuestionnaireData) => {
    setUserData(data);
    setState("signup");
  };

  const handleSignupComplete = () => {
    const baseData = userData ?? fallbackData;
    const session = buildUserSession(baseData);
    setProfile(session.profile);
    setEntries(session.entries);
    setState("dashboard");
  };

  const handleDemoMode = () => {
    const session = generateDemoData();
    setProfile(session.profile);
    setEntries(session.entries);
    setState("demo");
  };

  const handleLogout = () => {
    setUserData(null);
    setProfile(null);
    setEntries([]);
    setState("questionnaire");
  };

  if (state === "dashboard" && profile) {
    return (
      <Dashboard
        key={`dashboard-${profile.initialWeight}`}
        profile={profile}
        entries={entries}
        onLogout={handleLogout}
      />
    );
  }

  if (state === "demo" && profile) {
    return (
      <Dashboard
        key={`demo-${profile.initialWeight}`}
        profile={profile}
        entries={entries}
        onLogout={handleLogout}
        demoMode
      />
    );
  }

  return (
    <>
      {state === "questionnaire" && (
        <Flex gap={"sm"} justify={"space-between"} direction={"column"} shadow={"xl"} color="yellow">
       <div className="py-4 w-[100px]" style={{backgroundColor:"red"}}>01</div>
       <Box className="py-6 background-red">

      
        <Box className="min-h-screen align-center" shadow={"xl"} px={"xl"} py="xl" radius="xl" mt={"xs"} ml={"xl"} >
          <div className="text-center mb-8 ">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Activity className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-serif font-bold text-foreground">WeightWise mm</h1>
            </div>
            <p className="text-muted-foreground max-w-md align-center mx-auto">
              Your personal weight tracking companion. Start your journey to a healthier youddd.
            </p>
          </div>
          <QuestionnaireForm onComplete={handleQuestionnaireComplete} />
          <div className="mt-6 flex flex-col items-center gap-3">
            <button
              onClick={() => {
                setIsLogin(true);
                setState("signup");
              }}
              className="text-sm text-primary hover:underline"
            >
              Already have an account? Sign in
            </button>
            <Button variant="outline" onClick={handleDemoMode} className="text-sm">
              Try Demo Mode
            </Button>
          </div>
        </Box>
         </Box>
        <div className="py-8">03</div>
        </Flex>
      )}

      {state === "signup" && (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex flex-col items-center justify-center p-4">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Activity className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-serif font-bold text-foreground">WeightWise</h1>
            </div>
          </div>
          <SignupForm
            userData={userData ?? fallbackData}
            onComplete={handleSignupComplete}
            onToggleMode={() => setIsLogin((prev) => !prev)}
            isLogin={isLogin}
          />
          {!isLogin && (
            <button
              onClick={() => setState("questionnaire")}
              className="mt-6 text-sm text-muted-foreground hover:text-primary"
            >
              ← Back to questionnaire
            </button>
          )}
        </div>
      )}
    </>
  );
}
