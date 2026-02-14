import type { TabularExportDocument } from "@/src/application/validations/chart-export.schema";

const PDF_PAGE_WIDTH = 612;
const PDF_PAGE_HEIGHT = 792;
const PDF_MARGIN_X = 40;
const PDF_MARGIN_TOP = 38;
const PDF_MARGIN_BOTTOM = 34;
const PDF_CONTENT_WIDTH = PDF_PAGE_WIDTH - PDF_MARGIN_X * 2;
const PDF_FOOTER_RESERVED = 20;

const CELL_HORIZONTAL_PADDING = 7;
const CELL_VERTICAL_PADDING = 6;
const BODY_FONT_SIZE = 10;
const HEADER_FONT_SIZE = 10;
const BODY_LINE_HEIGHT = 12;
const HEADER_LINE_HEIGHT = 12;

type PdfFontId = "F1" | "F2" | "F3";
type PdfRgb = [number, number, number];

type PreparedRow = {
  rowIndex: number;
  cells: string[][];
  height: number;
};

type DrawRowStyle = {
  font: PdfFontId;
  fontSize: number;
  lineHeight: number;
  textColor: PdfRgb;
  fillColor?: PdfRgb;
};

const COLOR_PRIMARY: PdfRgb = [0.11, 0.33, 0.71];
const COLOR_PRIMARY_DARK: PdfRgb = [0.08, 0.25, 0.56];
const COLOR_TEXT: PdfRgb = [0.15, 0.18, 0.26];
const COLOR_MUTED: PdfRgb = [0.37, 0.41, 0.49];
const COLOR_WHITE: PdfRgb = [1, 1, 1];
const COLOR_TABLE_HEADER: PdfRgb = [0.13, 0.33, 0.63];
const COLOR_TABLE_BORDER: PdfRgb = [0.75, 0.79, 0.86];
const COLOR_ALT_ROW: PdfRgb = [0.96, 0.98, 1];

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

function pdf_number(value: number): string {
  if (!Number.isFinite(value)) return "0";
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(3).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}

function pdf_color(color: PdfRgb): string {
  return `${pdf_number(color[0])} ${pdf_number(color[1])} ${pdf_number(color[2])}`;
}

function estimate_text_width(value: string, font_size: number): number {
  let units = 0;
  const normalized = normalize_ascii(value);

  for (const char of normalized) {
    if (char === " ") units += 0.28;
    else if ("il.,:;'|![]".includes(char)) units += 0.25;
    else if ("mwMW@%#".includes(char)) units += 0.85;
    else if (/[A-Z]/.test(char)) units += 0.62;
    else if (/[0-9]/.test(char)) units += 0.56;
    else units += 0.53;
  }

  return units * font_size;
}

function split_long_token(token: string, max_width: number, font_size: number): string[] {
  const parts: string[] = [];
  let remaining = token;
  const safe_min = Math.max(1, Math.floor(max_width / (font_size * 0.7)));

  while (remaining.length > 0) {
    if (estimate_text_width(remaining, font_size) <= max_width) {
      parts.push(remaining);
      break;
    }

    let slice_length = Math.min(remaining.length, Math.max(2, safe_min));
    while (
      slice_length > 1
      && estimate_text_width(remaining.slice(0, slice_length), font_size) > max_width
    ) {
      slice_length -= 1;
    }

    const piece = remaining.slice(0, slice_length);
    parts.push(piece);
    remaining = remaining.slice(slice_length);
  }

  return parts;
}

function truncate_with_ellipsis(value: string, max_width: number, font_size: number): string {
  if (estimate_text_width(value, font_size) <= max_width) return value;

  const ellipsis = "...";
  let trimmed = value;

  while (trimmed.length > 0 && estimate_text_width(`${trimmed}${ellipsis}`, font_size) > max_width) {
    trimmed = trimmed.slice(0, -1);
  }

  if (trimmed.length === 0) {
    let dots = "";
    for (const dot of ellipsis) {
      if (estimate_text_width(`${dots}${dot}`, font_size) <= max_width) dots += dot;
    }
    return dots || ".";
  }

  return `${trimmed}${ellipsis}`;
}

