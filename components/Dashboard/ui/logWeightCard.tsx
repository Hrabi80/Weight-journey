"use client";

import { useState } from "react";
import { Flame, Footprints, Loader2, Moon, Plus, Scale } from "lucide-react";

import { Box, Flex, Text } from "@/components/layout";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { DashboardStatus } from "../use-dashboard-state";

interface LogWeightCardProps {
  newWeight: string;
  status: DashboardStatus;
  demoMode: boolean;

  on_change_weight: (value: string) => void;
  on_add_weight: () => Promise<void> | void;

  on_log_sleep: (start: string, end: string) => Promise<void> | void;
  on_log_calories: (value: number) => Promise<void> | void;
  on_log_steps: (value: number) => Promise<void> | void;
}

type TrackerKey = "sleep" | "calories" | "steps";

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

  const [open, setOpen] = useState(false);
  const [sleepStart, setSleepStart] = useState("22:00");
  const [sleepEnd, setSleepEnd] = useState("06:00");
  const [calories, setCalories] = useState("");
  const [steps, setSteps] = useState("");
  const [localStatus, setLocalStatus] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );
  const [loading, setLoading] = useState<TrackerKey | null>(null);

  const run = async (key: TrackerKey, action: () => Promise<void> | void) => {
    try {
      setLocalStatus(null);
      setLoading(key);
      await action();
      setLocalStatus({ type: "success", text: "Saved to today's log." });
    } catch (error) {
      setLocalStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleLogWeight = async () => {
    setLocalStatus(null);
    await on_add_weight();
  };

  const handleLogSleep = () => run("sleep", () => on_log_sleep(sleepStart.trim(), sleepEnd.trim()));

  const handleLogCalories = () =>
    run("calories", () => {
      const value = Number(calories);
      if (!Number.isFinite(value) || value < 0) {
        throw new Error("Enter a valid calorie number");
      }
      on_log_calories(value);
      setCalories("");
    });

  const handleLogSteps = () =>
    run("steps", () => {
      const value = Number(steps);
      if (!Number.isFinite(value) || value < 0) {
        throw new Error("Enter a valid step count");
      }
      on_log_steps(value);
      setSteps("");
    });

  return (
    <Card className="border-0 shadow-md bg-card overflow-hidden mb-2">
      <CardContent className="p-2 sm:py-2 sm:px-4">
        <Flex
          direction={{ base: "column", md: "row" }}
          align={{ md: "center" }}
          justify={{ md: "space-between" }}
          gap="md"
        >
          <Box >
            <Text className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Daily log
            </Text>
            <Text as="h3" className="text-xl text-foreground">
              Capture today in one tap
            </Text>
            <Text size="sm" className="text-muted-foreground max-w-2xl">
              Weight, sleep, steps, and calories gathered in a single flow. Everything syncs to your
              dashboard instantly.
            </Text>
            {status && (
              <Text
                size="sm"
                className={`text-sm ${status.type === "error" ? "text-destructive" : "text-muted-foreground"}`}
              >
                {status.text}
              </Text>
            )}
          </Box>

          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger
              render={
                <Button size="lg" className="gap-2 shadow-md">
                  <Plus className="h-4 w-4" />
                  Log today
                </Button>
              }
            />

            <AlertDialogContent
              size="default"
              className="z-[60] w-[calc(100vw-1rem)] max-h-[calc(100dvh-6rem)] overflow-y-auto top-[5.5rem] -translate-y-0 sm:top-1/2 sm:w-full sm:max-h-[85dvh] sm:max-w-xl sm:-translate-y-1/2"
            >
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">
                  Log today&apos;s wellness
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Quick capture for weight, sleep, steps, and calories. Changes apply to your charts
                  right away.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="space-y-4">
                <Box className="rounded-xl border border-border/60 bg-muted/30 p-4">
                  <Flex align="center" gap="sm" className="mb-3">
                    <Box className="rounded-lg bg-primary/10 p-2">
                      <Scale className="h-5 w-5 text-primary" />
                    </Box>
                    <Box>
                      <Text className="font-semibold text-foreground">Weight</Text>
                      <Text size="xs" className="text-muted-foreground">
                        Update today&apos;s number (kg)
                      </Text>
                    </Box>
                  </Flex>
                  <Flex align="center" gap="sm" className="flex-nowrap">
                    <Input
                      type="number"
                      placeholder="Weight (kg)"
                      value={newWeight}
                      onChange={(e) => on_change_weight(e.target.value)}
                      min={20}
                      max={500}
                      step="0.1"
                      className="min-w-0 flex-1"
                    />
                    <Button onClick={handleLogWeight} className="shrink-0 px-3 sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </Flex>
                  {status && (
                    <Text
                      size="xs"
                      className={`mt-2 ${status.type === "error" ? "text-destructive" : "text-muted-foreground"}`}
                    >
                      {status.text}
                    </Text>
                  )}
                </Box>

                <Box className="rounded-xl border border-border/60 bg-muted/30 p-4">
                  <Flex align="center" gap="sm" className="mb-3">
                    <Box className="rounded-lg bg-primary/10 p-2">
                      <Moon className="h-5 w-5 text-primary" />
                    </Box>
                    <Box>
                      <Text className="font-semibold text-foreground">Sleep</Text>
                      <Text size="xs" className="text-muted-foreground">
                        Record bedtime and wake-up
                      </Text>
                    </Box>
                  </Flex>
                  <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row">
                    <Input
                      type="time"
                      value={sleepStart}
                      onChange={(e) => setSleepStart(e.target.value)}
                      disabled={loading === "sleep"}
                      className="min-w-0"
                    />
                    <Input
                      type="time"
                      value={sleepEnd}
                      onChange={(e) => setSleepEnd(e.target.value)}
                      disabled={loading === "sleep"}
                      className="min-w-0"
                    />
                    <Button
                      onClick={handleLogSleep}
                      disabled={loading === "sleep"}
                      className="col-span-2 h-9 w-full whitespace-nowrap sm:col-span-1 sm:w-auto"
                    >
                      {loading === "sleep" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log sleep"}
                    </Button>
                  </div>
                </Box>

                <Box className="rounded-xl border border-border/60 bg-muted/30 p-4">
                  <Flex align="center" gap="sm" className="mb-3">
                    <Box className="rounded-lg bg-primary/10 p-2">
                      <Footprints className="h-5 w-5 text-primary" />
                    </Box>
                    <Box>
                      <Text className="font-semibold text-foreground">Steps</Text>
                      <Text size="xs" className="text-muted-foreground">
                        Daily movement count
                      </Text>
                    </Box>
                  </Flex>
                  <Flex align="center" gap="sm" className="flex-nowrap">
                    <Input
                      type="number"
                      placeholder="Steps"
                      value={steps}
                      onChange={(e) => setSteps(e.target.value)}
                      disabled={loading === "steps"}
                      className="min-w-0 flex-1"
                    />
                    <Button
                      onClick={handleLogSteps}
                      disabled={loading === "steps"}
                      className="shrink-0 whitespace-nowrap px-3"
                    >
                      {loading === "steps" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Log steps"
                      )}
                    </Button>
                  </Flex>
                </Box>

                <Box className="rounded-xl border border-border/60 bg-muted/30 p-4">
                  <Flex align="center" gap="sm" className="mb-3">
                    <Box className="rounded-lg bg-primary/10 p-2">
                      <Flame className="h-5 w-5 text-primary" />
                    </Box>
                    <Box>
                      <Text className="font-semibold text-foreground">Calories</Text>
                      <Text size="xs" className="text-muted-foreground">
                        Daily intake snapshot
                      </Text>
                    </Box>
                  </Flex>
                  <Flex align="center" gap="sm" className="flex-nowrap">
                    <Input
                      type="number"
                      placeholder="Calories"
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      disabled={loading === "calories"}
                      className="min-w-0 flex-1"
                    />
                    <Button
                      onClick={handleLogCalories}
                      disabled={loading === "calories"}
                      className="shrink-0 whitespace-nowrap px-3"
                    >
                      {loading === "calories" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Log calories"
                      )}
                    </Button>
                  </Flex>
                </Box>

                {localStatus && (
                  <Text
                    size="sm"
                    className={`${localStatus.type === "error" ? "text-destructive" : "text-primary"} text-sm`}
                  >
                    {localStatus.text}
                  </Text>
                )}

                {demoMode && (
                  <Text size="xs" className="text-muted-foreground">
                    Note: quick trackers are disabled in demo mode.
                  </Text>
                )}
              </div>

              <Separator className="my-1" />

              <AlertDialogFooter>
                <AlertDialogCancel>Close</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Flex>
      </CardContent>
    </Card>
  );
}
