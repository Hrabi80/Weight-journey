import {
  type BuildWeightChartExportInput,
  buildWeightChartExportInputSchema,
  type ChartRange,
  type TabularExportDocument,
  tabularExportDocumentSchema,
} from "@/src/application/validations/chart-export.schema";

const RANGE_LABELS: Record<ChartRange, string> = {
  "7d": "This week",
  "1m": "Last month",
  "2m": "Last 2 months",
  "1y": "Last year",
  all: "All time",
};

function format_number(value: number | undefined): string {
  if (value === undefined || !Number.isFinite(value)) return "";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function utc_day_stamp(): string {
  return new Date().toISOString().split("T")[0];
}

function file_stamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function derive_display_name(
  user_email: string | undefined,
  explicit_display_name: string | undefined,
): string | undefined {
  const trimmed_explicit = explicit_display_name?.trim();
  if (trimmed_explicit) return trimmed_explicit;
  if (!user_email) return undefined;

  const local = user_email.split("@")[0]?.split("+")[0] ?? "";
  if (!local) return undefined;

  const words = local
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return undefined;

  return words
    .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export class BuildWeightChartExportUseCase {
  public execute(input: BuildWeightChartExportInput): TabularExportDocument {
    const validated = buildWeightChartExportInputSchema.parse(input);

    const includeSleep = validated.overlayEnabled && validated.showSleep;
    const includeCalories = validated.overlayEnabled && validated.showCalories;
    const includeSteps = validated.overlayEnabled && validated.showSteps;

    const headers = ["Date", "Weight (kg)"];
    if (includeSleep) headers.push("Sleep (h)");
    if (includeCalories) headers.push("Calories");
    if (includeSteps) headers.push("Steps");

    const rows = validated.rows.map((row) => {
      const values = [row.date, format_number(row.weight)];
      if (includeSleep) values.push(format_number(row.sleep));
      if (includeCalories) values.push(format_number(row.calories));
      if (includeSteps) values.push(format_number(row.steps));
      return values;
    });
    const generated_at_iso = new Date().toISOString();

    return tabularExportDocumentSchema.parse({
      fileNameStem: `weight-progress-${file_stamp()}`,
      appName: "WeightJourney",
      logoText: "WJ",
      title: "Weight progress report",
      subtitle: `Range: ${RANGE_LABELS[validated.range]} | Entries: ${rows.length} | Exported: ${utc_day_stamp()}`,
      userDisplayName: derive_display_name(validated.userEmail, validated.userDisplayName),
      userEmail: validated.userEmail,
      generatedAtIso: generated_at_iso,
      headers,
      rows,
    });
  }
}
