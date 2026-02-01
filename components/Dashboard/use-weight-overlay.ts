import { useState } from "react";

import type { WellnessMetric } from "@/components/Charts/types";

/**
 * UI state for toggling the wellness overlay on the weight chart.
 * Keeps ProgressSection lean and reusable.
 */
export function useWeightOverlay() {
  const [overlayEnabled, setOverlayEnabled] = useState(false);
  const [overlayMetric, setOverlayMetric] = useState<WellnessMetric>("all");

  const toggleOverlay = () => setOverlayEnabled((prev) => !prev);

  return {
    overlayEnabled,
    overlayMetric,
    setOverlayMetric,
    toggleOverlay,
  };
}
