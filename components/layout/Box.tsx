import * as React from "react";
import type { ResponsiveProp } from "./responsive";
import type { SpacingToken } from "./spacing";
import { spacing_classes } from "./spacing";
import { to_entries, tw_prefix } from "./responsive";
import { cn } from "@/lib/utils";

type DisplayValue = "block" | "inline" | "inline-block" | "flex" | "grid" | "none";
type PositionValue = "static" | "relative" | "absolute" | "fixed" | "sticky";
type TextAlignValue = "left" | "center" | "right" | "justify";

type RadiusToken = "none" | "sm" | "md" | "lg" | "xl" | "full";
type ShadowToken = "none" | "sm" | "md" | "lg" | "xl";

function display_class(v: DisplayValue): string {
  switch (v) {
    case "block":
      return "block";
    case "inline":
      return "inline";
    case "inline-block":
      return "inline-block";
    case "flex":
      return "flex";
    case "grid":
      return "grid";
    case "none":
      return "hidden";
  }
}

function position_class(v: PositionValue): string {
  switch (v) {
    case "static":
      return "static";
    case "relative":
      return "relative";
    case "absolute":
      return "absolute";
    case "fixed":
      return "fixed";
    case "sticky":
      return "sticky";
  }
}

function text_align_class(v: TextAlignValue): string {
  switch (v) {
    case "left":
      return "text-left";
    case "center":
      return "text-center";
    case "right":
      return "text-right";
    case "justify":
      return "text-justify";
  }
}

function radius_class(v: RadiusToken): string {
  switch (v) {
    case "none":
      return "rounded-none";
    case "sm":
      return "rounded-sm";
    case "md":
      return "rounded-md";
    case "lg":
      return "rounded-lg";
    case "xl":
      return "rounded-xl";
    case "full":
      return "rounded-full";
  }
}

function shadow_class(v: ShadowToken): string {
  switch (v) {
    case "none":
      return "shadow-none";
    case "sm":
      return "shadow-sm";
    case "md":
      return "shadow";
    case "lg":
      return "shadow-lg";
    case "xl":
      return "shadow-xl";
  }
}

function responsive_enum_classes<T extends string>(
  value: ResponsiveProp<T> | undefined,
  mapper: (v: T) => string,
): string[] {
  return to_entries(value).map(([bp, v]) => `${tw_prefix(bp)}${mapper(v)}`);
}

type PolymorphicRef<C extends React.ElementType> = React.ComponentPropsWithRef<C>["ref"];

type BoxOwnProps = {
  /** Mantine-like polymorphic prop */
  component?: React.ElementType;
  /** Also accept `as` for convenience */
  as?: React.ElementType;

  /** Padding (Mantine-like tokens) */
  p?: ResponsiveProp<SpacingToken>;
  px?: ResponsiveProp<SpacingToken>;
  py?: ResponsiveProp<SpacingToken>;
  pt?: ResponsiveProp<SpacingToken>;
  pr?: ResponsiveProp<SpacingToken>;
  pb?: ResponsiveProp<SpacingToken>;
  pl?: ResponsiveProp<SpacingToken>;

  /** Margin (Mantine-like tokens) */
  m?: ResponsiveProp<SpacingToken>;
  mx?: ResponsiveProp<SpacingToken>;
  my?: ResponsiveProp<SpacingToken>;
  mt?: ResponsiveProp<SpacingToken>;
  mr?: ResponsiveProp<SpacingToken>;
  mb?: ResponsiveProp<SpacingToken>;
  ml?: ResponsiveProp<SpacingToken>;

  /** Common system props */
  display?: ResponsiveProp<DisplayValue>;
  pos?: ResponsiveProp<PositionValue>;
  ta?: ResponsiveProp<TextAlignValue>;
  radius?: ResponsiveProp<RadiusToken>;
  shadow?: ResponsiveProp<ShadowToken>;
};

export type BoxProps<C extends React.ElementType = "div"> = BoxOwnProps &
  Omit<React.ComponentPropsWithoutRef<C>, keyof BoxOwnProps | "as">;

/**
 * Box: Mantine-inspired layout primitive that outputs Tailwind classes.
 *
 * Note:
 * - Spacing props are token-based for Tailwind safety (none/xs/sm/md/lg/xl).
 * - For anything else, use `className` and/or `style`.
 */
export const Box = React.forwardRef(function Box<C extends React.ElementType = "div">(
  props: BoxProps<C>,
  ref: PolymorphicRef<C>,
) {
  const {
    component,
    as,
    className,

    p,
    px,
    py,
    pt,
    pr,
    pb,
    pl,

    m,
    mx,
    my,
    mt,
    mr,
    mb,
    ml,

    display,
    pos,
    ta,
    radius,
    shadow,

    ...rest
  } = props;

  const Component = (component ?? as ?? "div") as React.ElementType;

  const classes = cn(
    spacing_classes("p", p),
    spacing_classes("px", px),
    spacing_classes("py", py),
    spacing_classes("pt", pt),
    spacing_classes("pr", pr),
    spacing_classes("pb", pb),
    spacing_classes("pl", pl),

    spacing_classes("m", m),
    spacing_classes("mx", mx),
    spacing_classes("my", my),
    spacing_classes("mt", mt),
    spacing_classes("mr", mr),
    spacing_classes("mb", mb),
    spacing_classes("ml", ml),

    responsive_enum_classes(display, display_class),
    responsive_enum_classes(pos, position_class),
    responsive_enum_classes(ta, text_align_class),
    responsive_enum_classes(radius, radius_class),
    responsive_enum_classes(shadow, shadow_class),

    className,
  );

  return <Component ref={ref} className={classes} {...(rest as object)} />;
}) as <C extends React.ElementType = "div">(
  props: BoxProps<C> & { ref?: PolymorphicRef<C> },
) => React.ReactElement | null;

Box.displayName = "Box";
