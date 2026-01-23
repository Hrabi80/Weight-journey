import * as React from "react";
import { cn } from "@/lib/utils";
import type { ResponsiveProp } from "../responsive";
import type { ClassNameVariants, StyleProps } from "../style_props";
import {
  merge_styles,
  resolve_style_props,
  responsive_class_list,
} from "../style_props";

type PolymorphicRef<C extends React.ElementType> = React.ComponentPropsWithRef<C>["ref"];

type StackAlign = "flex-start" | "flex-end" | "center" | "baseline" | "stretch";
type StackJustify = "flex-start" | "flex-end" | "center" | "space-between" | "space-around";

const ALIGN_CLASSES: Record<StackAlign, ClassNameVariants> = {
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

const JUSTIFY_CLASSES: Record<StackJustify, ClassNameVariants> = {
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
};

type StackOwnProps = StyleProps & {
  component?: React.ElementType;
  as?: React.ElementType;
  align?: ResponsiveProp<StackAlign>;
  justify?: ResponsiveProp<StackJustify>;
};

export type StackProps<C extends React.ElementType = "div"> = StackOwnProps &
  Omit<React.ComponentPropsWithoutRef<C>, keyof StackOwnProps | "as">;

type StackComponent = (<C extends React.ElementType = "div">(
  props: StackProps<C> & { ref?: PolymorphicRef<C> },
) => React.ReactElement | null) & { displayName?: string };

const StackImpl = React.forwardRef<unknown, StackProps<React.ElementType>>(function Stack(
  props,
  ref,
) {
  const {
    component,
    as,
    className,
    style,

    align,
    justify,

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

  const flexClasses = cn(
    "flex flex-col",
    responsive_class_list(align, ALIGN_CLASSES),
    responsive_class_list(justify, JUSTIFY_CLASSES),
  );

  const resolvedGap = gap ?? "md";

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
    gap: resolvedGap,
    columnGap,
    rowGap,
    display,
    pos,
    ta,
    radius,
    shadow,
  });

  const classes = cn(flexClasses, classNames, className);
  const mergedStyle = merge_styles(generatedStyle, style);

  return (
    <Component
      ref={ref as React.ComponentPropsWithRef<typeof Component>["ref"]}
      className={classes}
      style={mergedStyle}
      {...(rest as object)}
    />
  );
}) as StackComponent;

StackImpl.displayName = "Stack";

export const Stack = StackImpl;
