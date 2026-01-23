import * as React from "react";
import { cn } from "@/lib/utils";
import type { ResponsiveProp } from "../responsive";
import { to_entries } from "../responsive";
import type { SpacingValue, ClassNameVariants, StyleProps } from "../style_props";
import {
  merge_styles,
  resolve_style_props,
  responsive_class_list,
} from "../style_props";
import { SPACING_TO_TW, is_spacing_token } from "../spacing";

type StyleVars = Record<string, string | number | undefined>;

type GridAlign = "stretch" | "center" | "flex-start" | "flex-end";
type GridJustify = "flex-start" | "center" | "flex-end" | "space-between" | "space-around";

type GridOwnProps = StyleProps & {
  component?: React.ElementType;
  as?: React.ElementType;
  columns?: ResponsiveProp<number>;
  gutter?: ResponsiveProp<SpacingValue>;
  align?: ResponsiveProp<GridAlign>;
  justify?: ResponsiveProp<GridJustify>;
};

export type GridProps<C extends React.ElementType = "div"> = GridOwnProps &
  Omit<React.ComponentPropsWithoutRef<C>, keyof GridOwnProps | "as">;

const GRID_COLUMN_CLASSES: ClassNameVariants = {
  base: "grid-cols-[repeat(var(--tw-grid-cols),minmax(0,1fr))]",
  sm: "sm:grid-cols-[repeat(var(--tw-grid-cols-sm),minmax(0,1fr))]",
  md: "md:grid-cols-[repeat(var(--tw-grid-cols-md),minmax(0,1fr))]",
  lg: "lg:grid-cols-[repeat(var(--tw-grid-cols-lg),minmax(0,1fr))]",
  xl: "xl:grid-cols-[repeat(var(--tw-grid-cols-xl),minmax(0,1fr))]",
};

const GRID_GUTTER_CLASSES: ClassNameVariants = {
  base: "gap-[var(--tw-grid-gap)]",
  sm: "sm:gap-[var(--tw-grid-gap-sm)]",
  md: "md:gap-[var(--tw-grid-gap-md)]",
  lg: "lg:gap-[var(--tw-grid-gap-lg)]",
  xl: "xl:gap-[var(--tw-grid-gap-xl)]",
};

const GRID_ALIGN_CLASSES: Record<GridAlign, ClassNameVariants> = {
  stretch: {
    base: "items-stretch",
    sm: "sm:items-stretch",
    md: "md:items-stretch",
    lg: "lg:items-stretch",
    xl: "xl:items-stretch",
  },
  center: {
    base: "items-center",
    sm: "sm:items-center",
    md: "md:items-center",
    lg: "lg:items-center",
    xl: "xl:items-center",
  },
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
};

