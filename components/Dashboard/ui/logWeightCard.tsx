import { Plus } from "lucide-react";

import { AdditionalTrackers } from "@/components/additional-trackers";
import { Grid, Flex, Text } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DashboardStatus } from "../use-dashboard-state";

interface LogWeightCardProps {
  newWeight: string;
  status: DashboardStatus;
  demoMode: boolean;

  on_change_weight: (value: string) => void;
  on_add_weight: () => void;

  on_log_sleep: (start: string, end: string) => void;
  on_log_calories: (value: number) => void;
  on_log_steps: (value: number) => void;
}

export function LogWeightCard(props: LogWeightCardProps) {
  const {
    newWeight,
    status,
    demoMode,
    on_change_weight,
    on_add_weight,
    on_log_sleep,
    on_log_calories,
    on_log_steps,
  } = props;

  return (
    <Grid columns={{ base: 1, md: 2 }} gutter="lg" mb={"xl"}>
      <Grid.Col>
        <Card className="border-0 shadow-md bg-card h-full">
          <CardHeader>
            <CardTitle className="text-lg font-serif text-foreground">Log today&apos;s weight</CardTitle>
            <CardDescription>Keep daily momentum</CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction={{ base: "column", sm: "row" }} gap="sm" align={{ sm: "center" }}>
              <Input
                type="number"
                placeholder="Enter weight in kg"
                value={newWeight}
                onChange={(e) => on_change_weight(e.target.value)}
                min={20}
                max={500}
                step="0.1"
                className="flex-1"
              />
              <Button onClick={on_add_weight} className="sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Log weight
              </Button>
            </Flex>

            {status && (
              <Text
                size="sm"
                className={`mt-2 ${status.type === "error" ? "text-destructive" : "text-muted-foreground"}`}
              >
                {status.text}
              </Text>
            )}

            {demoMode && (
              <Text size="xs" className="mt-2 text-muted-foreground">
                Demo mode resets when you leave this page. Sign up to keep your progress.
              </Text>
            )}
          </CardContent>
        </Card>
      </Grid.Col>

      <Grid.Col>
        <AdditionalTrackers
          onLogSleep={on_log_sleep}
          onLogCalories={on_log_calories}
          onLogSteps={on_log_steps}
          disabled={demoMode}
        />
      </Grid.Col>
    </Grid>
  );
}
