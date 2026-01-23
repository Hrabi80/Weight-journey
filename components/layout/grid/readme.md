# Grid

Responsive CSS grid with Mantine-like API and `Grid.Col` helper.

```tsx
import { Grid } from "../grid/Grid";

export function Example() {
  return (
    <Grid columns={12} gutter={{ base: "sm", md: "md" }}>
      <Grid.Col span={{ base: 12, md: 6 }}>
        Left
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6 }}>
        Right
      </Grid.Col>
    </Grid>
  );
}
```
