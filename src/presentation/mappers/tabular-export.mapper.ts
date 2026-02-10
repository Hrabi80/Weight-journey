import type { TabularExportDocument } from "@/src/application/validations/chart-export.schema";

function escape_csv_cell(value: string): string {
  if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
    return `"${value.replace(/"/g, "\"\"")}"`;
  }
  return value;
}

function normalize_ascii(value: string): string {
  return value.replace(/[^\x20-\x7E]/g, "?");
}

function escape_pdf_text(value: string): string {
  return normalize_ascii(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrap_text_line(value: string, max_chars = 94): string[] {
  if (value.length <= max_chars) return [value];

  const lines: string[] = [];
  let remaining = value;
  while (remaining.length > max_chars) {
    const windowText = remaining.slice(0, max_chars + 1);
    const cut = windowText.lastIndexOf(" ");
    const splitIndex = cut > 30 ? cut : max_chars;
    lines.push(remaining.slice(0, splitIndex).trimEnd());
    remaining = remaining.slice(splitIndex).trimStart();
  }
  if (remaining.length > 0) lines.push(remaining);
  return lines;
}

function chunk_lines(lines: string[], chunk_size: number): string[][] {
  if (lines.length === 0) return [[]];
  const chunks: string[][] = [];
  for (let i = 0; i < lines.length; i += chunk_size) {
    chunks.push(lines.slice(i, i + chunk_size));
  }
  return chunks;
}

function build_pdf_stream(lines: string[]): string {
  const stream_lines = [
    "BT",
    "/F1 10 Tf",
    "40 760 Td",
    "14 TL",
  ];

  lines.forEach((line) => {
    stream_lines.push(`(${escape_pdf_text(line)}) Tj`);
    stream_lines.push("T*");
  });

  stream_lines.push("ET");
  return stream_lines.join("\n");
}

function build_pdf_document(page_lines: string[][]): Uint8Array {
  const pageCount = Math.max(1, page_lines.length);
  const maxObjectId = 3 + pageCount * 2;

  const pageRefs: string[] = [];
  for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
    const pageObjectId = 4 + pageIndex * 2;
    pageRefs.push(`${pageObjectId} 0 R`);
  }

  const objects: Record<number, string> = {
    1: "<< /Type /Catalog /Pages 2 0 R >>",
    2: `<< /Type /Pages /Kids [${pageRefs.join(" ")}] /Count ${pageCount} >>`,
    3: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  };

  for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
    const pageObjectId = 4 + pageIndex * 2;
    const contentObjectId = pageObjectId + 1;

    const lines = page_lines[pageIndex] ?? [];
    const stream = build_pdf_stream(lines);

    objects[pageObjectId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectId} 0 R >>`;
    objects[contentObjectId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  }

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = new Array(maxObjectId + 1).fill(0);

  for (let objectId = 1; objectId <= maxObjectId; objectId += 1) {
    offsets[objectId] = pdf.length;
    pdf += `${objectId} 0 obj\n${objects[objectId]}\nendobj\n`;
  }

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${maxObjectId + 1}\n0000000000 65535 f \n`;
  for (let objectId = 1; objectId <= maxObjectId; objectId += 1) {
    pdf += `${String(offsets[objectId]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${maxObjectId + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new TextEncoder().encode(pdf);
}

export function map_tabular_export_to_csv(document: TabularExportDocument): string {
  const lines: string[] = [];
  lines.push(document.headers.map(escape_csv_cell).join(","));
  document.rows.forEach((row) => {
    lines.push(row.map(escape_csv_cell).join(","));
  });

  return `${lines.join("\n")}\n`;
}

export function map_tabular_export_to_pdf_bytes(document: TabularExportDocument): Uint8Array {
  const lines: string[] = [];
  lines.push(document.title);
  lines.push(document.subtitle);
  lines.push("");
  lines.push(document.headers.join(" | "));
  lines.push(...document.rows.map((row) => row.join(" | ")));

  const wrappedLines = lines.flatMap((line) => wrap_text_line(line));
  const pageLines = chunk_lines(wrappedLines, 48);
  return build_pdf_document(pageLines);
}
