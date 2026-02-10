import { Card } from "@heroui/react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
}: FeatureCardProps) {
  return (
    <Card
      className={cn(
        "group p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        className
      )}
    >
      <Card.Header className="flex-row items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
          <Icon className="size-6" />
        </div>
        <div className="flex flex-col gap-1">
          <Card.Title className="text-lg font-semibold">{title}</Card.Title>
          <Card.Description className="text-sm text-muted-foreground">
            {description}
          </Card.Description>
        </div>
      </Card.Header>
    </Card>
  );
}
