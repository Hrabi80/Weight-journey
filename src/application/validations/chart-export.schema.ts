import { z } from "zod";
import { simpleDateSchema } from "./date.schema";

export const chartRangeSchema = z.enum(["7d", "1m", "2m", "1y", "all"]);
export type ChartRange = z.infer<typeof chartRangeSchema>;

export const chartMetricFilterSchema = z.enum(["all", "sleep", "calories", "steps"]);
export type ChartMetricFilter = z.infer<typeof chartMetricFilterSchema>;

const optionalFiniteNumberSchema = z.number().finite().optional();
const optionalDisplayNameSchema = z.string().trim().min(1).max(80).optional();
const optionalEmailSchema = z.string().email().optional();

export const weightChartExportRowSchema = z.object({
  date: simpleDateSchema,
  weight: z.number().finite(),
  sleep: optionalFiniteNumberSchema,
  calories: optionalFiniteNumberSchema,
  steps: optionalFiniteNumberSchema,
});
export type WeightChartExportRow = z.infer<typeof weightChartExportRowSchema>;

export const wellnessChartExportRowSchema = z.object({
  date: simpleDateSchema,
  sleep: optionalFiniteNumberSchema,
  calories: optionalFiniteNumberSchema,
  steps: optionalFiniteNumberSchema,
});
export type WellnessChartExportRow = z.infer<typeof wellnessChartExportRowSchema>;

export const buildWeightChartExportInputSchema = z.object({
  range: chartRangeSchema,
  overlayEnabled: z.boolean(),
  showSleep: z.boolean(),
  showCalories: z.boolean(),
  showSteps: z.boolean(),
  userEmail: optionalEmailSchema,
  userDisplayName: optionalDisplayNameSchema,
  rows: z.array(weightChartExportRowSchema),
});
export type BuildWeightChartExportInput = z.infer<typeof buildWeightChartExportInputSchema>;

export const buildWellnessChartExportInputSchema = z.object({
  range: chartRangeSchema,
  metric: chartMetricFilterSchema,
  userEmail: optionalEmailSchema,
  userDisplayName: optionalDisplayNameSchema,
  rows: z.array(wellnessChartExportRowSchema),
});
export type BuildWellnessChartExportInput = z.infer<typeof buildWellnessChartExportInputSchema>;

export const tabularExportDocumentSchema = z.object({
  fileNameStem: z.string().min(1),
  appName: z.string().trim().min(1).default("WeightJourney"),
  logoText: z.string().trim().min(1).max(4).default("WJ"),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  userDisplayName: optionalDisplayNameSchema,
  userEmail: optionalEmailSchema,
  generatedAtIso: z.string().datetime().optional(),
  headers: z.array(z.string().min(1)).min(1),
  rows: z.array(z.array(z.string())),
});
export type TabularExportDocument = z.infer<typeof tabularExportDocumentSchema>;
