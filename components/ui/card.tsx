import { Card as HeroCard } from "@heroui/react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export type CardVariant = "transparent" | "default" | "secondary" | "tertiary";

export interface CardProps extends ComponentProps<typeof HeroCard> {
  variant?: CardVariant;
}

export function Card({ children, variant = "default", className, ...props }: CardProps) {
  return (
    <HeroCard variant={variant} className={cn(className)} {...props}>
      {children}
    </HeroCard>
  );
}

// Compound components
Card.Header = HeroCard.Header;
Card.Title = HeroCard.Title;
Card.Description = HeroCard.Description;
Card.Content = HeroCard.Content;
Card.Footer = HeroCard.Footer;

export { HeroCard };
