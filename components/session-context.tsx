"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import {
  FALLBACK_QUESTIONNAIRE,
  buildUserSession,
  generateDemoData,
} from "@/lib/session";
import { Profile, QuestionnaireData, WeightEntry } from "@/lib/types";

type SessionValue = {
  profile: Profile | null;
  entries: WeightEntry[];
  questionnaireData: QuestionnaireData | null;
  isDemo: boolean;
  saveQuestionnaire: (data: QuestionnaireData) => void;
  completeSignup: (overrideData?: QuestionnaireData) => { profile: Profile; entries: WeightEntry[] };
  startDemo: () => { profile: Profile; entries: WeightEntry[] };
  reset: () => void;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const reset = useCallback(() => {
    setProfile(null);
    setEntries([]);
    setQuestionnaireData(null);
    setIsDemo(false);
  }, []);

  const startDemo = useCallback(() => {
    const session = generateDemoData();
    setProfile(session.profile);
    setEntries(session.entries);
    setQuestionnaireData(null);
    setIsDemo(true);
    return session;
  }, []);

  const saveQuestionnaire = useCallback((data: QuestionnaireData) => {
    setQuestionnaireData(data);
    setIsDemo(false);
  }, []);

  const completeSignup = useCallback(
    (overrideData?: QuestionnaireData) => {
      const source = overrideData ?? questionnaireData ?? FALLBACK_QUESTIONNAIRE;
      const session = buildUserSession(source);
      setProfile(session.profile);
      setEntries(session.entries);
      setQuestionnaireData(source);
      setIsDemo(false);
      return session;
    },
    [questionnaireData],
  );

  const value = useMemo(
    () => ({
      profile,
      entries,
      questionnaireData,
      isDemo,
      saveQuestionnaire,
      completeSignup,
      startDemo,
      reset,
    }),
    [profile, entries, questionnaireData, isDemo, saveQuestionnaire, completeSignup, startDemo, reset],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return ctx;
}
