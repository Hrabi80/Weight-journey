# Text

Typography primitive with responsive size, weight, alignment, line clamp, and truncate.

```tsx
import { Text } from "../text/Text";

export function Example() {
  return (
    <Text size={{ base: "sm", md: "md" }} fw={600} lineClamp={2}>
      Responsive text with clamped lines.
    </Text>
  );
}
```
