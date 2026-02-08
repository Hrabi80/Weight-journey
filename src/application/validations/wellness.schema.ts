import { z } from "zod";
import { simpleDateSchema } from "./date.schema";
import { createProfileSchema } from "./profile.schema";
import { WellnessMetric } from "@/src/domaine/entities/wellness-entry.entity";

export const wellnessMetricSchema = z.enum(["sleep", "calories", "steps"]);

export const logWellnessSchema = z.object({
  email: createProfileSchema.shape.email,
  metric: wellnessMetricSchema,
  value: z.number().nonnegative("Value must be 0 or more."),
  date: simpleDateSchema,
});

export type UpsertWellnessEntryInput = z.infer<typeof logWellnessSchema>;


export const listWellnessSchema = z.object({
  email: createProfileSchema.shape.email,
  metric: wellnessMetricSchema,
});

export type ListWellnessEntriesForMetricInput = z.infer<typeof listWellnessSchema>;

export type WellnessSeriesPoint = {
  date: string; // YYYY-MM-DD
  value: number;
};

export type WellnessDashboardSeries = Record<WellnessMetric, WellnessSeriesPoint[]>;

export const getSeriesSchema = z.object({
  email: createProfileSchema.shape.email,
});

export type wellnessSerieInput =  z.infer<typeof getSeriesSchema>