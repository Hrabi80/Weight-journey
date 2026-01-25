import Link from "next/link";
import { Activity } from "lucide-react";

import { Box, Flex, Text, Title } from "../layout";
import { Button } from "../ui/button";

export function Header() {
  return (
    <Box as="header" className="w-full header-shadow position-fix">
      <Flex
        className="container mx-auto py-4"
        px="md"
        align="center"
        justify="space-between"
      >
        <Flex align="center" gap="sm">
          <Link
            href="/"
            aria-label="Go to homepage"
            className="p-3 rounded-2xl bg-primary/10 shadow-soft hover:bg-primary/15 transition"
          >
            <Activity className="h-6 w-6 text-primary" />
          </Link>

          <Box>
            <Title
              order={2}
              size="h4"
              fw="bold"
              className="font-serif text-foreground"
            >
              WeightJourney
            </Title>
            <Text size="xs" className="text-muted-foreground">
              Wellness tracking that helps your doctor
            </Text>
          </Box>
        </Flex>

        <Flex align="center" gap="xs">
          <Button variant="ghost" >
            <Link href="/questionnaire?mode=login">Sign in</Link>
          </Button>

          <Button variant="outline" >
            <Link href="/dashboard?demo=1">Demo</Link>
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}
