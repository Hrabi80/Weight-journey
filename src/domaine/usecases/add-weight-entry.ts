import type { WeightRepository } from "../repositories/weight-repository";
import type { WeightEntry } from "../entities/weight-entry.entity";

type Input = { username: string; weight: number; date?: string };

export class AddWeightEntryUseCase {
  constructor(private readonly weightRepo: WeightRepository) {}

  async execute(input: Input): Promise<WeightEntry> {
    return this.weightRepo.add(input);
  }
}
