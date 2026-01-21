import * as React from "react";
import type { ResponsiveProp } from "./responsive";
import type { SpacingToken } from "./spacing";
import { spacing_classes } from "./spacing";
import { to_entries, tw_prefix } from "./responsive";
import { Box, type BoxProps } from "./Box";
import { cn } from "@/lib/utils";

type FlexAlign = "flex-start" | "flex-end" | "center" | "baseline" | "stretch";
type FlexJustify =
  | "flex-start"
  | "flex-end"
  | "center"
  | "space-between"
  | "space-around"
  | "space-evenly";
type FlexDirection = "row" | "column" | "row-reverse" | "column-reverse";
type FlexWrap = "nowrap" | "wrap" | "wrap-reverse";

function align_class(v: FlexAlign): string {
  switch (v) {
    case "flex-start":
      return "items-start";
    case "flex-end":
      return "items-end";
    case "center":
      return "items-center";
    case "baseline":
      return "items-baseline";
    case "stretch":
      return "items-stretch";
  }
}

function justify_class(v: FlexJustify): string {
  switch (v) {
    case "flex-start":
      return "justify-start";
    case "flex-end":
      return "justify-end";
    case "center":
      return "justify-center";
    case "space-between":
      return "justify-between";
    case "space-around":
      return "justify-around";
    case "space-evenly":
      return "justify-evenly";
  }
}

function direction_class(v: FlexDirection): string {
  switch (v) {
    case "row":
      return "flex-row";
    case "column":
      return "flex-col";
    case "row-reverse":
      return "flex-row-reverse";
    case "column-reverse":
      return "flex-col-reverse";
  }
}

function wrap_class(v: FlexWrap): string {
  switch (v) {
    case "nowrap":
      return "flex-nowrap";
    case "wrap":
      return "flex-wrap";
    case "wrap-reverse":
      return "flex-wrap-reverse";
  }
}

function responsive_enum_classes<T extends string>(
  value: ResponsiveProp<T> | undefined,
  mapper: (v: T) => string,
): string[] {
  return to_entries(value).map(([bp, v]) => `${tw_prefix(bp)}${mapper(v)}`);
}

export type FlexProps<C extends React.ElementType = "div"> = BoxProps<C> & {
  /** Flex-only props (Mantine-like) */
  inline?: boolean;
  gap?: ResponsiveProp<SpacingToken>;
  rowGap?: ResponsiveProp<SpacingToken>;
  columnGap?: ResponsiveProp<SpacingToken>;
  align?: ResponsiveProp<FlexAlign>;
  justify?: ResponsiveProp<FlexJustify>;
  wrap?: ResponsiveProp<FlexWrap>;
  direction?: ResponsiveProp<FlexDirection>;
};

/**
 * Flex: Mantine-inspired Flex built on top of Box.
 *
 * Example:
 * <Flex
 *   direction={{ base: "column", md: "row" }}
 *   justify={{ base: "space-around", lg: "space-between" }}
 *   p={{ base: "md", md: "lg", lg: "xl" }}
 * />
 */
export const Flex = React.forwardRef(function Flex<C extends React.ElementType = "div">(
  props: FlexProps<C>,
  ref: React.ComponentPropsWithRef<C>["ref"],
) {
  const {
    className,
    inline,
    gap,
    rowGap,
    columnGap,
    align,
    justify,
    wrap,
    direction,
    display,
    ...rest
  } = props;

  const base_display: ResponsiveProp<"flex"> | ResponsiveProp<"inline-flex"> | undefined = inline
    ? "inline-flex"
    : "flex";

  const classes = cn(
    spacing_classes("gap", gap),
    spacing_classes("gap-y", rowGap),
    spacing_classes("gap-x", columnGap),

    responsive_enum_classes(align, align_class),
    responsive_enum_classes(justify, justify_class),
    responsive_enum_classes(wrap, wrap_class),
    responsive_enum_classes(direction, direction_class),

    className,
  );

  return (
    <Box
      ref={ref}
      {...(rest as object)}
      display={display ?? (base_display as any)}
      className={classes}
    />
  );
}) as <C extends React.ElementType = "div">(
  props: FlexProps<C> & { ref?: React.ComponentPropsWithRef<C>["ref"] },
) => React.ReactElement | null;

Flex.displayName = "Flex";
