import type { ResponsiveProp } from "./responsive";
import { to_entries, tw_prefix } from "./responsive";

export type SpacingToken = "none" | "xs" | "sm" | "md" | "lg" | "xl";

export const SPACING_TOKENS: SpacingToken[] = ["none", "xs", "sm", "md", "lg", "xl"];

export const SPACING_TO_TW: Record<SpacingToken, string> = {
  none: "0",
  xs: "2",
  sm: "3",
  md: "4",
  lg: "6",
  xl: "8",
};

export function is_spacing_token(value: unknown): value is SpacingToken {
  return typeof value === "string" && (SPACING_TOKENS as string[]).includes(value);
}

type SpacingKind =
  | "p"
  | "px"
  | "py"
  | "pt"
  | "pr"
  | "pb"
  | "pl"
  | "m"
  | "mx"
  | "my"
  | "mt"
  | "mr"
  | "mb"
  | "ml"
  | "gap"
  | "gap-x"
  | "gap-y";

/**
 * Convert a responsive spacing token into Tailwind classes.
 *
 * @param kind - Tailwind spacing utility (e.g., "p", "px", "gap").
 * @param value - Responsive spacing token.
 * @returns List of Tailwind classes.
 */
export function spacing_classes(
  kind: SpacingKind,
  value?: ResponsiveProp<SpacingToken>,
): string[] {
  return to_entries(value).map(([bp, token]) => {
    const tw_value = SPACING_TO_TW[token];
    return `${tw_prefix(bp)}${kind}-${tw_value}`;
  });
}