function wrap_text_to_width(
  value: string,
  max_width: number,
  font_size: number,
  max_lines: number,
): string[] {
  const cleaned = normalize_ascii(value).replace(/\s+/g, " ").trim();
  if (!cleaned) return [""];

  const raw_tokens = cleaned.split(" ");
  const tokens: string[] = [];

  raw_tokens.forEach((token) => {
    if (!token) return;
    if (estimate_text_width(token, font_size) <= max_width) {
      tokens.push(token);
      return;
    }
    tokens.push(...split_long_token(token, max_width, font_size));
  });

  const lines: string[] = [];
  let current = "";

  tokens.forEach((token) => {
    const candidate = current ? `${current} ${token}` : token;
    if (estimate_text_width(candidate, font_size) <= max_width) {
      current = candidate;
      return;
    }

    if (current) lines.push(current);
    current = token;
  });

  if (current) lines.push(current);

  if (lines.length <= max_lines) return lines;

  const clipped = lines.slice(0, max_lines);
  const truncated_last_line = `${clipped[max_lines - 1] ?? ""}...`;
  clipped[max_lines - 1] = truncate_with_ellipsis(truncated_last_line, max_width, font_size);
  return clipped;
}

function sum(values: number[]): number {
  return values.reduce((total, current) => total + current, 0);
}

function compute_column_widths(document: TabularExportDocument): number[] {
  const column_count = document.headers.length;
  const min_column_width = 72;

  const preferred = document.headers.map((header, column_index) => {
    let widest = estimate_text_width(header, HEADER_FONT_SIZE) + CELL_HORIZONTAL_PADDING * 2 + 8;

    document.rows.forEach((row) => {
      const raw = normalize_ascii(row[column_index] ?? "");
      const sample = raw.length > 64 ? `${raw.slice(0, 64)}...` : raw;
      const width = estimate_text_width(sample, BODY_FONT_SIZE) + CELL_HORIZONTAL_PADDING * 2 + 6;
      if (width > widest) widest = width;
    });

    return Math.max(min_column_width, widest);
  });

  const total_preferred = sum(preferred);
  if (total_preferred <= PDF_CONTENT_WIDTH) {
    const extra = PDF_CONTENT_WIDTH - total_preferred;
    if (extra <= 0) return preferred;

    const weighted_total = sum(preferred);
    return preferred.map((width) => width + (width / weighted_total) * extra);
  }

  const floor = 64;
  let widths = [...preferred];
  let overflow = total_preferred - PDF_CONTENT_WIDTH;

  while (overflow > 0.1) {
    const shrinkable = widths.map((width) => Math.max(0, width - floor));
    const shrink_capacity = sum(shrinkable);

    if (shrink_capacity <= 0.1) {
      const even = PDF_CONTENT_WIDTH / Math.max(1, column_count);
      return new Array(column_count).fill(even);
    }

    widths = widths.map((width, index) => {
      const allowance = shrinkable[index] ?? 0;
      if (allowance <= 0) return width;
      return width - (allowance / shrink_capacity) * overflow;
    });

    overflow = sum(widths) - PDF_CONTENT_WIDTH;
  }

  return widths;
}

function prepare_header_row(headers: string[], column_widths: number[]): PreparedRow {
  const cells = headers.map((header, index) => {
    const available = Math.max(12, (column_widths[index] ?? 0) - CELL_HORIZONTAL_PADDING * 2);
    return wrap_text_to_width(header, available, HEADER_FONT_SIZE, 2);
  });

  const max_lines = Math.max(1, ...cells.map((lines) => lines.length));
  return {
    rowIndex: -1,
    cells,
    height: Math.max(26, max_lines * HEADER_LINE_HEIGHT + CELL_VERTICAL_PADDING * 2),
  };
}