const GRID_JUSTIFY_CLASSES: Record<GridJustify, ClassNameVariants> = {
  "flex-start": {
    base: "justify-start",
    sm: "sm:justify-start",
    md: "md:justify-start",
    lg: "lg:justify-start",
    xl: "xl:justify-start",
  },
  center: {
    base: "justify-center",
    sm: "sm:justify-center",
    md: "md:justify-center",
    lg: "lg:justify-center",
    xl: "xl:justify-center",
  },
  "flex-end": {
    base: "justify-end",
    sm: "sm:justify-end",
    md: "md:justify-end",
    lg: "lg:justify-end",
    xl: "xl:justify-end",
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

function spacing_token_to_css_value(token: string): string {
  const twValue = Number(SPACING_TO_TW[token as keyof typeof SPACING_TO_TW]);
  if (Number.isNaN(twValue)) return token;
  return `${twValue * 0.25}rem`;
}

function normalize_spacing(value: SpacingValue): string {
  if (typeof value === "number") return value === 0 ? "0px" : `${value}px`;
  if (typeof value === "string" && is_spacing_token(value)) {
    return spacing_token_to_css_value(value);
  }
  return String(value);
}

function grid_cols_var(bp: keyof ClassNameVariants): string {
  return `--tw-grid-cols${bp === "base" ? "" : `-${bp}`}`;
}

function grid_gap_var(bp: keyof ClassNameVariants): string {
  return `--tw-grid-gap${bp === "base" ? "" : `-${bp}`}`;
}

const GridImpl = React.forwardRef<unknown, GridProps<React.ElementType>>(function Grid(
  props,
  ref,
) {
  const {
    component,
    as,
    className,
    style,
    columns = 12,
    gutter = "md",
    align,
    justify,

    // style props
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

  const classes: string[] = ["grid"];
  const gridStyle: StyleVars = {};

  // columns
  for (const [bp, value] of to_entries(columns)) {
    gridStyle[grid_cols_var(bp as keyof ClassNameVariants)] = String(value);
    if (GRID_COLUMN_CLASSES[bp as keyof ClassNameVariants]) {
      classes.push(GRID_COLUMN_CLASSES[bp as keyof ClassNameVariants]);
    }
  }

  // gutter
  for (const [bp, value] of to_entries(gutter)) {
    gridStyle[grid_gap_var(bp as keyof ClassNameVariants)] = normalize_spacing(value);
    classes.push(GRID_GUTTER_CLASSES[bp as keyof ClassNameVariants]);
  }

  classes.push(
    ...responsive_class_list(align, GRID_ALIGN_CLASSES),
    ...responsive_class_list(justify, GRID_JUSTIFY_CLASSES),
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
    display,
    pos,
    ta,
    radius,
    shadow,
  });

  const combinedStyle = { ...generatedStyle, ...gridStyle };
  const mergedStyle = merge_styles(combinedStyle, style);
  const mergedClasses = cn(classes, classNames, className);

  return (
    <Component
      ref={ref as React.ComponentPropsWithRef<typeof Component>["ref"]}
      className={mergedClasses}
      style={mergedStyle}
      {...(rest as object)}
    />
  );
});

GridImpl.displayName = "Grid";

// COL SUPPORT
type GridColOwnProps = StyleProps & {
  component?: React.ElementType;
  as?: React.ElementType;
  span?: ResponsiveProp<number>;
  offset?: ResponsiveProp<number>;
  order?: ResponsiveProp<number>;
};

export type GridColProps<C extends React.ElementType = "div"> = GridColOwnProps &
  Omit<React.ComponentPropsWithoutRef<C>, keyof GridColOwnProps | "as">;

const COL_SPAN_CLASSES: ClassNameVariants = {
  base: "col-span-[var(--tw-col-span)]",
  sm: "sm:col-span-[var(--tw-col-span-sm)]",
  md: "md:col-span-[var(--tw-col-span-md)]",
  lg: "lg:col-span-[var(--tw-col-span-lg)]",
  xl: "xl:col-span-[var(--tw-col-span-xl)]",
};

const COL_START_CLASSES: ClassNameVariants = {
  base: "col-start-[var(--tw-col-start)]",
  sm: "sm:col-start-[var(--tw-col-start-sm)]",
  md: "md:col-start-[var(--tw-col-start-md)]",
  lg: "lg:col-start-[var(--tw-col-start-lg)]",
  xl: "xl:col-start-[var(--tw-col-start-xl)]",
};

const COL_ORDER_CLASSES: ClassNameVariants = {
  base: "order-[var(--tw-col-order)]",
  sm: "sm:order-[var(--tw-col-order-sm)]",
  md: "md:order-[var(--tw-col-order-md)]",
  lg: "lg:order-[var(--tw-col-order-lg)]",
  xl: "xl:order-[var(--tw-col-order-xl)]",
};

function col_span_var(bp: keyof ClassNameVariants): string {
  return `--tw-col-span${bp === "base" ? "" : `-${bp}`}`;
}

function col_start_var(bp: keyof ClassNameVariants): string {
  return `--tw-col-start${bp === "base" ? "" : `-${bp}`}`;
}

function col_order_var(bp: keyof ClassNameVariants): string {
  return `--tw-col-order${bp === "base" ? "" : `-${bp}`}`;
}

const GridColImpl = React.forwardRef<unknown, GridColProps<React.ElementType>>(function GridCol(
  props,
  ref,
) {
  const {
    component,
    as,
    className,
    style,
    span = 12,
    offset = 0,
    order,

    // style props
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
    gap,
    columnGap,
    rowGap,

    ...rest
  } = props;

  const Component = (component ?? as ?? "div") as React.ElementType;

  const classes: string[] = [];
  const styleVars: StyleVars = {};

  // base defaults
  const baseSpan =
    typeof span === "object" && span !== null && !Array.isArray(span) && "base" in span
      ? (span as Record<string, number>).base ?? 12
      : (span as number | undefined) ?? 12;
  styleVars[col_span_var("base")] = String(baseSpan);
  classes.push(COL_SPAN_CLASSES.base);

  const baseOffset =
    typeof offset === "object" && offset !== null && !Array.isArray(offset) && "base" in offset
      ? (offset as Record<string, number>).base ?? 0
      : (offset as number | undefined) ?? 0;
  styleVars[col_start_var("base")] = String(baseOffset + 1);
  classes.push(COL_START_CLASSES.base);

  const baseOrder =
    typeof order === "object" && order !== null && !Array.isArray(order) && "base" in order
      ? (order as Record<string, number>).base
      : (typeof order === "number" ? order : undefined);
  if (baseOrder !== undefined) {
    styleVars[col_order_var("base")] = String(baseOrder);
    classes.push(COL_ORDER_CLASSES.base);
  }

  for (const [bp, value] of to_entries(span)) {
    if (bp === "base") continue;
    styleVars[col_span_var(bp as keyof ClassNameVariants)] = String(value ?? baseSpan);
    classes.push(COL_SPAN_CLASSES[bp as keyof ClassNameVariants]);
  }

  for (const [bp, value] of to_entries(offset)) {
    if (bp === "base") continue;
    styleVars[col_start_var(bp as keyof ClassNameVariants)] = String((value ?? baseOffset) + 1);
    classes.push(COL_START_CLASSES[bp as keyof ClassNameVariants]);
  }

  if (order !== undefined) {
    for (const [bp, value] of to_entries(order)) {
      if (bp === "base") continue;
      styleVars[col_order_var(bp as keyof ClassNameVariants)] = String(value);
      classes.push(COL_ORDER_CLASSES[bp as keyof ClassNameVariants]);
    }
  }

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

  const mergedStyle = merge_styles({ ...generatedStyle, ...styleVars }, style);
  const mergedClassName = cn(classes, classNames, className);

  return (
    <Component
      ref={ref as React.ComponentPropsWithRef<typeof Component>["ref"]}
      className={mergedClassName}
      style={mergedStyle}
      {...(rest as object)}
    />
  );
});

GridColImpl.displayName = "Grid.Col";

export const GridCol = GridColImpl;

type GridComponent = typeof GridImpl & { Col: typeof GridCol };

export const Grid = Object.assign(GridImpl, { Col: GridCol }) as GridComponent;
