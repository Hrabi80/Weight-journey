import * as React from "react";
import type { Breakpoint, ResponsiveProp } from "./responsive";
import { to_entries } from "./responsive";
import type { SpacingToken } from "./spacing";
import { is_spacing_token } from "./spacing";

export type SpacingValue = SpacingToken | number | string;

type SpacingKind =
  | "p"
  | "px"
  | "py"
  | "pt"
  | "pr"
  | "pb"
  | "pl"
  | "m"
  | "mx"
  | "my"
  | "mt"
  | "mr"
  | "mb"
  | "ml"
  | "gap"
  | "gap-x"
  | "gap-y";

export type ClassNameVariants = Record<Breakpoint, string>;

const SPACING_VAR_CLASSES: Record<SpacingKind, ClassNameVariants> = {
  p: {
    base: "p-[var(--tw-p)]",
    sm: "sm:p-[var(--tw-p-sm)]",
    md: "md:p-[var(--tw-p-md)]",
    lg: "lg:p-[var(--tw-p-lg)]",
    xl: "xl:p-[var(--tw-p-xl)]",
  },
  px: {
    base: "px-[var(--tw-px)]",
    sm: "sm:px-[var(--tw-px-sm)]",
    md: "md:px-[var(--tw-px-md)]",
    lg: "lg:px-[var(--tw-px-lg)]",
    xl: "xl:px-[var(--tw-px-xl)]",
  },
  py: {
    base: "py-[var(--tw-py)]",
    sm: "sm:py-[var(--tw-py-sm)]",
    md: "md:py-[var(--tw-py-md)]",
    lg: "lg:py-[var(--tw-py-lg)]",
    xl: "xl:py-[var(--tw-py-xl)]",
  },
  pt: {
    base: "pt-[var(--tw-pt)]",
    sm: "sm:pt-[var(--tw-pt-sm)]",
    md: "md:pt-[var(--tw-pt-md)]",
    lg: "lg:pt-[var(--tw-pt-lg)]",
    xl: "xl:pt-[var(--tw-pt-xl)]",
  },
  pr: {
    base: "pr-[var(--tw-pr)]",
    sm: "sm:pr-[var(--tw-pr-sm)]",
    md: "md:pr-[var(--tw-pr-md)]",
    lg: "lg:pr-[var(--tw-pr-lg)]",
    xl: "xl:pr-[var(--tw-pr-xl)]",
  },
  pb: {
    base: "pb-[var(--tw-pb)]",
    sm: "sm:pb-[var(--tw-pb-sm)]",
    md: "md:pb-[var(--tw-pb-md)]",
    lg: "lg:pb-[var(--tw-pb-lg)]",
    xl: "xl:pb-[var(--tw-pb-xl)]",
  },
  pl: {
    base: "pl-[var(--tw-pl)]",
    sm: "sm:pl-[var(--tw-pl-sm)]",
    md: "md:pl-[var(--tw-pl-md)]",
    lg: "lg:pl-[var(--tw-pl-lg)]",
    xl: "xl:pl-[var(--tw-pl-xl)]",
  },
  m: {
    base: "m-[var(--tw-m)]",
    sm: "sm:m-[var(--tw-m-sm)]",
    md: "md:m-[var(--tw-m-md)]",
    lg: "lg:m-[var(--tw-m-lg)]",
    xl: "xl:m-[var(--tw-m-xl)]",
  },
  mx: {
    base: "mx-[var(--tw-mx)]",
    sm: "sm:mx-[var(--tw-mx-sm)]",
    md: "md:mx-[var(--tw-mx-md)]",
    lg: "lg:mx-[var(--tw-mx-lg)]",
    xl: "xl:mx-[var(--tw-mx-xl)]",
  },
  my: {
    base: "my-[var(--tw-my)]",
    sm: "sm:my-[var(--tw-my-sm)]",
    md: "md:my-[var(--tw-my-md)]",
    lg: "lg:my-[var(--tw-my-lg)]",
    xl: "xl:my-[var(--tw-my-xl)]",
  },
  mt: {
    base: "mt-[var(--tw-mt)]",
    sm: "sm:mt-[var(--tw-mt-sm)]",
    md: "md:mt-[var(--tw-mt-md)]",
    lg: "lg:mt-[var(--tw-mt-lg)]",
    xl: "xl:mt-[var(--tw-mt-xl)]",
  },
  mr: {
    base: "mr-[var(--tw-mr)]",
    sm: "sm:mr-[var(--tw-mr-sm)]",
    md: "md:mr-[var(--tw-mr-md)]",
    lg: "lg:mr-[var(--tw-mr-lg)]",
    xl: "xl:mr-[var(--tw-mr-xl)]",
  },
  mb: {
    base: "mb-[var(--tw-mb)]",
    sm: "sm:mb-[var(--tw-mb-sm)]",
    md: "md:mb-[var(--tw-mb-md)]",
    lg: "lg:mb-[var(--tw-mb-lg)]",
    xl: "xl:mb-[var(--tw-mb-xl)]",
  },
  ml: {
    base: "ml-[var(--tw-ml)]",
    sm: "sm:ml-[var(--tw-ml-sm)]",
    md: "md:ml-[var(--tw-ml-md)]",
    lg: "lg:ml-[var(--tw-ml-lg)]",
    xl: "xl:ml-[var(--tw-ml-xl)]",
  },
  gap: {
    base: "gap-[var(--tw-gap)]",
    sm: "sm:gap-[var(--tw-gap-sm)]",
    md: "md:gap-[var(--tw-gap-md)]",
    lg: "lg:gap-[var(--tw-gap-lg)]",
    xl: "xl:gap-[var(--tw-gap-xl)]",
  },
  "gap-x": {
    base: "gap-x-[var(--tw-gap-x)]",
    sm: "sm:gap-x-[var(--tw-gap-x-sm)]",
    md: "md:gap-x-[var(--tw-gap-x-md)]",
    lg: "lg:gap-x-[var(--tw-gap-x-lg)]",
    xl: "xl:gap-x-[var(--tw-gap-x-xl)]",
  },
  "gap-y": {
    base: "gap-y-[var(--tw-gap-y)]",
    sm: "sm:gap-y-[var(--tw-gap-y-sm)]",
    md: "md:gap-y-[var(--tw-gap-y-md)]",
    lg: "lg:gap-y-[var(--tw-gap-y-lg)]",
    xl: "xl:gap-y-[var(--tw-gap-y-xl)]",
  },
} as const;

