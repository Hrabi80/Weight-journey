# Flex

Mantine-inspired flex container with responsive props.

```tsx
import { Flex } from "../flex/Flex";

export function Example() {
  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      justify="space-between"
      align="center"
      gap="md"
      p="md"
    >
      <div>Left</div>
      <div>Right</div>
    </Flex>
  );
}
```
