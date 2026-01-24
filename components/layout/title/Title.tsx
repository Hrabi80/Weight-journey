import * as React from "react";
import { cn } from "@/lib/utils";
import type { Breakpoint, ResponsiveProp } from "../responsive";
import { to_entries } from "../responsive";
import type { ClassNameVariants, StyleProps } from "../style_props";
import { merge_styles, resolve_style_props } from "../style_props";

type PolymorphicRef<C extends React.ElementType> = React.ComponentPropsWithRef<C>["ref"];

type TitleOrder = 1 | 2 | 3 | 4 | 5 | 6;
type TitleSizeToken =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl";
type TitleSizeValue = TitleSizeToken | number | string;
type StyleVars = Record<string, string | number | undefined>;

type FontWeightToken =
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900
  | "thin"
  | "extralight"
  | "light"
  | "normal"
  | "medium"
  | "semibold"
  | "bold"
  | "extrabold"
  | "black";
type FontWeightValue = FontWeightToken | string | number;

type TitleOwnProps = StyleProps & {
  component?: React.ElementType;
  as?: React.ElementType;
  order?: TitleOrder;
  size?: ResponsiveProp<TitleSizeValue>;
  fw?: ResponsiveProp<FontWeightValue>;
  ta?: ResponsiveProp<StyleProps["ta"]>;
};

export type TitleProps<C extends React.ElementType = "h1"> = TitleOwnProps &
  Omit<React.ComponentPropsWithoutRef<C>, keyof TitleOwnProps | "as">;

type TitleComponent = (<C extends React.ElementType = "h1">(
  props: TitleProps<C> & { ref?: PolymorphicRef<C> },
) => React.ReactElement | null) & { displayName?: string };

const TITLE_SIZE_TOKEN_CLASSES: Record<TitleSizeToken, ClassNameVariants> = {
  h1: {
    base: "text-4xl",
    sm: "sm:text-4xl",
    md: "md:text-4xl",
    lg: "lg:text-4xl",
    xl: "xl:text-4xl",
  },
  h2: {
    base: "text-3xl",
    sm: "sm:text-3xl",
    md: "md:text-3xl",
    lg: "lg:text-3xl",
    xl: "xl:text-3xl",
  },
  h3: {
    base: "text-2xl",
    sm: "sm:text-2xl",
    md: "md:text-2xl",
    lg: "lg:text-2xl",
    xl: "xl:text-2xl",
  },
  h4: {
    base: "text-xl",
    sm: "sm:text-xl",
    md: "md:text-xl",
    lg: "lg:text-xl",
    xl: "xl:text-xl",
  },
  h5: {
    base: "text-lg",
    sm: "sm:text-lg",
    md: "md:text-lg",
    lg: "lg:text-lg",
    xl: "xl:text-lg",
  },
  h6: {
    base: "text-base",
    sm: "sm:text-base",
    md: "md:text-base",
    lg: "lg:text-base",
    xl: "xl:text-base",
  },
  xs: {
    base: "text-xs",
    sm: "sm:text-xs",
    md: "md:text-xs",
    lg: "lg:text-xs",
    xl: "xl:text-xs",
  },
  sm: {
    base: "text-sm",
    sm: "sm:text-sm",
    md: "md:text-sm",
    lg: "lg:text-sm",
    xl: "xl:text-sm",
  },
  md: {
    base: "text-base",
    sm: "sm:text-base",
    md: "md:text-base",
    lg: "lg:text-base",
    xl: "xl:text-base",
  },
  lg: {
    base: "text-lg",
    sm: "sm:text-lg",
    md: "md:text-lg",
    lg: "lg:text-lg",
    xl: "xl:text-lg",
  },
  xl: {
    base: "text-xl",
    sm: "sm:text-xl",
    md: "md:text-xl",
    lg: "lg:text-xl",
    xl: "xl:text-xl",
  },
};

const TITLE_SIZE_VAR_CLASSES: ClassNameVariants = {
  base: "text-[var(--tw-title-size)]",
  sm: "sm:text-[var(--tw-title-size-sm)]",
  md: "md:text-[var(--tw-title-size-md)]",
  lg: "lg:text-[var(--tw-title-size-lg)]",
  xl: "xl:text-[var(--tw-title-size-xl)]",
};

const FONT_WEIGHT_TOKEN_CLASSES: Record<
  Exclude<FontWeightToken, number>,
  ClassNameVariants