const SPACING_TOKEN_CLASSES: Record<SpacingKind, Record<SpacingToken, ClassNameVariants>> = {
  p: {
    none: {
      base: "p-0",
      sm: "sm:p-0",
      md: "md:p-0",
      lg: "lg:p-0",
      xl: "xl:p-0",
    },
    xs: {
      base: "p-2",
      sm: "sm:p-2",
      md: "md:p-2",
      lg: "lg:p-2",
      xl: "xl:p-2",
    },
    sm: {
      base: "p-3",
      sm: "sm:p-3",
      md: "md:p-3",
      lg: "lg:p-3",
      xl: "xl:p-3",
    },
    md: {
      base: "p-4",
      sm: "sm:p-4",
      md: "md:p-4",
      lg: "lg:p-4",
      xl: "xl:p-4",
    },
    lg: {
      base: "p-6",
      sm: "sm:p-6",
      md: "md:p-6",
      lg: "lg:p-6",
      xl: "xl:p-6",
    },
    xl: {
      base: "p-8",
      sm: "sm:p-8",
      md: "md:p-8",
      lg: "lg:p-8",
      xl: "xl:p-8",
    },
  },
  px: {
    none: {
      base: "px-0",
      sm: "sm:px-0",
      md: "md:px-0",
      lg: "lg:px-0",
      xl: "xl:px-0",
    },
    xs: {
      base: "px-2",
      sm: "sm:px-2",
      md: "md:px-2",
      lg: "lg:px-2",
      xl: "xl:px-2",
    },
    sm: {
      base: "px-3",
      sm: "sm:px-3",
      md: "md:px-3",
      lg: "lg:px-3",
      xl: "xl:px-3",
    },
    md: {
      base: "px-4",
      sm: "sm:px-4",
      md: "md:px-4",
      lg: "lg:px-4",
      xl: "xl:px-4",
    },
    lg: {
      base: "px-6",
      sm: "sm:px-6",
      md: "md:px-6",
      lg: "lg:px-6",
      xl: "xl:px-6",
    },
    xl: {
      base: "px-8",
      sm: "sm:px-8",
      md: "md:px-8",
      lg: "lg:px-8",
      xl: "xl:px-8",
    },
  },
  py: {
    none: {
      base: "py-0",
      sm: "sm:py-0",
      md: "md:py-0",
      lg: "lg:py-0",
      xl: "xl:py-0",
    },
    xs: {
      base: "py-2",
      sm: "sm:py-2",
      md: "md:py-2",
      lg: "lg:py-2",
      xl: "xl:py-2",
    },
    sm: {
      base: "py-3",
      sm: "sm:py-3",
      md: "md:py-3",
      lg: "lg:py-3",
      xl: "xl:py-3",
    },
    md: {
      base: "py-4",
      sm: "sm:py-4",
      md: "md:py-4",
      lg: "lg:py-4",
      xl: "xl:py-4",
    },
    lg: {
      base: "py-6",
      sm: "sm:py-6",
      md: "md:py-6",
      lg: "lg:py-6",
      xl: "xl:py-6",
    },
    xl: {
      base: "py-8",
      sm: "sm:py-8",
      md: "md:py-8",
      lg: "lg:py-8",
      xl: "xl:py-8",
    },
  },
  pt: {
    none: {
      base: "pt-0",
      sm: "sm:pt-0",
      md: "md:pt-0",
      lg: "lg:pt-0",
      xl: "xl:pt-0",
    },
    xs: {
      base: "pt-2",
      sm: "sm:pt-2",
      md: "md:pt-2",
      lg: "lg:pt-2",
      xl: "xl:pt-2",
    },
    sm: {
      base: "pt-3",
      sm: "sm:pt-3",
      md: "md:pt-3",
      lg: "lg:pt-3",
      xl: "xl:pt-3",
    },
    md: {
      base: "pt-4",
      sm: "sm:pt-4",
      md: "md:pt-4",
      lg: "lg:pt-4",
      xl: "xl:pt-4",
    },
    lg: {
      base: "pt-6",
      sm: "sm:pt-6",
      md: "md:pt-6",
      lg: "lg:pt-6",
      xl: "xl:pt-6",
    },
    xl: {
      base: "pt-8",
      sm: "sm:pt-8",
      md: "md:pt-8",
      lg: "lg:pt-8",
      xl: "xl:pt-8",
    },
  },
  pr: {
    none: {
      base: "pr-0",
      sm: "sm:pr-0",
      md: "md:pr-0",
      lg: "lg:pr-0",
      xl: "xl:pr-0",
    },
    xs: {
      base: "pr-2",
      sm: "sm:pr-2",
      md: "md:pr-2",
      lg: "lg:pr-2",
      xl: "xl:pr-2",
    },
    sm: {
      base: "pr-3",
      sm: "sm:pr-3",
      md: "md:pr-3",
      lg: "lg:pr-3",
      xl: "xl:pr-3",
    },
    md: {
      base: "pr-4",
      sm: "sm:pr-4",
      md: "md:pr-4",
      lg: "lg:pr-4",
      xl: "xl:pr-4",
    },
    lg: {
      base: "pr-6",
      sm: "sm:pr-6",
      md: "md:pr-6",
      lg: "lg:pr-6",
      xl: "xl:pr-6",
    },
    xl: {
      base: "pr-8",
      sm: "sm:pr-8",
      md: "md:pr-8",
      lg: "lg:pr-8",
      xl: "xl:pr-8",
    },
  },
  pb: {
    none: {
      base: "pb-0",
      sm: "sm:pb-0",
      md: "md:pb-0",
      lg: "lg:pb-0",
      xl: "xl:pb-0",
    },
    xs: {
      base: "pb-2",
      sm: "sm:pb-2",
      md: "md:pb-2",
      lg: "lg:pb-2",
      xl: "xl:pb-2",
    },
    sm: {
      base: "pb-3",
      sm: "sm:pb-3",
      md: "md:pb-3",
      lg: "lg:pb-3",
      xl: "xl:pb-3",
    },
    md: {
      base: "pb-4",
      sm: "sm:pb-4",
      md: "md:pb-4",
      lg: "lg:pb-4",
      xl: "xl:pb-4",
    },
    lg: {
      base: "pb-6",
      sm: "sm:pb-6",
      md: "md:pb-6",
      lg: "lg:pb-6",
      xl: "xl:pb-6",
    },
    xl: {
      base: "pb-8",
      sm: "sm:pb-8",
      md: "md:pb-8",
      lg: "lg:pb-8",
      xl: "xl:pb-8",
    },
  },
  pl: {
    none: {
      base: "pl-0",
      sm: "sm:pl-0",
      md: "md:pl-0",
      lg: "lg:pl-0",
      xl: "xl:pl-0",
    },
    xs: {
      base: "pl-2",
      sm: "sm:pl-2",
      md: "md:pl-2",
      lg: "lg:pl-2",
      xl: "xl:pl-2",
    },
    sm: {
      base: "pl-3",
      sm: "sm:pl-3",
      md: "md:pl-3",
      lg: "lg:pl-3",
      xl: "xl:pl-3",
    },
    md: {
      base: "pl-4",
      sm: "sm:pl-4",
      md: "md:pl-4",
      lg: "lg:pl-4",
      xl: "xl:pl-4",
    },
    lg: {
      base: "pl-6",
      sm: "sm:pl-6",
      md: "md:pl-6",
      lg: "lg:pl-6",
      xl: "xl:pl-6",
    },
    xl: {
      base: "pl-8",
      sm: "sm:pl-8",
      md: "md:pl-8",
      lg: "lg:pl-8",
      xl: "xl:pl-8",
    },
  },
  m: {
    none: {
      base: "m-0",
      sm: "sm:m-0",
      md: "md:m-0",
      lg: "lg:m-0",
      xl: "xl:m-0",
    },
    xs: {
      base: "m-2",
      sm: "sm:m-2",
      md: "md:m-2",
      lg: "lg:m-2",
      xl: "xl:m-2",
    },
    sm: {
      base: "m-3",
      sm: "sm:m-3",
      md: "md:m-3",
      lg: "lg:m-3",
      xl: "xl:m-3",
    },
    md: {
      base: "m-4",
      sm: "sm:m-4",
      md: "md:m-4",
      lg: "lg:m-4",
      xl: "xl:m-4",
    },
    lg: {
      base: "m-6",
      sm: "sm:m-6",
      md: "md:m-6",
      lg: "lg:m-6",
      xl: "xl:m-6",
    },
    xl: {
      base: "m-8",
      sm: "sm:m-8",
      md: "md:m-8",
      lg: "lg:m-8",
      xl: "xl:m-8",
    },
  },
  mx: {
    none: {
      base: "mx-0",
      sm: "sm:mx-0",
      md: "md:mx-0",
      lg: "lg:mx-0",
      xl: "xl:mx-0",
    },
    xs: {
      base: "mx-2",
      sm: "sm:mx-2",
      md: "md:mx-2",
      lg: "lg:mx-2",
      xl: "xl:mx-2",
    },
    sm: {
      base: "mx-3",
      sm: "sm:mx-3",
      md: "md:mx-3",
      lg: "lg:mx-3",
      xl: "xl:mx-3",
    },
    md: {
      base: "mx-4",
      sm: "sm:mx-4",
      md: "md:mx-4",
      lg: "lg:mx-4",
      xl: "xl:mx-4",
    },
    lg: {
      base: "mx-6",
      sm: "sm:mx-6",
      md: "md:mx-6",
      lg: "lg:mx-6",
      xl: "xl:mx-6",
    },
    xl: {
      base: "mx-8",
      sm: "sm:mx-8",
      md: "md:mx-8",
      lg: "lg:mx-8",
      xl: "xl:mx-8",
    },
  },
  my: {
    none: {
      base: "my-0",
      sm: "sm:my-0",
      md: "md:my-0",
      lg: "lg:my-0",
      xl: "xl:my-0",
    },
    xs: {
      base: "my-2",
      sm: "sm:my-2",
      md: "md:my-2",
      lg: "lg:my-2",
      xl: "xl:my-2",
    },
    sm: {
      base: "my-3",
      sm: "sm:my-3",
      md: "md:my-3",
      lg: "lg:my-3",
      xl: "xl:my-3",
    },
    md: {
      base: "my-4",
      sm: "sm:my-4",
      md: "md:my-4",
      lg: "lg:my-4",
      xl: "xl:my-4",
    },
    lg: {
      base: "my-6",
      sm: "sm:my-6",
      md: "md:my-6",
      lg: "lg:my-6",
      xl: "xl:my-6",
    },
    xl: {
      base: "my-8",
      sm: "sm:my-8",
      md: "md:my-8",
      lg: "lg:my-8",
      xl: "xl:my-8",
    },
  },
  mt: {
    none: {
      base: "mt-0",
      sm: "sm:mt-0",
      md: "md:mt-0",
      lg: "lg:mt-0",
      xl: "xl:mt-0",
    },
    xs: {
      base: "mt-2",
      sm: "sm:mt-2",
      md: "md:mt-2",
      lg: "lg:mt-2",
      xl: "xl:mt-2",
    },
    sm: {
      base: "mt-3",
      sm: "sm:mt-3",
      md: "md:mt-3",
      lg: "lg:mt-3",
      xl: "xl:mt-3",
    },
    md: {
      base: "mt-4",
      sm: "sm:mt-4",
      md: "md:mt-4",
      lg: "lg:mt-4",
      xl: "xl:mt-4",
    },
    lg: {
      base: "mt-6",
      sm: "sm:mt-6",
      md: "md:mt-6",
      lg: "lg:mt-6",
      xl: "xl:mt-6",
    },
    xl: {
      base: "mt-8",
      sm: "sm:mt-8",
      md: "md:mt-8",
      lg: "lg:mt-8",
      xl: "xl:mt-8",
    },
  },
  mr: {
    none: {
      base: "mr-0",
      sm: "sm:mr-0",
      md: "md:mr-0",
      lg: "lg:mr-0",
      xl: "xl:mr-0",
    },
    xs: {
      base: "mr-2",
      sm: "sm:mr-2",
      md: "md:mr-2",
      lg: "lg:mr-2",
      xl: "xl:mr-2",
    },
    sm: {
      base: "mr-3",
      sm: "sm:mr-3",
      md: "md:mr-3",
      lg: "lg:mr-3",
      xl: "xl:mr-3",
    },
    md: {
      base: "mr-4",
      sm: "sm:mr-4",
      md: "md:mr-4",
      lg: "lg:mr-4",
      xl: "xl:mr-4",
    },
    lg: {
      base: "mr-6",
      sm: "sm:mr-6",
      md: "md:mr-6",
      lg: "lg:mr-6",
      xl: "xl:mr-6",
    },
    xl: {
      base: "mr-8",
      sm: "sm:mr-8",
      md: "md:mr-8",
      lg: "lg:mr-8",
      xl: "xl:mr-8",
    },
  },
  mb: {
    none: {
      base: "mb-0",
      sm: "sm:mb-0",
      md: "md:mb-0",
      lg: "lg:mb-0",
      xl: "xl:mb-0",
    },
    xs: {
      base: "mb-2",
      sm: "sm:mb-2",
      md: "md:mb-2",
      lg: "lg:mb-2",
      xl: "xl:mb-2",
    },
    sm: {
      base: "mb-3",
      sm: "sm:mb-3",
      md: "md:mb-3",
      lg: "lg:mb-3",
      xl: "xl:mb-3",
    },
    md: {
      base: "mb-4",
      sm: "sm:mb-4",
      md: "md:mb-4",
      lg: "lg:mb-4",
      xl: "xl:mb-4",
    },
    lg: {
      base: "mb-6",
      sm: "sm:mb-6",
      md: "md:mb-6",
      lg: "lg:mb-6",
      xl: "xl:mb-6",
    },
    xl: {
      base: "mb-8",
      sm: "sm:mb-8",
      md: "md:mb-8",
      lg: "lg:mb-8",
      xl: "xl:mb-8",
    },
  },
  ml: {
    none: {
      base: "ml-0",
      sm: "sm:ml-0",
      md: "md:ml-0",
      lg: "lg:ml-0",
      xl: "xl:ml-0",
    },
    xs: {
      base: "ml-2",
      sm: "sm:ml-2",
      md: "md:ml-2",
      lg: "lg:ml-2",
      xl: "xl:ml-2",
    },
    sm: {
      base: "ml-3",
      sm: "sm:ml-3",
      md: "md:ml-3",
      lg: "lg:ml-3",
      xl: "xl:ml-3",
    },
    md: {
      base: "ml-4",
      sm: "sm:ml-4",
      md: "md:ml-4",
      lg: "lg:ml-4",
      xl: "xl:ml-4",
    },
    lg: {
      base: "ml-6",
      sm: "sm:ml-6",
      md: "md:ml-6",
      lg: "lg:ml-6",
      xl: "xl:ml-6",
    },
    xl: {
      base: "ml-8",
      sm: "sm:ml-8",
      md: "md:ml-8",
      lg: "lg:ml-8",
      xl: "xl:ml-8",
    },
  },
  gap: {
    none: {
      base: "gap-0",
      sm: "sm:gap-0",
      md: "md:gap-0",
      lg: "lg:gap-0",
      xl: "xl:gap-0",
    },
    xs: {
      base: "gap-2",
      sm: "sm:gap-2",
      md: "md:gap-2",
      lg: "lg:gap-2",
      xl: "xl:gap-2",
    },
    sm: {
      base: "gap-3",
      sm: "sm:gap-3",
      md: "md:gap-3",
      lg: "lg:gap-3",
      xl: "xl:gap-3",
    },
    md: {
      base: "gap-4",
      sm: "sm:gap-4",
      md: "md:gap-4",
      lg: "lg:gap-4",
      xl: "xl:gap-4",
    },
    lg: {
      base: "gap-6",
      sm: "sm:gap-6",
      md: "md:gap-6",
      lg: "lg:gap-6",
      xl: "xl:gap-6",
    },
    xl: {
      base: "gap-8",
      sm: "sm:gap-8",
      md: "md:gap-8",
      lg: "lg:gap-8",
      xl: "xl:gap-8",
    },
  },
  "gap-x": {
    none: {
      base: "gap-x-0",
      sm: "sm:gap-x-0",
      md: "md:gap-x-0",
      lg: "lg:gap-x-0",
      xl: "xl:gap-x-0",
    },
    xs: {
      base: "gap-x-2",
      sm: "sm:gap-x-2",
      md: "md:gap-x-2",
      lg: "lg:gap-x-2",
      xl: "xl:gap-x-2",
    },
    sm: {
      base: "gap-x-3",
      sm: "sm:gap-x-3",
      md: "md:gap-x-3",
      lg: "lg:gap-x-3",
      xl: "xl:gap-x-3",
    },
    md: {
      base: "gap-x-4",
      sm: "sm:gap-x-4",
      md: "md:gap-x-4",
      lg: "lg:gap-x-4",
      xl: "xl:gap-x-4",
    },
    lg: {
      base: "gap-x-6",
      sm: "sm:gap-x-6",
      md: "md:gap-x-6",
      lg: "lg:gap-x-6",
      xl: "xl:gap-x-6",
    },
    xl: {
      base: "gap-x-8",
      sm: "sm:gap-x-8",
      md: "md:gap-x-8",
      lg: "lg:gap-x-8",
      xl: "xl:gap-x-8",
    },
  },
  "gap-y": {
    none: {
      base: "gap-y-0",
      sm: "sm:gap-y-0",
      md: "md:gap-y-0",
      lg: "lg:gap-y-0",
      xl: "xl:gap-y-0",
    },
    xs: {
      base: "gap-y-2",
      sm: "sm:gap-y-2",
      md: "md:gap-y-2",
      lg: "lg:gap-y-2",
      xl: "xl:gap-y-2",
    },
    sm: {
      base: "gap-y-3",
      sm: "sm:gap-y-3",
      md: "md:gap-y-3",
      lg: "lg:gap-y-3",
      xl: "xl:gap-y-3",
    },
    md: {
      base: "gap-y-4",
      sm: "sm:gap-y-4",
      md: "md:gap-y-4",
      lg: "lg:gap-y-4",
      xl: "xl:gap-y-4",
    },
    lg: {
      base: "gap-y-6",
      sm: "sm:gap-y-6",
      md: "md:gap-y-6",
      lg: "lg:gap-y-6",
      xl: "xl:gap-y-6",
    },
    xl: {
      base: "gap-y-8",
      sm: "sm:gap-y-8",
      md: "md:gap-y-8",
      lg: "lg:gap-y-8",
      xl: "xl:gap-y-8",
    },
  },
} as const;

