import * as React from "react";
import { cn } from "@/lib/utils";
import type { StyleProps } from "../style_props";
import { merge_styles, resolve_style_props } from "../style_props";

type PolymorphicRef<C extends React.ElementType> = React.ComponentPropsWithRef<C>["ref"];

type BoxOwnProps = StyleProps & {
  /**
   * Choose which element/component gets rendered.
   * - `component` is Mantine-style
   * - `as` is a common React convention
   * If both are provided, `component` wins.
   */
  component?: React.ElementType;
  as?: React.ElementType;
};

export type BoxProps<C extends React.ElementType = "div"> = BoxOwnProps &
  Omit<React.ComponentPropsWithoutRef<C>, keyof BoxOwnProps | "as">;

/**
 * Box
 *
 * A small, Mantine-inspired “layout primitive” that renders an element (div by default)
 * and converts a few common props into Tailwind utility classes.
 *
 * Why token-based spacing?
 * - Tailwind can only generate classes it knows at build time.
 * - Using spacing tokens (instead of arbitrary numbers) keeps class names predictable and safe.
 *
 * When to use `className` / `style` instead:
 * - Any CSS that is not supported by the props below
 * - One-off custom styling
 */
type BoxComponent = (<C extends React.ElementType = "div">(
  props: BoxProps<C> & { ref?: PolymorphicRef<C> },
) => React.ReactElement | null) & { displayName?: string };

type BoxImplProps = BoxProps<React.ElementType>;

const BoxImpl = React.forwardRef<unknown, BoxImplProps>(function Box(props, ref) {
  const {
    component,
    as,
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
    ta,
    radius,
    shadow,

    ...rest
  } = props;

  const Component = (component ?? as ?? "div") as React.ElementType;

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

  const classes = cn(classNames, className);
  const mergedStyle = merge_styles(generatedStyle, style);

  return (
    <Component
      ref={ref as React.ComponentPropsWithRef<typeof Component>["ref"]}
      className={classes}
      style={mergedStyle}
      {...(rest as object)}
    />
  );
}) as unknown as BoxComponent;

BoxImpl.displayName = "Box";

export const Box = BoxImpl;
