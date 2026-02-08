import { WellnessEntry } from "@/src/domaine/entities/wellness-entry.entity";
import { WellnessRepository } from "../../ports/wellness.repository";
import { getSeriesSchema, WellnessDashboardSeries, wellnessSerieInput, WellnessSeriesPoint } from "@/src/application/validations/wellness.schema";

/**
 * GetWellnessDashboardSeriesUseCase
 *
 * Returns 3 series (sleep, calories, steps) for the combined wellness chart.
 * We keep the DTO simple so the UI just renders it.
 */
export class GetWellnessDashboardSeriesUseCase {
  private readonly wellness_repo: WellnessRepository;

  public constructor(wellness_repo: WellnessRepository) {
    this.wellness_repo = wellness_repo;
  }

  public async execute(input: wellnessSerieInput): Promise<WellnessDashboardSeries> {
    const validated = getSeriesSchema.parse(input);
    const normalizedEmail = validated.email.toLowerCase();

    const [sleep, calories, steps] = await Promise.all([
      this.wellness_repo.list_by_email_and_metric(normalizedEmail, "sleep"),
      this.wellness_repo.list_by_email_and_metric(normalizedEmail, "calories"),
      this.wellness_repo.list_by_email_and_metric(normalizedEmail, "steps"),
    ]);

    return {
      sleep: this.to_points(sleep),
      calories: this.to_points(calories),
      steps: this.to_points(steps),
    };
  }

  private to_points(entries: WellnessEntry[]): WellnessSeriesPoint[] {
    return entries.map((e) => ({ date: e.date, value: e.value }));
  }
}