export type SpacingProps = {
  p?: ResponsiveProp<SpacingValue>;
  px?: ResponsiveProp<SpacingValue>;
  py?: ResponsiveProp<SpacingValue>;
  pt?: ResponsiveProp<SpacingValue>;
  pr?: ResponsiveProp<SpacingValue>;
  pb?: ResponsiveProp<SpacingValue>;
  pl?: ResponsiveProp<SpacingValue>;

  m?: ResponsiveProp<SpacingValue>;
  mx?: ResponsiveProp<SpacingValue>;
  my?: ResponsiveProp<SpacingValue>;
  mt?: ResponsiveProp<SpacingValue>;
  mr?: ResponsiveProp<SpacingValue>;
  mb?: ResponsiveProp<SpacingValue>;
  ml?: ResponsiveProp<SpacingValue>;

  gap?: ResponsiveProp<SpacingValue>;
  columnGap?: ResponsiveProp<SpacingValue>;
  rowGap?: ResponsiveProp<SpacingValue>;
};

const SPACING_PROP_TO_KIND: Record<keyof SpacingProps, SpacingKind> = {
  p: "p",
  px: "px",
  py: "py",
  pt: "pt",
  pr: "pr",
  pb: "pb",
  pl: "pl",
  m: "m",
  mx: "mx",
  my: "my",
  mt: "mt",
  mr: "mr",
  mb: "mb",
  ml: "ml",
  gap: "gap",
  columnGap: "gap-x",
  rowGap: "gap-y",
};

