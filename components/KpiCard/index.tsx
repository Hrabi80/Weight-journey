import { ReactNode } from "react";
import { Card, CardContent } from "../ui/card";
import { Box, Flex, Text } from "../layout";

interface KpiCardProps {
  title: string;
  value: ReactNode;
  icon: ReactNode;
  subTitle?: ReactNode;
  valueClassName?: string;
  iconContainerClassName?: string;
}

export default function KPICard({
  title,
  value,
  icon,
  subTitle,
  valueClassName,
  iconContainerClassName,
}: KpiCardProps) {
  const resolvedValueClass = valueClassName ?? "text-foreground";
  const resolvedIconContainerClass = iconContainerClassName ?? "bg-primary/10";

  return (
    <Card className="border-0 shadow-md bg-card h-full">
      <CardContent className="pt-1 h-full">
        <Flex align="center" justify="space-between">
          <Box>
            <Text size="sm" className="text-muted-foreground">
              {title}
            </Text>
            <Text size="xl" fw="bold" className={resolvedValueClass}>
              {value}
            </Text>
            {subTitle}
          </Box>
          <Box p="sm" radius="full" className={resolvedIconContainerClass}>
            {icon}
          </Box>
        </Flex>
      </CardContent>
    </Card>
  );
}