> = {
  thin: {
    base: "font-thin",
    sm: "sm:font-thin",
    md: "md:font-thin",
    lg: "lg:font-thin",
    xl: "xl:font-thin",
  },
  extralight: {
    base: "font-extralight",
    sm: "sm:font-extralight",
    md: "md:font-extralight",
    lg: "lg:font-extralight",
    xl: "xl:font-extralight",
  },
  light: {
    base: "font-light",
    sm: "sm:font-light",
    md: "md:font-light",
    lg: "lg:font-light",
    xl: "xl:font-light",
  },
  normal: {
    base: "font-normal",
    sm: "sm:font-normal",
    md: "md:font-normal",
    lg: "lg:font-normal",
    xl: "xl:font-normal",
  },
  medium: {
    base: "font-medium",
    sm: "sm:font-medium",
    md: "md:font-medium",
    lg: "lg:font-medium",
    xl: "xl:font-medium",
  },
  semibold: {
    base: "font-semibold",
    sm: "sm:font-semibold",
    md: "md:font-semibold",
    lg: "lg:font-semibold",
    xl: "xl:font-semibold",
  },
  bold: {
    base: "font-bold",
    sm: "sm:font-bold",
    md: "md:font-bold",
    lg: "lg:font-bold",
    xl: "xl:font-bold",
  },
  extrabold: {
    base: "font-extrabold",
    sm: "sm:font-extrabold",
    md: "md:font-extrabold",
    lg: "lg:font-extrabold",
    xl: "xl:font-extrabold",
  },
  black: {
    base: "font-black",
    sm: "sm:font-black",
    md: "md:font-black",
    lg: "lg:font-black",
    xl: "xl:font-black",
  },
};

const FONT_WEIGHT_VAR_CLASSES: ClassNameVariants = {
  base: "font-[var(--tw-title-fw)]",
  sm: "sm:font-[var(--tw-title-fw-sm)]",
  md: "md:font-[var(--tw-title-fw-md)]",
  lg: "lg:font-[var(--tw-title-fw-lg)]",
  xl: "xl:font-[var(--tw-title-fw-xl)]",
};

function normalize_css_value(value: number | string): string {
  if (typeof value === "number") return value === 0 ? "0px" : `${value}px`;
  return value;
}

function map_weight_token(value: FontWeightToken): keyof typeof FONT_WEIGHT_TOKEN_CLASSES {
  if (typeof value === "number") {
    switch (value) {
      case 100:
        return "thin";
      case 200:
        return "extralight";
      case 300:
        return "light";
      case 400:
        return "normal";
      case 500:
        return "medium";
      case 600:
        return "semibold";
      case 700:
        return "bold";
      case 800:
        return "extrabold";
      case 900:
        return "black";
      default:
        return "normal";
    }
  }
  return value;
}

function apply_size(
  value: ResponsiveProp<TitleSizeValue> | undefined,
  classes: string[],
  style: StyleVars,
): void {
  if (value === undefined) return;
  for (const [bp, v] of to_entries(value)) {
    if (typeof v === "string" && v in TITLE_SIZE_TOKEN_CLASSES) {
      classes.push(TITLE_SIZE_TOKEN_CLASSES[v as TitleSizeToken][bp as keyof ClassNameVariants]);
    } else if (typeof v === "number" || typeof v === "string") {
      classes.push(TITLE_SIZE_VAR_CLASSES[bp as keyof ClassNameVariants]);
      style[title_size_var_name(bp as Breakpoint)] = normalize_css_value(v);
    }
  }
}

function apply_weight(
  value: ResponsiveProp<FontWeightValue> | undefined,
  classes: string[],
  style: StyleVars,
): void {
  if (value === undefined) return;
  for (const [bp, v] of to_entries(value)) {
    if (typeof v === "string" && v in FONT_WEIGHT_TOKEN_CLASSES) {
      const key = v as keyof typeof FONT_WEIGHT_TOKEN_CLASSES;
      classes.push(FONT_WEIGHT_TOKEN_CLASSES[key][bp as keyof ClassNameVariants]);
    } else if (typeof v === "number" && v >= 100 && v <= 900 && v % 100 === 0) {
      const mapped = map_weight_token(v as FontWeightToken);
      classes.push(FONT_WEIGHT_TOKEN_CLASSES[mapped][bp as keyof ClassNameVariants]);
    } else {
      classes.push(FONT_WEIGHT_VAR_CLASSES[bp as keyof ClassNameVariants]);
      style[title_weight_var_name(bp as Breakpoint)] = String(v);
    }
  }
}

function title_size_var_name(bp: Breakpoint): string {
  return `--tw-title-size${bp === "base" ? "" : `-${bp}`}`;
}

function title_weight_var_name(bp: Breakpoint): string {
  return `--tw-title-fw${bp === "base" ? "" : `-${bp}`}`;
}

const TitleImpl = React.forwardRef<unknown, TitleProps<React.ElementType>>(function Title(
  props,
  ref,
) {
  const {
    component,
    as,
    order = 1,
    size,
    fw,
    ta,
    className,
    style,

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
    radius,
    shadow,

    ...rest
  } = props;

  const Component = (component ?? as ?? `h${order}`) as React.ElementType;

  const titleClasses: string[] = [];
  const titleStyle: StyleVars = {};

  const fallbackSizeToken = `h${order}` as TitleSizeToken;
  apply_size(size ?? fallbackSizeToken, titleClasses, titleStyle);
  apply_weight(fw ?? 700, titleClasses, titleStyle);

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

  const classes = cn(titleClasses, classNames, className);
  const mergedStyle = merge_styles({ ...generatedStyle, ...titleStyle }, style);

  return (
    <Component
      ref={ref as React.ComponentPropsWithRef<typeof Component>["ref"]}
      className={classes}
      style={mergedStyle}
      {...(rest as object)}
    />
  );
}) as TitleComponent;

TitleImpl.displayName = "Title";

export const Title = TitleImpl;