const SPACING_PROP_ORDER: Array<keyof SpacingProps> = [
  "p",
  "px",
  "py",
  "pt",
  "pr",
  "pb",
  "pl",
  "m",
  "mx",
  "my",
  "mt",
  "mr",
  "mb",
  "ml",
  "gap",
  "columnGap",
  "rowGap",
];

function spacing_var_name(kind: SpacingKind, bp: Breakpoint): string {
  return `--tw-${kind}${bp === "base" ? "" : `-${bp}`}`;
}

function normalize_spacing_value(value: number | string): string {
  if (typeof value === "number") {
    return value === 0 ? "0px" : `${value}px`;
  }
  return value;
}

type StyleVars = Record<string, string | number | undefined>;
type StyleAccumulator = { classes: string[]; style: StyleVars };

function apply_spacing(
  kind: SpacingKind,
  value: ResponsiveProp<SpacingValue> | undefined,
  acc: StyleAccumulator,
): void {
  if (value === undefined) return;

  for (const [bp, v] of to_entries(value)) {
    if (is_spacing_token(v)) {
      acc.classes.push(SPACING_TOKEN_CLASSES[kind][v][bp]);
    } else {
      acc.classes.push(SPACING_VAR_CLASSES[kind][bp]);
      acc.style[spacing_var_name(kind, bp)] = normalize_spacing_value(v);
    }
  }
}

