import { Activity } from "lucide-react";

import PageClient from "./page_client";
import { Container, Flex, Stack, Text, Title } from "@/components/layout";

export default function QuestionnairePage() {
  return (
    <Container axisX="extraLarge" axisY="hero" className="bg-gradient-hero">
      <Stack align="center" justify="center" px="md" py="xl">
        <Flex align="center" justify="center" gap="xs" className="mb-6">
          <Activity className="h-8 w-8 text-primary" />
          <Title order={1} size="h3" fw="bold" className="font-serif text-foreground">
            WeightWise
          </Title>
        </Flex>

        <Text className="text-center text-muted-foreground mb-6">
          Answer a few quick questions so we can tailor your dashboard.
        </Text>

        <PageClient />
        
      </Stack>
    </Container>
  );
}
