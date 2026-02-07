import { WeightRepository } from "@/src/application/ports/weight.repository";
import { WeightEntry } from "@/src/domaine/entities/weight-entry.entity";
import {
  ListWeightEntriesInput,
  listWeightSchema,
} from "@/src/application/validations/weight.schema";

/**
 * ListWeightEntriesUseCase
 *
 * Fetches all weight entries for the dashboard chart.
 * Repository should return them sorted by date desc (recommended).
 */
export class ListWeightEntriesUseCase {
  private readonly weightRepo: WeightRepository;

  public constructor(weightRepo: WeightRepository) {
    this.weightRepo = weightRepo;
  }

  /**
   * @param input - username
   * @returns List of weight entries.
   * @throws {z.ZodError} If validation fails.
   */
  public async execute(input: ListWeightEntriesInput): Promise<WeightEntry[]> {
    const validated = listWeightSchema.parse(input);
    const normalizedUsername = validated.username.toLowerCase();

    return this.weightRepo.list_by_username(normalizedUsername);
  }
}