function collect_spacing(props: SpacingProps, acc: StyleAccumulator): void {
  for (const key of SPACING_PROP_ORDER) {
    apply_spacing(SPACING_PROP_TO_KIND[key], props[key], acc);
  }
}

export type DisplayValue =
  | "block"
  | "inline"
  | "inline-block"
  | "flex"
  | "inline-flex"
  | "grid"
  | "inline-grid"
  | "contents"
  | "none";

export type PositionValue = "static" | "relative" | "absolute" | "fixed" | "sticky";
export type TextAlignValue = "left" | "center" | "right" | "justify";
export type RadiusToken = "none" | "sm" | "md" | "lg" | "xl" | "full";
export type ShadowToken = "none" | "sm" | "md" | "lg" | "xl";

const DISPLAY_CLASSES: Record<DisplayValue, ClassNameVariants> = {
  block: {
    base: "block",
    sm: "sm:block",
    md: "md:block",
    lg: "lg:block",
    xl: "xl:block",
  },
  inline: {
    base: "inline",
    sm: "sm:inline",
    md: "md:inline",
    lg: "lg:inline",
    xl: "xl:inline",
  },
  "inline-block": {
    base: "inline-block",
    sm: "sm:inline-block",
    md: "md:inline-block",
    lg: "lg:inline-block",
    xl: "xl:inline-block",
  },
  flex: {
    base: "flex",
    sm: "sm:flex",
    md: "md:flex",
    lg: "lg:flex",
    xl: "xl:flex",
  },
  "inline-flex": {
    base: "inline-flex",
    sm: "sm:inline-flex",
    md: "md:inline-flex",
    lg: "lg:inline-flex",
    xl: "xl:inline-flex",
  },
  grid: {
    base: "grid",
    sm: "sm:grid",
    md: "md:grid",
    lg: "lg:grid",
    xl: "xl:grid",
  },
  "inline-grid": {
    base: "inline-grid",
    sm: "sm:inline-grid",
    md: "md:inline-grid",
    lg: "lg:inline-grid",
    xl: "xl:inline-grid",
  },
  contents: {
    base: "contents",
    sm: "sm:contents",
    md: "md:contents",
    lg: "lg:contents",
    xl: "xl:contents",
  },
  none: {
    base: "hidden",
    sm: "sm:hidden",
    md: "md:hidden",
    lg: "lg:hidden",
    xl: "xl:hidden",
  },
};

