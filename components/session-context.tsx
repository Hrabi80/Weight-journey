"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { generateDemoData } from "@/lib/session";
import { Profile, QuestionnaireData, WeightEntry } from "@/lib/types";
import type { WellnessEntry } from "@/src/domaine/entities/wellness-entry.entity";

type SessionValue = {
  profile: Profile | null;
  entries: WeightEntry[];
  wellnessEntries: WellnessEntry[];
  questionnaireData: QuestionnaireData | null;
  isDemo: boolean;
  loading: boolean;
  email: string | null;
  saveQuestionnaire: (data: QuestionnaireData) => void;
  completeSignup: (overrideData?: QuestionnaireData) => Promise<void>;
  startDemo: () => { profile: Profile; entries: WeightEntry[] };
  reset: () => Promise<void>;
  addWeight: (weight: number) => Promise<void>;
  logWellness: (metric: WellnessEntry["metric"], value: number, date?: string) => Promise<void>;
  refreshFromBackend: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [wellnessEntries, setWellnessEntries] = useState<WellnessEntry[]>([]);
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetState = useCallback(() => {
    setProfile(null);
    setEntries([]);
    setWellnessEntries([]);
    setQuestionnaireData(null);
    setIsDemo(false);
  }, []);

  const refreshFromBackend = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      if (!res.ok) {
        if (res.status === 401) resetState();
        return;
      }
      const data = await res.json();
      setProfile(
        data.profile
          ? {
              email: data.profile.email,
              height: data.profile.height,
              age: data.profile.age,
              initialWeight: data.profile.initialWeight,
            }
          : null,
      );
      setEntries(data.entries ?? []);
      setWellnessEntries(data.wellnessEntries ?? []);
      setIsDemo(false);
    } finally {
      setLoading(false);
    }
  }, [resetState]);

  useEffect(() => {
    void refreshFromBackend();
  }, [refreshFromBackend]);

  const startDemo = useCallback(() => {
    const session = generateDemoData();
    setProfile(session.profile);
    setEntries(session.entries);
    setWellnessEntries([]);
    setQuestionnaireData(null);
    setIsDemo(true);
    return session;
  }, []);

  const saveQuestionnaire = useCallback((data: QuestionnaireData) => {
    setQuestionnaireData(data);
    setIsDemo(false);
  }, []);

  const completeSignup = useCallback(
    async (overrideData?: QuestionnaireData) => {
      const source = overrideData ?? questionnaireData;
      if (!source?.email || !source.password) {
        throw new Error("Email and password are required to sign up.");
      }

      setLoading(true);
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: source.email,
            password: source.password,
            age: source.age,
            height: source.height,
            weight: source.weight,
          }),
        });

        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.error ?? "Signup failed");
        }

        const data = await res.json();
        setProfile({
          email: data.profile.email,
          height: data.profile.height,
          age: data.profile.age,
          initialWeight: data.profile.initialWeight,
        });
        setEntries(data.entries ?? []);
        setWellnessEntries([]);
        setQuestionnaireData(source);
        setIsDemo(false);
      } finally {
        setLoading(false);
      }
    },
    [questionnaireData],
  );

  const addWeight = useCallback(async (weight: number) => {
    if (isDemo) {
      setEntries((prev) => [
        ...prev,
        { id: `local-${Date.now()}`, weight, date: new Date().toISOString().split("T")[0] },
      ]);
      return;
    }

    const res = await fetch("/api/weight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weight }),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new Error(payload.error ?? "Could not save weight.");
    }

    const data = await res.json();
    setEntries((prev) => [...prev.filter((e) => e.date !== data.entry.date), data.entry]);
  }, [isDemo]);

  const logWellness = useCallback(
    async (metric: WellnessEntry["metric"], value: number, date?: string) => {
      if (isDemo) {
        setWellnessEntries((prev) => [
          ...prev.filter((w) => !(w.metric === metric && w.date === (date ?? w.date))),
          {
            id: `local-${Date.now()}`,
            email: "demo@example.com",
            metric,
            value,
            date: date ?? new Date().toISOString().split("T")[0],
            created_at: new Date().toISOString(),
          },
        ]);
        return;
      }

      const res = await fetch("/api/wellness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metric, value, date }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error ?? "Could not log wellness metric.");
      }

      const data = await res.json();
      setWellnessEntries((prev) => [
        ...prev.filter((w) => !(w.metric === data.entry.metric && w.date === data.entry.date)),
        data.entry,
      ]);
    },
    [isDemo],
  );

  const reset = useCallback(async () => {
    if (!isDemo) {
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    }
    resetState();
  }, [resetState, isDemo]);

  const value = useMemo(
    () => ({
      profile,
      email: profile?.email ?? null,
      entries,
      wellnessEntries,
      questionnaireData,
      isDemo,
      loading,
      saveQuestionnaire,
      completeSignup,
      startDemo,
      reset,
      addWeight,
      logWellness,
      refreshFromBackend,
    }),
    [
      profile,
      entries,
      wellnessEntries,
      questionnaireData,
      isDemo,
      loading,
      saveQuestionnaire,
      completeSignup,
      startDemo,
      reset,
      addWeight,
      logWellness,
      refreshFromBackend,
    ],
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
