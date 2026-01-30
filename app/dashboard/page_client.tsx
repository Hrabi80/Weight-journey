"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";

import { Spinner } from "@/components/spinner";
import { useSession } from "@/components/session-context";
import { demoWellness } from "@/lib/demo-data";
import { Dashboard } from "@/components/Dashboard";

interface PageClientProps {
  demoMode: boolean;
}

/**
 * note:
 * This file is a "gate":
 * - decides whether user can see dashboard
 * - starts demo mode if requested
 * - redirects if profile is missing
 * The UI lives in the Dashboard component.
 */
export default function PageClient({ demoMode }: PageClientProps) {
  const router = useRouter();
  const { profile, entries, isDemo, startDemo, reset } = useSession();

  // Prevent double-invocation issues in dev StrictMode
  const demoStartedRef = useRef(false);

  useEffect(() => {
    // If URL requests demo but session isn't in demo yet → start demo once.
    if (demoMode && !isDemo && !demoStartedRef.current) {
      startDemo();
      demoStartedRef.current = true;
      return;
    }
    // If not demo and no profile → user hasn’t onboarded yet.
    if (!demoMode && !profile) {
      router.replace("/questionnaire");
    }
  }, [demoMode, isDemo, profile, startDemo, reset, router]);

  const canRender = useMemo(() => {
    return demoMode ? isDemo : Boolean(profile);
  }, [demoMode, isDemo, profile]);

  if (!canRender) {
    return <Spinner label="Loading dashboard…" fullScreen />;
  }

  return (
    <Dashboard
      key={demoMode ? "demo" : profile!.initialWeight}
      profile={profile!}
      entries={entries}
      demoMode={demoMode}
      demoWellness={demoMode ? demoWellness : undefined}
      onLogout={() => {
        reset();
        router.replace("/");
      }}
    />
  );
}
