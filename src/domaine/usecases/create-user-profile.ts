import type { ProfileRepository } from "../repositories/profile-repository";
import type { WeightRepository } from "../repositories/weight-repository";
import type { Profile } from "../entities/profile.entity";
import type { WeightEntry } from "../entities/weight-entry.entity";

type Input = {
  authUserId: string;
  username: string;
  age: number;
  height: number;
  initialWeight: number;
  date?: string;
};

type Output = { profile: Profile; initialEntry: WeightEntry };

export class CreateUserProfileUseCase {
  constructor(
    private readonly profileRepo: ProfileRepository,
    private readonly weightRepo: WeightRepository,
  ) {}

  async execute(input: Input): Promise<Output> {
    const profile = await this.profileRepo.create({
      authUserId: input.authUserId,
      username: input.username,
      age: input.age,
      height: input.height,
      initialWeight: input.initialWeight,
    });

    const initialEntry = await this.weightRepo.add({
      username: input.username,
      weight: input.initialWeight,
      date: input.date,
    });

    return { profile, initialEntry };
  }
}
