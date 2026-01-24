import * as React from "react";
import { cn } from "@/lib/utils";
import type { Breakpoint, ResponsiveProp } from "../responsive";
import { to_entries } from "../responsive";
import type { ClassNameVariants, StyleProps } from "../style_props";
import { merge_styles, resolve_style_props } from "../style_props";

type PolymorphicRef<C extends React.ElementType> = React.ComponentPropsWithRef<C>["ref"];

type TextSizeToken = "xs" | "sm" | "md" | "lg" | "xl";
type TextSizeValue = TextSizeToken | number | string;
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

type TextOwnProps = StyleProps & {
  component?: React.ElementType;
  as?: React.ElementType;
  span?: boolean;
  size?: ResponsiveProp<TextSizeValue>;
  fw?: ResponsiveProp<FontWeightValue>;
  ta?: ResponsiveProp<StyleProps["ta"]>;
  truncate?: boolean;
  lineClamp?: number;
  inherit?: boolean;
};

export type TextProps<C extends React.ElementType = "p"> = TextOwnProps &
  Omit<React.ComponentPropsWithoutRef<C>, keyof TextOwnProps | "as">;

type TextComponent = (<C extends React.ElementType = "p">(
  props: TextProps<C> & { ref?: PolymorphicRef<C> },
) => React.ReactElement | null) & { displayName?: string };

const TEXT_SIZE_TOKEN_CLASSES: Record<TextSizeToken, ClassNameVariants> = {
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

const TEXT_SIZE_VAR_CLASSES: ClassNameVariants = {
  base: "text-[var(--tw-text-size)]",
  sm: "sm:text-[var(--tw-text-size-sm)]",
  md: "md:text-[var(--tw-text-size-md)]",
  lg: "lg:text-[var(--tw-text-size-lg)]",
  xl: "xl:text-[var(--tw-text-size-xl)]",
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
  base: "font-[var(--tw-text-fw)]",
  sm: "sm:font-[var(--tw-text-fw-sm)]",
  md: "md:font-[var(--tw-text-fw-md)]",
  lg: "lg:font-[var(--tw-text-fw-lg)]",
  xl: "xl:font-[var(--tw-text-fw-xl)]",
};

function normalize_css_value(value: string | number): string {
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
  value: ResponsiveProp<TextSizeValue> | undefined,
  classes: string[],
  style: StyleVars,
): void {
  if (value === undefined) return;

  for (const [bp, v] of to_entries(value)) {
    if (typeof v === "string" && v in TEXT_SIZE_TOKEN_CLASSES) {
      const token = v as TextSizeToken;
      classes.push(TEXT_SIZE_TOKEN_CLASSES[token][bp as keyof ClassNameVariants]);
    } else if (typeof v === "number" || typeof v === "string") {
      classes.push(TEXT_SIZE_VAR_CLASSES[bp as keyof ClassNameVariants]);
      style[text_size_var_name(bp as Breakpoint)] = normalize_css_value(v);
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
      style[font_weight_var_name(bp as Breakpoint)] = String(v);
    }
  }
}

function text_size_var_name(bp: Breakpoint): string {
  return `--tw-text-size${bp === "base" ? "" : `-${bp}`}`;
}

function font_weight_var_name(bp: Breakpoint): string {
  return `--tw-text-fw${bp === "base" ? "" : `-${bp}`}`;
}

const TextImpl = React.forwardRef<unknown, TextProps<React.ElementType>>(function Text(
  props,
  ref,
) {
  const {
    component,
    as,
    span,
    className,
    style,
    size,
    fw,
    ta,
    truncate,
    lineClamp,
    inherit,

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

  const Component = (component ?? as ?? (span ? "span" : "p")) as React.ElementType;

  const textClasses: string[] = [];
  const textStyle: StyleVars = {};

  const effectiveSize = inherit ? undefined : size ?? "md";
  const effectiveWeight = inherit ? undefined : fw;

  apply_size(effectiveSize, textClasses, textStyle);
  apply_weight(effectiveWeight, textClasses, textStyle);

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

  const clampStyle: StyleVars =
    lineClamp && lineClamp > 0
      ? {
          display: "-webkit-box",
          WebkitLineClamp: lineClamp,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }
      : {};

  const classes = cn(truncate ? "truncate" : undefined, textClasses, classNames, className);

  const mergedStyle = merge_styles(
    { ...generatedStyle, ...textStyle, ...clampStyle },
    style,
  );

  return (
    <Component
      ref={ref as React.ComponentPropsWithRef<typeof Component>["ref"]}
      className={classes}
      style={mergedStyle}
      {...(rest as object)}
    />
  );
}) as TextComponent;

TextImpl.displayName = "Text";

export const Text = TextImpl;
