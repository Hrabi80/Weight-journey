import { Activity, ArrowRight, BarChart3, TrendingDown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Box, Container, Flex, Grid, Stack, Text, Title } from "@/components/layout";
import "./styles.css"
import Link from "next/link";
export default function Home() {


  return (
    <Container axisX={'extraLarge'} axisY={"hero"} className="bg-gradient-hero" >
        <Stack
          align="center"
          gap="xl"
          
        >
          <Box className="max-w-4xl text-center animate-fade-in-up">
            <Box className="inline-flex items-center justify-center p-4 rounded-2xl bg-card shadow-card border border-border/60 mb-6">
              <Activity className="h-10 w-10 text-primary" />
            </Box>
            <Title
              order={1}
              size={{ base: "h2", sm: "h1" }}
              fw="bold"
              className="font-serif text-4xl sm:text-5xl md:text-6xl text-foreground leading-tight"
            >
              Track your{" "}
              <span className="text-gradient-primary">wellness journey</span>{" "}
              with clarity
            </Title>
            <Text className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mt-4 leading-relaxed">
              Log your weight, monitor sleep, calories, and steps, and see beautiful
              insights that keep you motivated.
            </Text>
            <Flex
              direction={{ base: "column", sm: "row" }}
              align="center"
              justify="center"
              gap="sm"
              mt="lg"
            >
              
              <Link href={"/questionnaire"}>
              <Button
                size="lg"
                className="px-8 py-6 rounded-xl shadow-soft text-base cursor-pointer"
                
              >
                Start the questionnaire
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
                </Link>
                <Link href={"/questionnaire?mode=login"}>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 rounded-xl text-base border-2 cursor-pointer"
              >
                   
                I already have an account
              </Button>
                </Link>
                <Link href={"/dashboard?demo=1"}>
              <Button
                size="lg"
                variant="secondary"
                className="px-8 py-6 rounded-xl text-base shadow-soft cursor-pointer text-white"
              >
                
                Demo mode
              </Button>
                 </Link>
            </Flex>
          </Box>

          <Grid columns={{ base: 1, sm: 3 }} gutter="lg" className="w-full max-w-4xl">
            <Grid.Col>
              <Box className="p-6 rounded-2xl bg-card shadow-card border border-border/60 card-hover h-full">
                <Box className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                  <TrendingDown className="h-6 w-6 text-primary" />
                </Box>
                <Title order={3} size="h5" fw="semibold" className="text-foreground">
                  Track progress
                </Title>
                <Text className="text-sm text-muted-foreground mt-2">
                  Log weight daily and watch trends with BMI-colored zones.
                </Text>
              </Box>
            </Grid.Col>
            <Grid.Col>
              <Box className="p-6 rounded-2xl bg-card shadow-card border border-border/60 card-hover h-full">
                <Box className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </Box>
                <Title order={3} size="h5" fw="semibold" className="text-foreground">
                  Visual insights
                </Title>
                <Text className="text-sm text-muted-foreground mt-2">
                  Wellness charts for sleep, calories, and steps alongside weight.
                </Text>
              </Box>
            </Grid.Col>
            <Grid.Col>
              <Box className="p-6 rounded-2xl bg-card shadow-card border border-border/60 card-hover h-full">
                <Box className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </Box>
                <Title order={3} size="h5" fw="semibold" className="text-foreground">
                  Stay accountable
                </Title>
                <Text className="text-sm text-muted-foreground mt-2">
                  Export-ready data to share with your coach or nutritionist.
                </Text>
              </Box>
            </Grid.Col>
          </Grid>
        </Stack>
   </Container>
  );
}
