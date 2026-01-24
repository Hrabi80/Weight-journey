"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Flame, Footprints, Moon, Loader2 } from "lucide-react";

import { Box, Flex, Grid, Text, Title } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TrackerKey = "sleep" | "calories" | "steps";

interface AdditionalTrackersProps {
  onLogSleep: (start: string, end: string) => Promise<void> | void;
  onLogCalories: (value: number) => Promise<void> | void;
  onLogSteps: (value: number) => Promise<void> | void;
  disabled?: boolean;
}

const toggleBaseStyles =
  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 border border-border";

export function AdditionalTrackers({
  onLogSleep,
  onLogCalories,
  onLogSteps,
  disabled = false,
}: AdditionalTrackersProps) {
  const [open, setOpen] = useState(true);
  const [enabled, setEnabled] = useState<Record<TrackerKey, boolean>>({
    sleep: true,
    calories: false,
    steps: false,
  });
  const [sleepStart, setSleepStart] = useState("22:00");
  const [sleepEnd, setSleepEnd] = useState("06:00");
  const [calories, setCalories] = useState("");
  const [steps, setSteps] = useState("");
  const [loading, setLoading] = useState<TrackerKey | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const toggle = (key: TrackerKey) =>
    setEnabled((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

  const run = async (key: TrackerKey, action: () => Promise<void> | void) => {
    try {
      setStatus(null);
      setLoading(key);
      await action();
      setStatus({ type: "success", text: "Saved successfully." });
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="border-border/60 shadow-md">
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Flex align="center" justify="space-between">
          <CardTitle className="font-serif text-lg text-foreground">Additional trackers</CardTitle>
          {open ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
        </Flex>
      </CardHeader>
      {open && (
        <CardContent className="space-y-5 pt-1">
          <Text size="sm" className="text-muted-foreground">
            Capture more of your wellness story: sleep windows, calories, and daily steps.
          </Text>

          <Grid columns={{ base: 1, sm: 3 }} gutter="md">
            {/* Sleep */}
            <Grid.Col>
              <Box className="p-4 rounded-xl border border-border/60 bg-secondary/20 h-full">
                <Flex align="center" justify="space-between" className="mb-3">
                  <Flex align="center" gap="sm">
                    <Box className="p-2 rounded-lg bg-primary/10">
                      <Moon className="h-5 w-5 text-primary" />
                    </Box>
                    <Box>
                      <Title order={4} size="sm" fw="semibold" className="text-foreground">
                        Sleep
                      </Title>
                      <Text size="xs" className="text-muted-foreground">
                        Track bedtime and wake-up
                      </Text>
                    </Box>
                  </Flex>
                  <button
                    type="button"
                    aria-pressed={enabled.sleep}
                    className={`${toggleBaseStyles} ${
                      enabled.sleep ? "bg-primary/70" : "bg-muted"
                    }`}
                    onClick={() => toggle("sleep")}
                    disabled={disabled}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-card shadow transition-transform duration-200 ${
                        enabled.sleep ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </Flex>

                {enabled.sleep && (
                  <Box className="space-y-3">
                    <Grid columns={2} gutter="sm">
                      <Grid.Col>
                        <Label className="text-xs">Bedtime</Label>
                        <Input
                          type="time"
                          value={sleepStart}
                          onChange={(e) => setSleepStart(e.target.value)}
                          disabled={disabled}
                        />
                      </Grid.Col>
                      <Grid.Col>
                        <Label className="text-xs">Wake up</Label>
                        <Input
                          type="time"
                          value={sleepEnd}
                          onChange={(e) => setSleepEnd(e.target.value)}
                          disabled={disabled}
                        />
                      </Grid.Col>
                    </Grid>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        run("sleep", () => onLogSleep(sleepStart.trim(), sleepEnd.trim()))
                      }
                      disabled={disabled || loading === "sleep"}
                    >
                      {loading === "sleep" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Log sleep"
                      )}
                    </Button>
                  </Box>
                )}
              </Box>
            </Grid.Col>

            {/* Calories */}
            <Grid.Col>
              <Box className="p-4 rounded-xl border border-border/60 bg-secondary/20 h-full">
                <Flex align="center" justify="space-between" className="mb-3">
                  <Flex align="center" gap="sm">
                    <Box className="p-2 rounded-lg bg-primary/10">
                      <Flame className="h-5 w-5 text-primary" />
                    </Box>
                    <Box>
                      <Title order={4} size="sm" fw="semibold" className="text-foreground">
                        Calories
                      </Title>
                      <Text size="xs" className="text-muted-foreground">
                        Daily intake snapshot
                      </Text>
                    </Box>
                  </Flex>
                  <button
                    type="button"
                    aria-pressed={enabled.calories}
                    className={`${toggleBaseStyles} ${
                      enabled.calories ? "bg-primary/70" : "bg-muted"
                    }`}
                    onClick={() => toggle("calories")}
                    disabled={disabled}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-card shadow transition-transform duration-200 ${
                        enabled.calories ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </Flex>

                {enabled.calories && (
                  <Flex align="center" gap="sm">
                    <Input
                      type="number"
                      placeholder="e.g. 2100"
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      disabled={disabled}
                    />
                    <Button
                      size="sm"
                      onClick={() =>
                        run("calories", () => {
                          const value = Number(calories);
                          if (!Number.isFinite(value) || value < 0) {
                            throw new Error("Enter a valid calorie number");
                          }
                          onLogCalories(value);
                          setCalories("");
                        })
                      }
                      disabled={disabled || loading === "calories"}
                    >
                      {loading === "calories" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Log"
                      )}
                    </Button>
                  </Flex>
                )}
              </Box>
            </Grid.Col>

            {/* Steps */}
            <Grid.Col>
              <Box className="p-4 rounded-xl border border-border/60 bg-secondary/20 h-full">
                <Flex align="center" justify="space-between" className="mb-3">
                  <Flex align="center" gap="sm">
                    <Box className="p-2 rounded-lg bg-primary/10">
                      <Footprints className="h-5 w-5 text-primary" />
                    </Box>
                    <Box>
                      <Title order={4} size="sm" fw="semibold" className="text-foreground">
                        Steps
                      </Title>
                      <Text size="xs" className="text-muted-foreground">
                        Daily movement target
                      </Text>
                    </Box>
                  </Flex>
                  <button
                    type="button"
                    aria-pressed={enabled.steps}
                    className={`${toggleBaseStyles} ${
                      enabled.steps ? "bg-primary/70" : "bg-muted"
                    }`}
                    onClick={() => toggle("steps")}
                    disabled={disabled}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-card shadow transition-transform duration-200 ${
                        enabled.steps ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </Flex>

                {enabled.steps && (
                  <Flex align="center" gap="sm">
                    <Input
                      type="number"
                      placeholder="e.g. 9000"
                      value={steps}
                      onChange={(e) => setSteps(e.target.value)}
                      disabled={disabled}
                    />
                    <Button
                      size="sm"
                      onClick={() =>
                        run("steps", () => {
                          const value = Number(steps);
                          if (!Number.isFinite(value) || value < 0) {
                            throw new Error("Enter a valid step count");
                          }
                          onLogSteps(value);
                          setSteps("");
                        })
                      }
                      disabled={disabled || loading === "steps"}
                    >
                      {loading === "steps" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Log"
                      )}
                    </Button>
                  </Flex>
                )}
              </Box>
            </Grid.Col>
          </Grid>

          {status && (
            <Text
              size="sm"
              className={`${
                status.type === "success" ? "text-primary" : "text-destructive"
              }`}
            >
              {status.text}
            </Text>
          )}
        </CardContent>
      )}
    </Card>
  );
}
