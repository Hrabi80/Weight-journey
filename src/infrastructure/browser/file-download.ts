export function download_text_file(file_name: string, content: string, mime_type: string): void {
  const bytes = new TextEncoder().encode(content);
  download_binary_file(file_name, bytes, mime_type);
}

export function download_binary_file(
  file_name: string,
  content: Uint8Array,
  mime_type: string,
): void {
  const copy = new Uint8Array(content.byteLength);
  copy.set(content);
  const blob = new Blob([copy.buffer], { type: mime_type });
  const href = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = file_name;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  window.setTimeout(() => URL.revokeObjectURL(href), 0);
}
