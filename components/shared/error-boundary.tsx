"use client";

import { Component, type ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui";

interface ErrorFallbackUIProps {
  error: Error | null;
  errorInfo: string | null;
  onReset: () => void;
  onGoHome: () => void;
}

function ErrorFallbackUI({ error, errorInfo, onReset, onGoHome }: ErrorFallbackUIProps) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[400px] items-center justify-center p-8" role="alert" aria-live="assertive">
      <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950/30">
        <AlertTriangle className="mx-auto mb-4 size-12 text-red-500" aria-hidden="true" />
        <h2 className="mb-2 text-xl font-bold text-red-700 dark:text-red-400">
          {t("error.title")}
        </h2>
        <p className="mb-4 text-sm text-red-600 dark:text-red-300">
          {error?.message ?? t("error.defaultMessage")}
        </p>

        {process.env.NODE_ENV === "development" && errorInfo && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-xs text-red-500">
              {t("error.stackTrace")}
            </summary>
            <pre className="mt-2 max-h-32 overflow-auto rounded bg-red-100 p-2 text-xs dark:bg-red-900/50">
              {errorInfo}
            </pre>
          </details>
        )}

        <div className="flex justify-center gap-3">
          <Button
            variant="primary"
            onPress={onReset}
            className="gap-2 bg-red-600 hover:bg-red-700"
          >
            <RefreshCw className="size-4" />
            {t("error.tryAgain")}
          </Button>
          <Button
            variant="outline"
            onPress={onGoHome}
            className="gap-2 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900"
          >
            <Home className="size-4" />
            {t("error.goHome")}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("ErrorBoundary caught:", error, errorInfo);
    Sentry.captureException(error, {
      contexts: { react: { componentStack: errorInfo.componentStack } },
    });
    this.setState({
      errorInfo: errorInfo.componentStack ?? null,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = (): void => {
    window.location.href = "/";
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallbackUI
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          onGoHome={this.handleGoHome}
        />
      );
    }

    return this.props.children;
  }
}
