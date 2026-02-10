import NextLink from "next/link";
import { Button } from "@heroui/react";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-8xl font-bold text-muted-foreground/20">404</h1>
      <h2 className="mt-4 text-2xl font-bold text-foreground">
        Page Not Found
      </h2>
      <p className="mt-2 text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Button size="lg" className="mt-8 gap-2">
        <NextLink href="/" className="flex items-center gap-2">
          <Home className="size-4" />
          Back to Home
        </NextLink>
      </Button>
    </div>
  );
}
