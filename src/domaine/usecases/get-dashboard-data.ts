import type { ProfileRepository } from "../repositories/profile-repository";
import type { WeightRepository } from "../repositories/weight-repository";
import type { WellnessRepository } from "../repositories/wellness-repository";
import type { Profile } from "../entities/profile.entity";
import type { WeightEntry } from "../entities/weight-entry.entity";
import type { WellnessEntry } from "../entities/wellness-entry.entity";

type Output = {
  profile: Profile | null;
  weightEntries: WeightEntry[];
  wellnessEntries: WellnessEntry[];
};

export class GetDashboardDataUseCase {
  constructor(
    private readonly profileRepo: ProfileRepository,
    private readonly weightRepo: WeightRepository,
    private readonly wellnessRepo: WellnessRepository,
  ) {}

  async execute(username: string): Promise<Output> {
    const [profile, weightEntries, wellnessEntries] = await Promise.all([
      this.profileRepo.getByUsername(username),
      this.weightRepo.list(username),
      this.wellnessRepo.list(username),
    ]);

    return { profile, weightEntries, wellnessEntries };
  }
}
