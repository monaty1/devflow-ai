import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Sentry
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

// Mock translations
vi.mock("@/hooks/use-translation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "error.title": "Something went wrong",
        "error.defaultMessage": "An unexpected error occurred",
        "error.tryAgain": "Try again",
        "error.goHome": "Go home",
        "error.stackTrace": "Stack trace",
      };
      return map[key] ?? key;
    },
  }),
}));

// Mock HeroUI Button
vi.mock("@/components/ui", () => ({
  Button: ({
    children,
    onPress,
    ...props
  }: Record<string, unknown>) => (
    <button
      onClick={() => (onPress as () => void)?.()}
      data-testid={props["data-testid"] as string | undefined}
    >
      {children as React.ReactNode}
    </button>
  ),
}));

import * as Sentry from "@sentry/nextjs";
import { ErrorBoundary } from "@/components/shared/error-boundary";

// Component that always throws
function ThrowingChild({ message }: { message: string }): React.ReactNode {
  throw new Error(message);
}

// Component that renders fine
function GoodChild() {
  return <div data-testid="good-child">All good</div>;
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress React error boundary console.error noise
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("renders children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>,
    );
    expect(screen.getByTestId("good-child")).toBeInTheDocument();
  });

  it("renders fallback UI when child throws", () => {
    render(
      <ErrorBoundary>
        <ThrowingChild message="Test error" />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Test error")).toBeInTheDocument();
  });

  it("renders default error message when error has no message", () => {
    function ThrowNull(): React.ReactNode {
      throw new Error();
    }
    render(
      <ErrorBoundary>
        <ThrowNull />
      </ErrorBoundary>,
    );
    // Error with empty message — fallback text should show
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    render(
      <ErrorBoundary fallback={<div data-testid="custom-fallback">Custom</div>}>
        <ThrowingChild message="boom" />
      </ErrorBoundary>,
    );
    expect(screen.getByTestId("custom-fallback")).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });

  it("calls Sentry.captureException on error", () => {
    render(
      <ErrorBoundary>
        <ThrowingChild message="sentry test" />
      </ErrorBoundary>,
    );
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: "sentry test" }),
      expect.objectContaining({
        contexts: { react: { componentStack: expect.any(String) } },
      }),
    );
  });

  it("shows Try again and Go home buttons", () => {
    render(
      <ErrorBoundary>
        <ThrowingChild message="buttons test" />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Try again")).toBeInTheDocument();
    expect(screen.getByText("Go home")).toBeInTheDocument();
  });

  it("resets error state when Try again is clicked", async () => {
    let shouldThrow = true;
    function ConditionalThrower() {
      if (shouldThrow) throw new Error("conditional");
      return <div data-testid="recovered">Recovered</div>;
    }

    const user = userEvent.setup();
    render(
      <ErrorBoundary>
        <ConditionalThrower />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Stop throwing before clicking reset
    shouldThrow = false;
    await user.click(screen.getByText("Try again"));
    expect(screen.getByTestId("recovered")).toBeInTheDocument();
  });

  it("has role=alert and aria-live=assertive on error UI", () => {
    render(
      <ErrorBoundary>
        <ThrowingChild message="a11y test" />
      </ErrorBoundary>,
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
  });
});
