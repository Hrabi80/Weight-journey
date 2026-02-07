import { WellnessEntry, WellnessMetric } from "@/src/domaine/entities/wellness-entry.entity";

/**
 * Data required to create a wellness entry.
 * The database generates id and created_at.
 */
export type CreateWellnessEntryInput = Omit<WellnessEntry, "id" | "created_at">;
/**
 * Patch for updating an existing wellness entry.
 */
export type UpdateWellnessEntryPatch = Pick<WellnessEntry, "value">;
/**
 * WellnessRepository is a port used by use cases.
 */

export interface WellnessRepository {
  /**
   * Creates a wellness entry (sleep/calories/steps).
   *
   * @param input - Wellness entry fields.
   * @returns The created entry including generated fields.
   */
  create(input: CreateWellnessEntryInput): Promise<WellnessEntry>;

  /**
   * Lists wellness entries for a user and metric.
   *
   * @param username - Owner username.
   * @param metric - Which metric to list.
   * @returns A list of entries (often sorted by date desc).
   */
  list_by_username_and_metric(
    username: string,
    metric: WellnessMetric
  ): Promise<WellnessEntry[]>;

   /**
   * Finds a wellness entry by username + metric + date.
   * This supports the "one metric value per day" rule.
   */
  find_by_username_metric_date(
    username: string,
    metric: WellnessMetric,
    date: string
  ): Promise<WellnessEntry | null>;

  /**
   * Updates an existing wellness entry by id.
   */
  update_by_id(id: string, patch: UpdateWellnessEntryPatch): Promise<WellnessEntry>;
}