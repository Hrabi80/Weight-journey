# Box

A Mantine-inspired layout primitive that outputs Tailwind CSS classes.

`Box` renders a `div` by default, but can render any HTML element (or React component) using the `component` or `as` prop. It also supports a small set of “system props” (padding, margin, display, etc.) that get converted into Tailwind utility classes — including responsive values.

---

## Installation / Setup

`Box` depends on your internal helpers:

- `ResponsiveProp`, `to_entries`, `tw_prefix` from `./responsive`
- `SpacingToken`, `spacing_classes` from `./spacing`
- `cn` (className merge helper)

Make sure your Tailwind config includes the breakpoints used by `tw_prefix` (e.g. `sm`, `md`, `lg`, `xl`).

---

## Basic usage

```tsx
import { Box } from "./Box";

export function Example() {
  return (
    <Box p="md" radius="lg" shadow="sm">
      Hello
    </Box>
  );
}
