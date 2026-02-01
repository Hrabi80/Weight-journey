import { Card, CardContent } from "@/components/ui/card";
interface DemoBannerProps {
  demoMode: boolean;
}
export function DemoModeAlert  ({ demoMode }: DemoBannerProps){
  if (!demoMode) return null;
  return (
    <Card className="mb-6 border-primary/30 bg-primary/5">
      <CardContent className="py-3 text-sm text-muted-foreground">
        You are viewing demo data. Start the questionnaire to create your own
        journey.
      </CardContent>
    </Card>
  );
};
