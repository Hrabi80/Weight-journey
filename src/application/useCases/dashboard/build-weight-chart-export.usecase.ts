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

    return tabularExportDocumentSchema.parse({
      fileNameStem: `weight-progress-${file_stamp()}`,
      title: "Weight progress report",
      subtitle: `Range: ${RANGE_LABELS[validated.range]} | Entries: ${rows.length} | Exported: ${utc_day_stamp()}`,
      headers,
      rows,
    });
  }
}
