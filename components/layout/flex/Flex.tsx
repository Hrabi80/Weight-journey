import * as React from "react";
import { cn } from "@/lib/utils";
import type {
  ClassNameVariants,
  StyleProps,
} from "../style_props";
import {
  merge_styles,
  resolve_style_props,
  responsive_class_list,
} from "../style_props";
import type { ResponsiveProp } from "../responsive";

type PolymorphicRef<C extends React.ElementType> = React.ComponentPropsWithRef<C>["ref"];

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

const ALIGN_CLASSES: Record<FlexAlign, ClassNameVariants> = {
  "flex-start": {
    base: "items-start",
    sm: "sm:items-start",
    md: "md:items-start",
    lg: "lg:items-start",
    xl: "xl:items-start",
  },
  "flex-end": {
    base: "items-end",
    sm: "sm:items-end",
    md: "md:items-end",
    lg: "lg:items-end",
    xl: "xl:items-end",
  },
  center: {
    base: "items-center",
    sm: "sm:items-center",
    md: "md:items-center",
    lg: "lg:items-center",
    xl: "xl:items-center",
  },
  baseline: {
    base: "items-baseline",
    sm: "sm:items-baseline",
    md: "md:items-baseline",
    lg: "lg:items-baseline",
    xl: "xl:items-baseline",
  },
  stretch: {
    base: "items-stretch",
    sm: "sm:items-stretch",
    md: "md:items-stretch",
    lg: "lg:items-stretch",
    xl: "xl:items-stretch",
  },
};

const JUSTIFY_CLASSES: Record<FlexJustify, ClassNameVariants> = {
  "flex-start": {
    base: "justify-start",
    sm: "sm:justify-start",
    md: "md:justify-start",
    lg: "lg:justify-start",
    xl: "xl:justify-start",
  },
  "flex-end": {
    base: "justify-end",
    sm: "sm:justify-end",
    md: "md:justify-end",
    lg: "lg:justify-end",
    xl: "xl:justify-end",
  },
  center: {
    base: "justify-center",
    sm: "sm:justify-center",
    md: "md:justify-center",
    lg: "lg:justify-center",
    xl: "xl:justify-center",
  },
  "space-between": {
    base: "justify-between",
    sm: "sm:justify-between",
    md: "md:justify-between",
    lg: "lg:justify-between",
    xl: "xl:justify-between",
  },
  "space-around": {
    base: "justify-around",
    sm: "sm:justify-around",
    md: "md:justify-around",
    lg: "lg:justify-around",
    xl: "xl:justify-around",
  },
  "space-evenly": {
    base: "justify-evenly",
    sm: "sm:justify-evenly",
    md: "md:justify-evenly",
    lg: "lg:justify-evenly",
    xl: "xl:justify-evenly",
  },
};

const DIRECTION_CLASSES: Record<FlexDirection, ClassNameVariants> = {
  row: {
    base: "flex-row",
    sm: "sm:flex-row",
    md: "md:flex-row",
    lg: "lg:flex-row",
    xl: "xl:flex-row",
  },
  column: {
    base: "flex-col",
    sm: "sm:flex-col",
    md: "md:flex-col",
    lg: "lg:flex-col",
    xl: "xl:flex-col",
  },
  "row-reverse": {
    base: "flex-row-reverse",
    sm: "sm:flex-row-reverse",
    md: "md:flex-row-reverse",
    lg: "lg:flex-row-reverse",
    xl: "xl:flex-row-reverse",
  },
  "column-reverse": {
    base: "flex-col-reverse",
    sm: "sm:flex-col-reverse",
    md: "md:flex-col-reverse",
    lg: "lg:flex-col-reverse",
    xl: "xl:flex-col-reverse",
  },
};

const WRAP_CLASSES: Record<FlexWrap, ClassNameVariants> = {
  nowrap: {
    base: "flex-nowrap",
    sm: "sm:flex-nowrap",
    md: "md:flex-nowrap",
    lg: "lg:flex-nowrap",
    xl: "xl:flex-nowrap",
  },
  wrap: {
    base: "flex-wrap",
    sm: "sm:flex-wrap",
    md: "md:flex-wrap",
    lg: "lg:flex-wrap",
    xl: "xl:flex-wrap",
  },
  "wrap-reverse": {
    base: "flex-wrap-reverse",
    sm: "sm:flex-wrap-reverse",
    md: "md:flex-wrap-reverse",
    lg: "lg:flex-wrap-reverse",
    xl: "xl:flex-wrap-reverse",
  },
};

type FlexOwnProps = StyleProps & {
  component?: React.ElementType;
  as?: React.ElementType;
  inline?: boolean;
  align?: ResponsiveProp<FlexAlign>;
  justify?: ResponsiveProp<FlexJustify>;
  direction?: ResponsiveProp<FlexDirection>;
  wrap?: ResponsiveProp<FlexWrap>;
};

export type FlexProps<C extends React.ElementType = "div"> = FlexOwnProps &
  Omit<React.ComponentPropsWithoutRef<C>, keyof FlexOwnProps | "as">;

type FlexComponent = (<C extends React.ElementType = "div">(
  props: FlexProps<C> & { ref?: PolymorphicRef<C> },
) => React.ReactElement | null) & { displayName?: string };

const FlexImpl = React.forwardRef<unknown, FlexProps<React.ElementType>>(function Flex(
  props,
  ref,
) {
  const {
    component,
    as,
    className,
    style,
    inline,

    align,
    justify,
    direction,
    wrap,

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
    gap,
    columnGap,
    rowGap,
    display,
    pos,
    ta,
    radius,
    shadow,

    ...rest
  } = props;

  const Component = (component ?? as ?? "div") as React.ElementType;
  const baseDisplayClass = inline ? "inline-flex" : "flex";

  const flexSpecificClasses = cn(
    baseDisplayClass,
    responsive_class_list(direction, DIRECTION_CLASSES),
    responsive_class_list(align, ALIGN_CLASSES),
    responsive_class_list(justify, JUSTIFY_CLASSES),
    responsive_class_list(wrap, WRAP_CLASSES),
  );

  const { classNames, style: generatedStyle } = resolve_style_props({
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
    gap,
    columnGap,
    rowGap,
    display,
    pos,
    ta,
    radius,
    shadow,
  });

  const classes = cn(flexSpecificClasses, classNames, className);
  const mergedStyle = merge_styles(generatedStyle, style);

  return (
    <Component
      ref={ref as React.ComponentPropsWithRef<typeof Component>["ref"]}
      className={classes}
      style={mergedStyle}
      {...(rest as object)}
    />
  );
}) as FlexComponent;

FlexImpl.displayName = "Flex";

export const Flex = FlexImpl;