function prepare_body_row(row: string[], column_widths: number[], row_index: number): PreparedRow {
  const cells = column_widths.map((width, column_index) => {
    const available = Math.max(12, width - CELL_HORIZONTAL_PADDING * 2);
    return wrap_text_to_width(row[column_index] ?? "", available, BODY_FONT_SIZE, 5);
  });

  const max_lines = Math.max(1, ...cells.map((lines) => lines.length));

  return {
    rowIndex: row_index,
    cells,
    height: Math.max(22, max_lines * BODY_LINE_HEIGHT + CELL_VERTICAL_PADDING * 2),
  };
}

function push_filled_rect(
  stream_lines: string[],
  x: number,
  y: number,
  width: number,
  height: number,
  color: PdfRgb,
): void {
  stream_lines.push(`${pdf_color(color)} rg`);
  stream_lines.push(
    `${pdf_number(x)} ${pdf_number(y)} ${pdf_number(width)} ${pdf_number(height)} re f`,
  );
}

function push_stroked_rect(
  stream_lines: string[],
  x: number,
  y: number,
  width: number,
  height: number,
  color: PdfRgb,
  line_width = 0.8,
): void {
  stream_lines.push(`${pdf_number(line_width)} w`);
  stream_lines.push(`${pdf_color(color)} RG`);
  stream_lines.push(
    `${pdf_number(x)} ${pdf_number(y)} ${pdf_number(width)} ${pdf_number(height)} re S`,
  );
}

function push_stroked_line(
  stream_lines: string[],
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: PdfRgb,
  line_width = 0.8,
): void {
  stream_lines.push(`${pdf_number(line_width)} w`);
  stream_lines.push(`${pdf_color(color)} RG`);
  stream_lines.push(`${pdf_number(x1)} ${pdf_number(y1)} m`);
  stream_lines.push(`${pdf_number(x2)} ${pdf_number(y2)} l`);
  stream_lines.push("S");
}

function push_text(
  stream_lines: string[],
  value: string,
  x: number,
  y: number,
  font: PdfFontId,
  size: number,
  color: PdfRgb,
): void {
  stream_lines.push("BT");
  stream_lines.push(`/${font} ${pdf_number(size)} Tf`);
  stream_lines.push(`${pdf_color(color)} rg`);
  stream_lines.push(`${pdf_number(x)} ${pdf_number(y)} Td`);
  stream_lines.push(`(${escape_pdf_text(value)}) Tj`);
  stream_lines.push("ET");
}

function push_centered_text(
  stream_lines: string[],
  value: string,
  box_x: number,
  box_y: number,
  box_width: number,
  box_height: number,
  font: PdfFontId,
  size: number,
  color: PdfRgb,
): void {
  const width = estimate_text_width(value, size);
  const x = box_x + Math.max(0, (box_width - width) / 2);
  const y = box_y + (box_height - size) / 2 + 1;
  push_text(stream_lines, value, x, y, font, size, color);
}

function format_timestamp_for_pdf(timestamp_iso: string | undefined): string {
  const source = timestamp_iso ?? new Date().toISOString();
  const as_date = new Date(source);

  if (Number.isNaN(as_date.getTime())) {
    return normalize_ascii(source);
  }

  const utc = as_date.toISOString();
  return `${utc.slice(0, 10)} ${utc.slice(11, 16)} UTC`;
}

