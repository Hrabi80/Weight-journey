import * as React from "react";
import { cn } from "@/lib/utils";
import type { StyleProps } from "../style_props";
import { merge_styles, resolve_style_props } from "../style_props";

type PolymorphicRef<C extends React.ElementType> = React.ComponentPropsWithRef<C>["ref"];

type PaperOwnProps = StyleProps & {
  component?: React.ElementType;
  as?: React.ElementType;
  withBorder?: boolean;
};

export type PaperProps<C extends React.ElementType = "div"> = PaperOwnProps &
  Omit<React.ComponentPropsWithoutRef<C>, keyof PaperOwnProps | "as">;

type PaperComponent = (<C extends React.ElementType = "div">(
  props: PaperProps<C> & { ref?: PolymorphicRef<C> },
) => React.ReactElement | null) & { displayName?: string };

const PaperImpl = React.forwardRef<unknown, PaperProps<React.ElementType>>(function Paper(
  props,
  ref,
) {
  const {
    component,
    as,
    className,
    style,
    withBorder,

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
  const baseBackground = "bg-background";
  const borderClasses = withBorder ? "border border-border" : undefined;

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
    gap,
    columnGap,
    rowGap,
  });

  const classes = cn(baseBackground, borderClasses, classNames, className);
  const mergedStyle = merge_styles(generatedStyle, style);

  return (
    <Component
      ref={ref as React.ComponentPropsWithRef<typeof Component>["ref"]}
      className={classes}
      style={mergedStyle}
      {...(rest as object)}
    />
  );
}) as PaperComponent;

PaperImpl.displayName = "Paper";

export const Paper = PaperImpl;
