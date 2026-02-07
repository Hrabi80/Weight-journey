import { z } from "zod";

/**
 * Date string in YYYY-MM-DD format.
 */
export const simpleDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format.");
