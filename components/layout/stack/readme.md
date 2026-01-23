# Stack

Vertical flex stack with responsive gap (defaults to `md`).

```tsx
import { Stack } from "../stack/Stack";

export function Example() {
  return (
    <Stack gap={{ base: "sm", md: "lg" }} align="stretch">
      <div>Item 1</div>
      <div>Item 2</div>
      <div>Item 3</div>
    </Stack>
  );
}
```
