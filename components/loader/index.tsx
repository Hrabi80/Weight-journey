"use client";

import { Activity } from "lucide-react";

import { Box, Flex, Text, Title } from "@/components/layout";

export function Loader() {
  return (
    <Flex className="min-h-screen" align="center" justify="center" px="md">
      <Box className="text-center space-y-3">
        <Box className="inline-flex p-4 rounded-2xl bg-card shadow-soft border border-border/60 animate-pulse-soft">
          <Activity className="h-8 w-8 text-primary" />
        </Box>
        <Title order={3} size="h5" fw="semibold" className="text-foreground">
          Preparing your dashboard...
        </Title>
        <Text size="sm" className="text-muted-foreground">
          Loading the latest metrics and charts.
        </Text>
      </Box>
    </Flex>
  );
}
