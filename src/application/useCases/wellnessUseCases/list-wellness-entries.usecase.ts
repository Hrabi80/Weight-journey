import { WellnessRepository } from "../../ports/wellness.repository";
import { WellnessEntry } from "@/src/domaine/entities/wellness-entry.entity";
import { ListWellnessEntriesForMetricInput, listWellnessSchema } from "../../validations/wellness.schema";

/**
 * ListWellnessEntriesForMetricUseCase
 *
 * Fetches entries for a specific metric to plot on a chart.
 */
export class ListWellnessEntriesForMetricUseCase {
  private readonly wellnessRepo: WellnessRepository;

  public constructor(wellnessRepo: WellnessRepository) {
    this.wellnessRepo = wellnessRepo;
  }

  public async execute(input: ListWellnessEntriesForMetricInput): Promise<WellnessEntry[]> {
    const validated = listWellnessSchema.parse(input);
    const normalizedUsername = validated.username.toLowerCase();
    return this.wellnessRepo.list_by_username_and_metric(normalizedUsername, validated.metric);
  }
}
