"use client";

import { Button } from "@/components/ui/button";

interface ChartExportButtonsProps {
  onExportCsv: () => void;
  onExportPdf: () => void;
  disabled?: boolean;
  className?: string;
}

export function ChartExportButtons({
  onExportCsv,
  onExportPdf,
  disabled = false,
  className,
}: ChartExportButtonsProps) {
  return (
    <div className={className ?? "flex flex-wrap items-center gap-2"}>
      <Button variant="outline" size="sm" disabled={disabled} onClick={onExportCsv}>
        Export CSV
      </Button>
      <Button variant="outline" size="sm" disabled={disabled} onClick={onExportPdf}>
        Export PDF
      </Button>
    </div>
  );
}
