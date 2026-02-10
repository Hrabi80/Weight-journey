"use client";

import { Box } from "@/components/layout";

import { Profile, WeightEntry } from "@/lib/types";
import { DemoModeAlert } from "./ui/DemoModeAlert";
import { useDashboardState } from "./use-dashboard-state";
import { KpiGrid } from "./ui/KPIGrid";
import { ProgressSection } from "./ui/progressSection";
import { LogWeightCard } from "./ui/logWeightCard";

interface DashboardProps {
  profile: Profile;
  entries: WeightEntry[];
  onLogout: () => void;
  demoMode?: boolean;
  wellnessEntries?: import("@/src/domaine/entities/wellness-entry.entity").WellnessEntry[];
}
/**
 * Dashboard composition component.
 *
 * note:
 * This component should stay small:
 * - it wires state (hook) to UI sections
 * - it does not contain business logic or long JSX blocks
 */
export function Dashboard(props: DashboardProps) {
  const { profile, entries, demoMode = false } = props;
  const state = useDashboardState({
    profile,
    entries,
    wellnessEntries: props.wellnessEntries,
  });

  return (
    <Box className="min-h-screen bg-background">
      <Box as="main" className="container mx-auto max-w-6xl" px="md" py="xl">
        <DemoModeAlert demoMode={demoMode} />
        <KpiGrid
          latestWeight={state.latestWeight}
          weightChange={state.weightChange}
          lastDelta={state.lastDelta}
          bmiResult={state.bmiResult}
        />
        <LogWeightCard
          newWeight={state.newWeight}
          status={state.status}
          demoMode={demoMode}
          on_change_weight={state.set_new_weight}
          on_add_weight={state.add_weight}
          on_log_sleep={state.log_sleep}
          on_log_calories={state.log_calories}
          on_log_steps={state.log_steps}
        />
        <ProgressSection
          weights={state.weights}
          height={profile.height}
          sleep={state.sleepEntries}
          calories={state.caloriesEntries}
          steps={state.stepsEntries}
        />
      </Box>
    </Box>
  );
}
