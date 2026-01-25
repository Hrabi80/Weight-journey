# Container

Payload-inspired layout wrapper that layers tokenized gutters on top of the `Box` primitive.

- Accepts every `Box` prop except padding props (`p`, `px`, `py`, `pt`, `pr`, `pb`, `pl`).
- Spacing tokens:
  - Y: `none` | `tiny` | `small` | `medium` | `large` | `hero`
  - X: `none` | `tiny` | `small` | `medium` | `large` | `extraLarge`
- Shorthands: `axisY`/`axisX` set both sides; `top`/`bottom` or `left`/`right` override.
- Auto margins: centers with `mx-auto` and adds proportional vertical margin (one step smaller than padding). Disable with `disableMargin`.

```tsx
import { Container } from "../container/Container";

export function Example() {
  return (
    <Container axisX={{ base: "medium", lg: "large" }} axisY="large">
      <h1 className="text-3xl font-semibold">Hero headline</h1>
    </Container>
  );
}

export function TightGutter() {
  return (
    <Container axisX="small" top="tiny" bottom="medium" disableMargin>
      <p>Compact section without auto margins.</p>
    </Container>
  );
}
```