function draw_page_header(
  stream_lines: string[],
  document: TabularExportDocument,
  page_number: number,
): number {
  const top = PDF_PAGE_HEIGHT - PDF_MARGIN_TOP;
  const logo_size = 28;
  const logo_x = PDF_MARGIN_X;
  const logo_y = top - logo_size;

  const app_name = normalize_ascii(document.appName);
  const logo_text = normalize_ascii(document.logoText || "WJ").slice(0, 4).toUpperCase();
  const user_name = normalize_ascii(document.userDisplayName ?? "User");
  const user_email = document.userEmail ? normalize_ascii(document.userEmail) : "";
  const generated_label = format_timestamp_for_pdf(document.generatedAtIso);

  push_filled_rect(stream_lines, logo_x, logo_y, logo_size, logo_size, COLOR_PRIMARY);
  push_centered_text(
    stream_lines,
    logo_text,
    logo_x,
    logo_y,
    logo_size,
    logo_size,
    "F2",
    11,
    COLOR_WHITE,
  );

  const app_x = logo_x + logo_size + 12;
  push_text(stream_lines, app_name, app_x, top - 11, "F2", 16, COLOR_PRIMARY_DARK);
  push_text(stream_lines, "Health progress export", app_x, top - 26, "F3", 9, COLOR_MUTED);

  const meta_x = PDF_PAGE_WIDTH - PDF_MARGIN_X - 212;
  push_text(stream_lines, `Prepared for: ${user_name}`, meta_x, top - 10, "F2", 9.5, COLOR_TEXT);
  if (user_email) {
    push_text(stream_lines, `Email: ${user_email}`, meta_x, top - 24, "F1", 9, COLOR_MUTED);
  }
  push_text(stream_lines, `Generated: ${generated_label}`, meta_x, top - 38, "F1", 9, COLOR_MUTED);
  push_text(stream_lines, `Page ${page_number}`, meta_x, top - 52, "F1", 9, COLOR_MUTED);

  push_text(stream_lines, normalize_ascii(document.title), PDF_MARGIN_X, top - 55, "F2", 14, COLOR_TEXT);

  const subtitle_lines = wrap_text_to_width(document.subtitle, PDF_CONTENT_WIDTH, 10, 2);
  let subtitle_y = top - 69;
  subtitle_lines.forEach((line) => {
    push_text(stream_lines, line, PDF_MARGIN_X, subtitle_y, "F1", 10, COLOR_MUTED);
    subtitle_y -= 12;
  });

  const divider_y = subtitle_y - 4;
  push_stroked_line(
    stream_lines,
    PDF_MARGIN_X,
    divider_y,
    PDF_PAGE_WIDTH - PDF_MARGIN_X,
    divider_y,
    COLOR_TABLE_BORDER,
    1,
  );

  return divider_y - 12;
}

function draw_page_footer(
  stream_lines: string[],
  document: TabularExportDocument,
  page_number: number,
): void {
  const divider_y = PDF_MARGIN_BOTTOM + 10;
  push_stroked_line(
    stream_lines,
    PDF_MARGIN_X,
    divider_y,
    PDF_PAGE_WIDTH - PDF_MARGIN_X,
    divider_y,
    COLOR_TABLE_BORDER,
    0.8,
  );

  const left_text = `${normalize_ascii(document.appName)}  |  ${normalize_ascii(document.title)}`;
  push_text(stream_lines, left_text, PDF_MARGIN_X, PDF_MARGIN_BOTTOM - 2, "F1", 8.5, COLOR_MUTED);

  const right_text = `Page ${page_number}`;
  const right_width = estimate_text_width(right_text, 8.5);
  const right_x = PDF_PAGE_WIDTH - PDF_MARGIN_X - right_width;
  push_text(stream_lines, right_text, right_x, PDF_MARGIN_BOTTOM - 2, "F1", 8.5, COLOR_MUTED);
}

function draw_table_row(
  stream_lines: string[],
  row: PreparedRow,
  column_widths: number[],
  y_top: number,
  style: DrawRowStyle,
): number {
  const table_left = PDF_MARGIN_X;
  const row_bottom = y_top - row.height;

  if (style.fillColor) {
    push_filled_rect(
      stream_lines,
      table_left,
      row_bottom,
      PDF_CONTENT_WIDTH,
      row.height,
      style.fillColor,
    );
  }

  let x = table_left;
  column_widths.forEach((width, column_index) => {
    push_stroked_rect(stream_lines, x, row_bottom, width, row.height, COLOR_TABLE_BORDER, 0.7);

    const lines = row.cells[column_index] ?? [""];
    let baseline = y_top - CELL_VERTICAL_PADDING - style.fontSize;

    lines.forEach((line) => {
      push_text(
        stream_lines,
        line,
        x + CELL_HORIZONTAL_PADDING,
        baseline,
        style.font,
        style.fontSize,
        style.textColor,
      );
      baseline -= style.lineHeight;
    });

    x += width;
  });

  return row_bottom;
}

