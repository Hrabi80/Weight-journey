import type { WellnessRepository } from "../repositories/wellness-repository";
import type { WellnessEntry, WellnessMetric } from "../entities/wellness-entry.entity";

type Input = { username: string; metric: WellnessMetric; value: number; date: string };

export class LogWellnessEntryUseCase {
  constructor(private readonly wellnessRepo: WellnessRepository) {}

  async execute(input: Input): Promise<WellnessEntry> {
    return this.wellnessRepo.upsert(input);
  }
}
