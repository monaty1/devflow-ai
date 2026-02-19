"use client";

import { Button as HeroButton, Spinner } from "@heroui/react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "outline"
  | "ghost"
  | "danger"
  | "danger-soft";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<ComponentProps<typeof HeroButton>, "isPending"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingText,
  className,
  isDisabled,
  ...props
}: ButtonProps) {
  const isIconOnly = (props as Record<string, unknown>)["isIconOnly"] === true;
  return (
    <HeroButton
      variant={variant}
      size={size}
      isPending={isLoading}
      isDisabled={isDisabled === true || isLoading}
      className={cn(isIconOnly && "min-w-11 min-h-11", className)}
      {...props}
    >
      {({ isPending }) => (
        <>
          {isPending ? <Spinner color="current" size="sm" /> : null}
          {isPending && loadingText ? loadingText : children}
        </>
      )}
    </HeroButton>
  );
}

export { HeroButton };
