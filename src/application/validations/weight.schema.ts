import { z } from "zod";
import { simpleDateSchema } from "./date.schema";
import { createProfileSchema } from "./profile.schema";

export const logWeightSchema = z.object({
  email: createProfileSchema.shape.email,
  weight: z.number().positive("Weight must be positive."),
  date: simpleDateSchema,
});

export type LogWeightEntryInput = z.infer<typeof logWeightSchema>;

export const listWeightSchema =  z.object({
  email: createProfileSchema.shape.email,
});
export type ListWeightEntriesInput = z.infer<typeof listWeightSchema>;

/**
 * A single point for the weight chart.
 */
export type WeightSeriesPoint = {
  date: string; 
  weight: number;
};

export type WeightDashboardSeries = WeightSeriesPoint[];

export const getSeriesSchema = z.object({
  // Reuse the exact same validation rules as profile creation.
  email: createProfileSchema.shape.email,
});

export type weightSerieInput =  z.infer<typeof getSeriesSchema>