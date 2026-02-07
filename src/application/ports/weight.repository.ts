import { WeightEntry } from "@/src/domaine/entities/weight-entry.entity";

/**
 * Data required to create a weight entry.
 * The database generates the id.
 */
export type CreateWeightEntryInput = Omit<WeightEntry, "id">;
/**
 * A patch for updating an existing weight entry.
 */
export type UpdateWeightEntryPatch = Pick<WeightEntry, "weight">;
/**
 * WeightRepository is a port used by use cases.
 */
export interface WeightRepository {
  /**
   * Creates a weight entry for a user.
   *
   * @param input - Weight entry fields (username, weight, date).
   * @returns The created entry including its id.
   */
  create(input: CreateWeightEntryInput): Promise<WeightEntry>;

  /**
   * Lists all weight entries for a given user.
   *
   * @param username - Owner username.
   * @returns A list of weight entries (often sorted by date desc).
   */
  list_by_username(username: string): Promise<WeightEntry[]>;

  /**
   * Finds a weight entry by username + date.
   * This supports the "one weight per day" rule.
   *
   * @param username - Owner username.
   * @param date - YYYY-MM-DD.
   * @returns The entry if exists, otherwise null.
   */
  find_by_username_and_date(username: string, date: string): Promise<WeightEntry | null>;

  /**
   * Updates an existing weight entry by id.
   *
   * @param id - Entry id.
   * @param patch - Fields to update.
   * @returns Updated entry.
   */
  update_by_id(id: string, patch: UpdateWeightEntryPatch): Promise<WeightEntry>;
}