const POSITION_CLASSES: Record<PositionValue, ClassNameVariants> = {
  static: {
    base: "static",
    sm: "sm:static",
    md: "md:static",
    lg: "lg:static",
    xl: "xl:static",
  },
  relative: {
    base: "relative",
    sm: "sm:relative",
    md: "md:relative",
    lg: "lg:relative",
    xl: "xl:relative",
  },
  absolute: {
    base: "absolute",
    sm: "sm:absolute",
    md: "md:absolute",
    lg: "lg:absolute",
    xl: "xl:absolute",
  },
  fixed: {
    base: "fixed",
    sm: "sm:fixed",
    md: "md:fixed",
    lg: "lg:fixed",
    xl: "xl:fixed",
  },
  sticky: {
    base: "sticky",
    sm: "sm:sticky",
    md: "md:sticky",
    lg: "lg:sticky",
    xl: "xl:sticky",
  },
};

const TEXT_ALIGN_CLASSES: Record<TextAlignValue, ClassNameVariants> = {
  left: {
    base: "text-left",
    sm: "sm:text-left",
    md: "md:text-left",
    lg: "lg:text-left",
    xl: "xl:text-left",
  },
  center: {
    base: "text-center",
    sm: "sm:text-center",
    md: "md:text-center",
    lg: "lg:text-center",
    xl: "xl:text-center",
  },
  right: {
    base: "text-right",
    sm: "sm:text-right",
    md: "md:text-right",
    lg: "lg:text-right",
    xl: "xl:text-right",
  },
  justify: {
    base: "text-justify",
    sm: "sm:text-justify",
    md: "md:text-justify",
    lg: "lg:text-justify",
    xl: "xl:text-justify",
  },
};

