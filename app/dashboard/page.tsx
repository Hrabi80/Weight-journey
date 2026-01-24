"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Dashboard } from "@/components/dashboard";
import { useSession } from "@/components/session-context";
import { Spinner } from "@/components/spinner";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const wantsDemo = searchParams.has("demo");
  const { profile, entries, isDemo, startDemo, reset } = useSession();
  const demoLoaded = useRef(false);

  useEffect(() => {
    if (!wantsDemo && isDemo) {
      reset();
      router.replace("/questionnaire");
      return;
    }

    if (wantsDemo && !isDemo && !demoLoaded.current) {
      startDemo();
      demoLoaded.current = true;
      return;
    }

    if (!wantsDemo && !profile) {
      router.replace("/questionnaire");
    }
  }, [wantsDemo, isDemo, profile, startDemo, reset, router]);

  const canRender = useMemo(() => (wantsDemo ? isDemo : Boolean(profile)), [wantsDemo, isDemo, profile]);

  if (!canRender) {
    return <Spinner label="Loading dashboard…" fullScreen />;
  }

  return (
    <Dashboard
      key={wantsDemo ? "demo" : profile!.initialWeight}
      profile={profile!}
      entries={entries}
      onLogout={() => {
        reset();
        router.replace("/");
      }}
      demoMode={wantsDemo}
    />
  );
}
