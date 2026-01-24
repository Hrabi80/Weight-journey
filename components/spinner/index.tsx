"use client";

import { Loader2 } from "lucide-react";

import { Box, Flex, Text } from "@/components/layout";

interface SpinnerProps {
  label?: string;
  fullScreen?: boolean;
}

export function Spinner({ label = "Loading…", fullScreen = false }: SpinnerProps) {
  return (
    <Flex
      align="center"
      justify="center"
      gap="sm"
      className={fullScreen ? "min-h-screen bg-background" : ""}
      py={fullScreen ? "xl" : "sm"}
    >
      <Box className="inline-flex p-3 rounded-full bg-card border border-border/50 shadow-soft">
        <Loader2 className="h-5 w-5 text-primary animate-spin" />
      </Box>
      {label && <Text className="text-muted-foreground">{label}</Text>}
    </Flex>
  );
}
