 import * as React from "react";
import { cn } from "@/lib/utils";
import type { BoxProps } from "../Box/Box";
import { Box } from "../Box/Box";
import type { ClassNameVariants } from "../style_props";
import { responsive_class_list } from "../style_props";
import type { Breakpoint, ResponsiveProp } from "../responsive";
import { is_responsive_object, to_entries } from "../responsive";

type PolymorphicRef<C extends React.ElementType> = React.ComponentPropsWithRef<C>["ref"];

export type ContainerYToken = "none" | "tiny" | "small" | "medium" | "large" | "hero";
export type ContainerXToken = "none" | "tiny" | "small" | "medium" | "large" | "extraLarge";

type ContainerOwnProps = {
  /**
   * Vertical spacing.
   * axisY sets both top + bottom; top / bottom override per side.
   */
  axisY?: ResponsiveProp<ContainerYToken>;
  top?: ResponsiveProp<ContainerYToken>;
  bottom?: ResponsiveProp<ContainerYToken>;
  /**
   * Horizontal spacing.
   * axisX sets both left + right; left / right override per side.
   */
  axisX?: ResponsiveProp<ContainerXToken>;
  left?: ResponsiveProp<ContainerXToken>;
  right?: ResponsiveProp<ContainerXToken>;
  /**
   * Disable the auto margin system (mx-auto + proportional vertical margin).
   */
  disableMargin?: boolean;
};

export type ContainerProps<C extends React.ElementType = "div"> = ContainerOwnProps &
  Omit<
    BoxProps<C>,
    | keyof ContainerOwnProps
    | "p"
    | "px"
    | "py"
    | "pt"
    | "pr"
    | "pb"
    | "pl"
  >;

type ContainerComponent = (<C extends React.ElementType = "div">(
  props: ContainerProps<C> & { ref?: PolymorphicRef<C> },
) => React.ReactElement | null) & { displayName?: string };

const DEFAULT_AXIS_Y: ContainerYToken = "medium";
const DEFAULT_AXIS_X: ContainerXToken = "medium";

const Y_VALUE_MAP: Record<ContainerYToken, string> = {
  none: "0",
  tiny: "2",
  small: "4",
  medium: "6",
  large: "10",
  hero: "16",
};

const X_VALUE_MAP: Record<ContainerXToken, string> = {
  none: "0",
  tiny: "2",
  small: "4",
  medium: "6",
  large: "8",
  extraLarge: "12",
};

function build_classes<T extends string>(
  values: Record<T, string>,
  prefix: "pt" | "pb" | "pl" | "pr" | "mt" | "mb",
): Record<T, ClassNameVariants> {
  return (Object.entries(values) as Array<[T, string]>).reduce(
    (acc, [token, tw]) => {
      acc[token] = {
        base: `${prefix}-${tw}`,
        sm: `sm:${prefix}-${tw}`,
        md: `md:${prefix}-${tw}`,
        lg: `lg:${prefix}-${tw}`,
        xl: `xl:${prefix}-${tw}`,
      };
      return acc;
    },
    {} as Record<T, ClassNameVariants>,
  );
}

const container_top_classes = build_classes(Y_VALUE_MAP, "pt");
const container_bottom_classes = build_classes(Y_VALUE_MAP, "pb");
const container_left_classes = build_classes(X_VALUE_MAP, "pl");
const container_right_classes = build_classes(X_VALUE_MAP, "pr");
const container_margin_top_classes = build_classes(Y_VALUE_MAP, "mt");
const container_margin_bottom_classes = build_classes(Y_VALUE_MAP, "mb");

function normalize_responsive<T>(
  value: ResponsiveProp<T> | undefined,
): Partial<Record<Breakpoint, T>> {
  if (value === undefined) return {};
  if (is_responsive_object(value)) return value as Partial<Record<Breakpoint, T>>;
  return { base: value as T };
}

function merge_responsive<T>(
  axisValue: ResponsiveProp<T> | undefined,
  override: ResponsiveProp<T> | undefined,
): ResponsiveProp<T> | undefined {
  const baseValues = normalize_responsive(axisValue);
  const overrideValues = normalize_responsive(override);

  const merged: Partial<Record<Breakpoint, T>> = { ...baseValues };
  for (const [bp, val] of Object.entries(overrideValues) as Array<[Breakpoint, T]>) {
    merged[bp] = val;
  }

  const keys = Object.keys(merged);
  if (!keys.length) return undefined;

  if (keys.length === 1 && merged.base !== undefined) {
    return merged.base as ResponsiveProp<T>;
  }
  return merged as ResponsiveProp<T>;
}