const RADIUS_CLASSES: Record<RadiusToken, ClassNameVariants> = {
  none: {
    base: "rounded-none",
    sm: "sm:rounded-none",
    md: "md:rounded-none",
    lg: "lg:rounded-none",
    xl: "xl:rounded-none",
  },
  sm: {
    base: "rounded-sm",
    sm: "sm:rounded-sm",
    md: "md:rounded-sm",
    lg: "lg:rounded-sm",
    xl: "xl:rounded-sm",
  },
  md: {
    base: "rounded-md",
    sm: "sm:rounded-md",
    md: "md:rounded-md",
    lg: "lg:rounded-md",
    xl: "xl:rounded-md",
  },
  lg: {
    base: "rounded-lg",
    sm: "sm:rounded-lg",
    md: "md:rounded-lg",
    lg: "lg:rounded-lg",
    xl: "xl:rounded-lg",
  },
  xl: {
    base: "rounded-xl",
    sm: "sm:rounded-xl",
    md: "md:rounded-xl",
    lg: "lg:rounded-xl",
    xl: "xl:rounded-xl",
  },
  full: {
    base: "rounded-full",
    sm: "sm:rounded-full",
    md: "md:rounded-full",
    lg: "lg:rounded-full",
    xl: "xl:rounded-full",
  },
};

