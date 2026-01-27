import Link from "next/link";
import { Activity } from "lucide-react";

import { Box, Flex, Text, Title } from "../layout";
import { Button } from "../ui/button";
import { MobileNav } from "./mobileNav";

type NavLink = {
  href: string;
  label: string;
  variant: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
};

const navLinks: NavLink[] = [
  { href: "/questionnaire?mode=login", label: "Sign in", variant: "ghost" },
  { href: "/dashboard?demo=1", label: "Demo", variant: "outline" },
];

export function Header() {
  return (
    <Box
      as="header"
      className="fixed inset-x-0 top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60"
      shadow={"sm"}
    >
      <Flex
        className="container mx-auto py-3"
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
          <Flex align="center" gap="xs" className="hidden sm:flex">
            {navLinks.map(({ href, label, variant }) => (
              <Button key={href} variant={variant} >
                <Link href={href}>{label}</Link>
              </Button>
            ))}
          </Flex>

          <MobileNav navLinks={navLinks} portalId="mobile-nav-portal" />
        </Flex>
      </Flex>

      <div id="mobile-nav-portal" />
    </Box>
  );
}