function build_pdf_page_streams(document: TabularExportDocument): string[] {
  const column_widths = compute_column_widths(document);
  const header_row = prepare_header_row(document.headers, column_widths);
  const body_rows = document.rows.map((row, row_index) => prepare_body_row(row, column_widths, row_index));

  const pages: string[] = [];
  const min_row_bottom = PDF_MARGIN_BOTTOM + PDF_FOOTER_RESERVED;

  let row_cursor = 0;
  let page_number = 1;

  do {
    const stream_lines: string[] = [];
    const table_top = draw_page_header(stream_lines, document, page_number);

    let cursor_y = draw_table_row(stream_lines, header_row, column_widths, table_top, {
      font: "F2",
      fontSize: HEADER_FONT_SIZE,
      lineHeight: HEADER_LINE_HEIGHT,
      textColor: COLOR_WHITE,
      fillColor: COLOR_TABLE_HEADER,
    });

    if (body_rows.length === 0 && page_number === 1) {
      const empty_cells = new Array(document.headers.length).fill("");
      empty_cells[0] = "No rows available for this export.";
      const empty_row = prepare_body_row(empty_cells, column_widths, 0);

      if (cursor_y - empty_row.height >= min_row_bottom) {
        cursor_y = draw_table_row(stream_lines, empty_row, column_widths, cursor_y, {
          font: "F1",
          fontSize: BODY_FONT_SIZE,
          lineHeight: BODY_LINE_HEIGHT,
          textColor: COLOR_MUTED,
          fillColor: COLOR_ALT_ROW,
        });
      }
    }

    while (row_cursor < body_rows.length) {
      const row = body_rows[row_cursor];
      if (!row) break;

      if (cursor_y - row.height < min_row_bottom) break;

      cursor_y = draw_table_row(stream_lines, row, column_widths, cursor_y, {
        font: "F1",
        fontSize: BODY_FONT_SIZE,
        lineHeight: BODY_LINE_HEIGHT,
        textColor: COLOR_TEXT,
        fillColor: row.rowIndex % 2 === 1 ? COLOR_ALT_ROW : undefined,
      });

      row_cursor += 1;
    }

    draw_page_footer(stream_lines, document, page_number);
    pages.push(stream_lines.join("\n"));
    page_number += 1;
  } while (row_cursor < body_rows.length || pages.length === 0);

  return pages;
}

function build_pdf_document(page_streams: string[]): Uint8Array {
  const page_count = Math.max(1, page_streams.length);
  const first_page_object_id = 6;
  const max_object_id = 5 + page_count * 2;

  const page_refs: string[] = [];
  for (let page_index = 0; page_index < page_count; page_index += 1) {
    const page_object_id = first_page_object_id + page_index * 2;
    page_refs.push(`${page_object_id} 0 R`);
  }

  const objects: Record<number, string> = {
    1: "<< /Type /Catalog /Pages 2 0 R >>",
    2: `<< /Type /Pages /Kids [${page_refs.join(" ")}] /Count ${page_count} >>`,
    3: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    4: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    5: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>",
  };

  for (let page_index = 0; page_index < page_count; page_index += 1) {
    const page_object_id = first_page_object_id + page_index * 2;
    const content_object_id = page_object_id + 1;
    const stream = page_streams[page_index] ?? "";

    objects[page_object_id] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_PAGE_WIDTH} ${PDF_PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${content_object_id} 0 R >>`;
    objects[content_object_id] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  }

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = new Array(max_object_id + 1).fill(0);

  for (let object_id = 1; object_id <= max_object_id; object_id += 1) {
    offsets[object_id] = pdf.length;
    pdf += `${object_id} 0 obj\n${objects[object_id]}\nendobj\n`;
  }

  const xref_start = pdf.length;
  pdf += `xref\n0 ${max_object_id + 1}\n0000000000 65535 f \n`;

  for (let object_id = 1; object_id <= max_object_id; object_id += 1) {
    pdf += `${String(offsets[object_id]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${max_object_id + 1} /Root 1 0 R >>\nstartxref\n${xref_start}\n%%EOF`;

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
  const page_streams = build_pdf_page_streams(document);
  return build_pdf_document(page_streams);
}
