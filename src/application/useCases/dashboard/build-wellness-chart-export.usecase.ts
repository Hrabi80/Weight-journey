import {
  type BuildWellnessChartExportInput,
  buildWellnessChartExportInputSchema,
  type ChartMetricFilter,
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

const METRIC_LABELS: Record<ChartMetricFilter, string> = {
  all: "All metrics",
  sleep: "Sleep",
  calories: "Calories",
  steps: "Steps",
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

export class BuildWellnessChartExportUseCase {
  public execute(input: BuildWellnessChartExportInput): TabularExportDocument {
    const validated = buildWellnessChartExportInputSchema.parse(input);

    const includeSleep = validated.metric === "all" || validated.metric === "sleep";
    const includeCalories = validated.metric === "all" || validated.metric === "calories";
    const includeSteps = validated.metric === "all" || validated.metric === "steps";

    const headers = ["Date"];
    if (includeSleep) headers.push("Sleep (h)");
    if (includeCalories) headers.push("Calories");
    if (includeSteps) headers.push("Steps");

    const rows = validated.rows.map((row) => {
      const values = [row.date];
      if (includeSleep) values.push(format_number(row.sleep));
      if (includeCalories) values.push(format_number(row.calories));
      if (includeSteps) values.push(format_number(row.steps));
      return values;
    });

    return tabularExportDocumentSchema.parse({
      fileNameStem: `wellness-metrics-${file_stamp()}`,
      title: "Wellness metrics report",
      subtitle: `Range: ${RANGE_LABELS[validated.range]} | Metric: ${METRIC_LABELS[validated.metric]} | Entries: ${rows.length} | Exported: ${utc_day_stamp()}`,
      headers,
      rows,
    });
  }
}
