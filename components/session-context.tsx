"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  DashboardSession,
  DashboardSessionRepository,
} from "@/src/application/ports/dashboard-session.repository";
import type { Profile, QuestionnaireData, WeightEntry } from "@/lib/types";
import type { WellnessEntry } from "@/src/domaine/entities/wellness-entry.entity";
import { BackendDashboardSessionRepository } from "@/src/infrastructure/repositories/backend-dashboard-session.repository";
import { DemoDashboardSessionRepository } from "@/src/infrastructure/repositories/demo-dashboard-session.repository";

type SessionMode = "backend" | "demo";

type ProfileApiPayload = {
  email?: string;
  age?: number;
  height?: number;
  initialWeight?: number;
  initial_weight?: number;
};

type CreateProfileApiResponse = {
  profile?: ProfileApiPayload;
  email?: string;
  age?: number;
  height?: number;
  initialWeight?: number;
  initial_weight?: number;
  entries?: WeightEntry[];
  wellnessEntries?: WellnessEntry[];
  error?: string;
  message?: string;
};

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
const backend_session_repo = new BackendDashboardSessionRepository();
const demo_session_repo = new DemoDashboardSessionRepository();

function today_key(): string {
  return new Date().toISOString().split("T")[0];
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [wellnessEntries, setWellnessEntries] = useState<WellnessEntry[]>([]);
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData | null>(null);
  const [mode, setMode] = useState<SessionMode>("backend");
  const [loading, setLoading] = useState(false);
  const isDemo = mode === "demo";

  const get_active_repo = useCallback((): DashboardSessionRepository => {
    return mode === "demo" ? demo_session_repo : backend_session_repo;
  }, [mode]);

  const apply_session = useCallback(
    (session: DashboardSession, target_mode: SessionMode) => {
      setProfile(session.profile);
      setEntries(session.entries);
      setWellnessEntries(session.wellnessEntries);
      setMode(target_mode);
    },
    []
  );

  const resetState = useCallback(() => {
    setProfile(null);
    setEntries([]);
    setWellnessEntries([]);
    setQuestionnaireData(null);
    setMode("backend");
  }, []);

  const refreshFromBackend = useCallback(async () => {
    setLoading(true);
    try {
      const session = await backend_session_repo.load();
      if (!session) {
        resetState();
        return;
      }
      apply_session(session, "backend");
    } finally {
      setLoading(false);
    }
  }, [apply_session, resetState]);

  useEffect(() => {
    void refreshFromBackend();
  }, [refreshFromBackend]);

  const startDemo = useCallback(() => {
    const session = demo_session_repo.create_seed_session();
    apply_session(session, "demo");
    setQuestionnaireData(null);
    return {
      profile: session.profile,
      entries: session.entries,
    };
  }, [apply_session]);

  const saveQuestionnaire = useCallback((data: QuestionnaireData) => {
    setQuestionnaireData(data);
    setMode("backend");
  }, []);

  const completeSignup = useCallback(
    async (overrideData?: QuestionnaireData) => {
      const source = overrideData ?? questionnaireData;
      if (!source?.email || !source.password) {
        throw new Error("Email and password are required to sign up.");
      }

      setLoading(true);
      try {
        const sign_up_res = await fetch("/api/auth/sign-up", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: source.email,
            password: source.password,
          }),
        });

        if (sign_up_res.status === 409) {
          const sign_in_res = await fetch("/api/auth/sign-in", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: source.email,
              password: source.password,
            }),
          });

          if (!sign_in_res.ok) {
            const payload = (await sign_in_res.json().catch(() => null)) as
              | CreateProfileApiResponse
              | null;
            throw new Error(payload?.error ?? payload?.message ?? "Sign in failed");
          }
        } else if (!sign_up_res.ok) {
          const payload = (await sign_up_res.json().catch(() => null)) as
            | CreateProfileApiResponse
            | null;
          throw new Error(
            payload?.error ?? payload?.message ?? "Signup failed"
          );
        }

        const profile_res = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            age: source.age,
            height: source.height,
            initialWeight: source.weight,
          }),
        });

        if (!profile_res.ok) {
          const payload = (await profile_res.json().catch(() => null)) as
            | CreateProfileApiResponse
            | null;
          throw new Error(payload?.error ?? payload?.message ?? "Profile creation failed");
        }

        const data = (await profile_res.json()) as CreateProfileApiResponse;
        const profile_payload =
          data.profile && typeof data.profile === "object" ? data.profile : data;

        const initial_weight =
          typeof profile_payload.initialWeight === "number"
            ? profile_payload.initialWeight
            : profile_payload.initial_weight;

        if (
          typeof profile_payload.email !== "string" ||
          typeof profile_payload.age !== "number" ||
          typeof profile_payload.height !== "number" ||
          typeof initial_weight !== "number"
        ) {
          throw new Error("Invalid profile payload from server.");
        }

        apply_session(
          {
            profile: {
              email: profile_payload.email,
              height: profile_payload.height,
              age: profile_payload.age,
              initialWeight: initial_weight,
            },
            entries: data.entries ?? [],
            wellnessEntries: data.wellnessEntries ?? [],
          },
          "backend"
        );
        setQuestionnaireData(source);
      } finally {
        setLoading(false);
      }
    },
    [apply_session, questionnaireData],
  );

  const addWeight = useCallback(
    async (weight: number) => {
      const entry = await get_active_repo().log_weight(weight, today_key());
      setEntries((prev) => [
        ...prev.filter((existing_entry) => existing_entry.date !== entry.date),
        entry,
      ]);
    },
    [get_active_repo]
  );

  const logWellness = useCallback(
    async (metric: WellnessEntry["metric"], value: number, date?: string) => {
      const effective_date = date ?? today_key();
      const data = await get_active_repo().log_wellness({
        metric,
        value,
        date: effective_date,
      });

      setWellnessEntries((prev) => [
        ...prev.filter((entry) => !(entry.metric === data.metric && entry.date === data.date)),
        data,
      ]);
    },
    [get_active_repo],
  );

  const reset = useCallback(async () => {
    if (mode === "backend") {
      await fetch("/api/auth/sign-out", { method: "POST" }).catch(() => undefined);
    }
    resetState();
  }, [mode, resetState]);

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
