import { WellnessEntry } from "@/src/domaine/entities/wellness-entry.entity";
import { WellnessRepository } from "../../ports/wellness.repository";
import { logWellnessSchema, UpsertWellnessEntryInput } from "../../validations/wellness.schema";


/**
 * Business rule:
 * - Only ONE wellness entry per user per metric per day.
 * - If user logs again for same metric+date => override (update).
 */
export class UpsertWellnessEntryUseCase {
  private readonly wellnessRepo: WellnessRepository;

  public constructor(wellnessRepo: WellnessRepository) {
    this.wellnessRepo = wellnessRepo;
  }

  /**
   * @param input - username, metric, value, date
   * @returns Created or updated WellnessEntry.
   * @throws {z.ZodError} If validation fails.
   */
  public async execute(input: UpsertWellnessEntryInput): Promise<WellnessEntry> {
    const validated = logWellnessSchema.parse(input);
    const normalizedUsername = validated.username.toLowerCase();

    const existing = await this.wellnessRepo.find_by_username_metric_date(
      normalizedUsername,
      validated.metric,
      validated.date
    );

    if (!existing) {
      return this.wellnessRepo.create({
        username: normalizedUsername,
        metric: validated.metric,
        value: validated.value,
        date: validated.date,
      });
    }

    return this.wellnessRepo.update_by_id(existing.id, { value: validated.value });
  }
}