const SHADOW_CLASSES: Record<ShadowToken, ClassNameVariants> = {
  none: {
    base: "shadow-none",
    sm: "sm:shadow-none",
    md: "md:shadow-none",
    lg: "lg:shadow-none",
    xl: "xl:shadow-none",
  },
  sm: {
    base: "shadow-sm",
    sm: "sm:shadow-sm",
    md: "md:shadow-sm",
    lg: "lg:shadow-sm",
    xl: "xl:shadow-sm",
  },
  md: {
    base: "shadow",
    sm: "sm:shadow",
    md: "md:shadow",
    lg: "lg:shadow",
    xl: "xl:shadow",
  },
  lg: {
    base: "shadow-lg",
    sm: "sm:shadow-lg",
    md: "md:shadow-lg",
    lg: "lg:shadow-lg",
    xl: "xl:shadow-lg",
  },
  xl: {
    base: "shadow-xl",
    sm: "sm:shadow-xl",
    md: "md:shadow-xl",
    lg: "lg:shadow-xl",
    xl: "xl:shadow-xl",
  },
};

export function responsive_class_list<T extends string>(
  value: ResponsiveProp<T> | undefined,
  map: Record<T, ClassNameVariants>,
): string[] {
  if (value === undefined) return [];
  const list: string[] = [];
  for (const [bp, v] of to_entries(value)) {
    const cls = map[v]?.[bp];
    if (cls) list.push(cls);
  }
  return list;
}

function apply_enum_classes<T extends string>(
  value: ResponsiveProp<T> | undefined,
  map: Record<T, ClassNameVariants>,
  acc: StyleAccumulator,
): void {
  const list = responsive_class_list(value, map);
  if (list.length) acc.classes.push(...list);
}

export type StyleProps = SpacingProps & {
  display?: ResponsiveProp<DisplayValue>;
  pos?: ResponsiveProp<PositionValue>;
  ta?: ResponsiveProp<TextAlignValue>;
  radius?: ResponsiveProp<RadiusToken>;
  shadow?: ResponsiveProp<ShadowToken>;
};

export type StyleResolution = { classNames: string[]; style: React.CSSProperties };

export function resolve_style_props(props: StyleProps): StyleResolution {
  const acc: StyleAccumulator = { classes: [], style: {} };

  collect_spacing(props, acc);
  apply_enum_classes(props.display, DISPLAY_CLASSES, acc);
  apply_enum_classes(props.pos, POSITION_CLASSES, acc);
  apply_enum_classes(props.ta, TEXT_ALIGN_CLASSES, acc);
  apply_enum_classes(props.radius, RADIUS_CLASSES, acc);
  apply_enum_classes(props.shadow, SHADOW_CLASSES, acc);

  return { classNames: acc.classes, style: acc.style as React.CSSProperties };
}

export function merge_styles(
  generated: React.CSSProperties | StyleVars,
  userStyle?: React.CSSProperties,
): React.CSSProperties {
  return userStyle ? { ...generated, ...userStyle } : (generated as React.CSSProperties);
}
