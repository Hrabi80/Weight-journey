
import type { WeightRepository } from "@/src/application/ports/weight.repository";
import { WeightEntry } from "@/src/domaine/entities/weight-entry.entity";
import { LogWeightEntryInput, logWeightSchema } from "@/src/application/validations/weight.schema";



/**
 * Business rule:
 * - Only ONE weight entry per user per day.
 * - If the user logs weight again for the same date, we override (update).
 */
export class LogWeightEntryUseCase {
  private readonly weightRepo: WeightRepository;

  public constructor(weightRepo: WeightRepository) {
    this.weightRepo = weightRepo;
  }

  /**
   * @param input - username, weight, date
   * @returns Created or updated WeightEntry.
   * @throws {z.ZodError} If validation fails.
   */
  public async execute(input: LogWeightEntryInput): Promise<WeightEntry> {
    const validated = logWeightSchema.parse(input);
    const normalizedUsername = validated.username.toLowerCase();

    const existing = await this.weightRepo.find_by_username_and_date(
      normalizedUsername,
      validated.date
    );

    if (!existing) {
      // First log of the day: create.
      return this.weightRepo.create({
        username: normalizedUsername,
        weight: validated.weight,
        date: validated.date,
      });
    }

    // Second log (or more) of the same day: override (update).
    return this.weightRepo.update_by_id(existing.id, { weight: validated.weight });
  }
}