function map_responsive<T, R>(
  value: ResponsiveProp<T> | undefined,
  mapper: (val: T) => R,
): ResponsiveProp<R> | undefined {
  if (value === undefined) return undefined;

  if (is_responsive_object(value)) {
    const mapped: Partial<Record<Breakpoint, R>> = {};
    for (const [bp, val] of to_entries(value)) mapped[bp] = mapper(val);
    return mapped as ResponsiveProp<R>;
  }
  return mapper(value as T);
}

function softer_margin(token: ContainerYToken): ContainerYToken {
  switch (token) {
    case "hero":
      return "large";
    case "large":
      return "medium";
    case "medium":
      return "small";
    case "small":
      return "tiny";
    case "tiny":
    case "none":
    default:
      return "none";
  }
}

/**
 * Container
 *
 * Provides horizontal gutters and vertical block spacing on top of the Box primitive.
 *
 * Examples:
 * <Container>Content</Container>
 * <Container axisX={{ base: "medium", lg: "large" }} axisY="large">Marketing hero</Container>
 * <Container top="hero" bottom="medium" disableMargin>Custom landing section</Container>
 *
 * Smoke tests (expected classes):
 * - <Container axisX="extraLarge" axisY="hero" /> => pl-12 pr-12 pt-16 pb-16 (plus responsive variants if provided)
 * - <Container axisY={{ base: "small", md: "hero" }} /> => pt-4 pb-4 and md:pt-16 md:pb-16
 * - <Container axisY="hero" top="tiny" /> => top uses tiny, bottom uses hero
 */
const ContainerImpl = React.forwardRef<unknown, ContainerProps<React.ElementType>>(function Container(
  props,
  ref,
) {
  const {
    component,
    as,
    className,
    axisY = DEFAULT_AXIS_Y,
    top,
    bottom,
    axisX = DEFAULT_AXIS_X,
    left,
    right,
    disableMargin = false,

    // margin props kept to allow user overrides
    m,
    mx,
    my,
    mt,
    mr,
    mb,
    ml,

    ...rest
  } = props;

  const resolvedTop = merge_responsive(axisY, top);
  const resolvedBottom = merge_responsive(axisY, bottom);
  const resolvedLeft = merge_responsive(axisX, left);
  const resolvedRight = merge_responsive(axisX, right);

  const paddingClasses = [
    ...responsive_class_list(resolvedTop, container_top_classes),
    ...responsive_class_list(resolvedBottom, container_bottom_classes),
    ...responsive_class_list(resolvedLeft, container_left_classes),
    ...responsive_class_list(resolvedRight, container_right_classes),
  ];

  const hasVerticalMarginProp = m !== undefined || my !== undefined || mt !== undefined || mb !== undefined;
  const hasHorizontalMarginProp = m !== undefined || mx !== undefined || ml !== undefined || mr !== undefined;

  const autoMarginTopTokens =
    !disableMargin && !hasVerticalMarginProp
      ? map_responsive(resolvedTop ?? axisY, softer_margin)
      : undefined;
  const autoMarginBottomTokens =
    !disableMargin && !hasVerticalMarginProp
      ? map_responsive(resolvedBottom ?? axisY, softer_margin)
      : undefined;

  const autoMarginClasses = [
    !disableMargin && !hasHorizontalMarginProp ? "mx-auto" : null,
    ...responsive_class_list(autoMarginTopTokens, container_margin_top_classes),
    ...responsive_class_list(autoMarginBottomTokens, container_margin_bottom_classes),
  ];

  const composedClassName = cn(paddingClasses, autoMarginClasses, className);

  return (
    <Box
      ref={ref as React.ComponentPropsWithRef<typeof Box>["ref"]}
      component={component}
      as={as}
      className={composedClassName}
      m={m}
      mx={mx}
      my={my}
      mt={mt}
      mr={mr}
      mb={mb}
      ml={ml}
      {...(rest as object)}
    />
  );
}) as ContainerComponent;

ContainerImpl.displayName = "Container";

export const Container = ContainerImpl;  