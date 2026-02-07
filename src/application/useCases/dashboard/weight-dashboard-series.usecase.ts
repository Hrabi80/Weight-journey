import { WeightRepository } from "@/src/application/ports/weight.repository";
import { getSeriesSchema, WeightDashboardSeries, weightSerieInput, WeightSeriesPoint } from "../../validations/weight.schema";
import { WeightEntry } from "@/src/domaine/entities/weight-entry.entity";

/**
 * GetWeightDashboardSeriesUseCase
 *
 * Returns a chart-friendly series of points:
 * - X axis: date
 * - Y axis: weight
 *
 * Notes:
 * - The repository returns WeightEntry objects.
 * - This use case transforms them into the simplest DTO the UI needs.
 */
export class GetWeightDashboardSeriesUseCase {
  private readonly weightRepo: WeightRepository;

  public constructor(weightRepo: WeightRepository) {
    this.weightRepo = weightRepo;
  }

  /**
   * @param input - Contains username.
   * @returns Series points for the weight chart.
   * @throws {z.ZodError} If validation fails.
   */
  public async execute(input: weightSerieInput): Promise<WeightDashboardSeries> {
    const validated = getSeriesSchema.parse(input);
    const normalizedUsername = validated.username.toLowerCase();

    const entries = await this.weightRepo.list_by_username(normalizedUsername);
    return this.to_points(entries);
  }

  /**
   * Maps repository entities to chart points.
   *
   * Keep the mapping here (Application layer) so:
   * - repositories stay data-access only
   * - UI stays dumb (just renders the DTO)
   */
  private to_points(entries: WeightEntry[]): WeightSeriesPoint[] {
    return entries.map((e) => ({
      date: e.date,
      weight: e.weight,
    }));
  }
}
