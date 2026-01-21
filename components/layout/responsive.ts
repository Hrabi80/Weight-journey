export type Breakpoint = "base" | "sm" | "md" | "lg" | "xl";
export type ResponsiveProp<T> = T | Partial<Record<Breakpoint, T>>;

const ORDER: Breakpoint[] = ["base", "sm", "md", "lg", "xl"];

/**
 * Check if a responsive prop is an object with breakpoint keys.
 *
 * @param value - Responsive prop.
 * @returns True if the value is a responsive object.
 */
export function is_responsive_object<T>(
  value: ResponsiveProp<T>,
): value is Partial<Record<Breakpoint, T>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Convert a responsive prop into ordered breakpoint entries.
 *
 * @param value - Responsive prop.
 * @returns Ordered entries (base -> xl).
 */
export function to_entries<T>(
  value: ResponsiveProp<T> | undefined,
): Array<[Breakpoint, T]> {
  if (value === undefined) return [];
  if (!is_responsive_object(value)) return [["base", value]];

  const entries: Array<[Breakpoint, T]> = [];
  for (const bp of ORDER) {
    const v = value[bp];
    if (v !== undefined) entries.push([bp, v]);
  }
  return entries;
}

/**
 * Tailwind prefix for breakpoint.
 *
 * @param bp - Breakpoint.
 * @returns Tailwind prefix ("" for base, "md:" etc otherwise).
 */
export function tw_prefix(bp: Breakpoint): string {
  return bp === "base" ? "" : `${bp}:`;
}
