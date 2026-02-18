"use client";

import { Component, type ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

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
        <div className="flex min-h-[400px] items-center justify-center p-8">
          <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950/30">
            <AlertTriangle className="mx-auto mb-4 size-12 text-red-500" />
            <h2 className="mb-2 text-xl font-bold text-red-700 dark:text-red-400">
              Something went wrong
            </h2>
            <p className="mb-4 text-sm text-red-600 dark:text-red-300">
              {this.state.error?.message ?? "An unexpected error occurred"}
            </p>

            {process.env.NODE_ENV === "development" && this.state.errorInfo && (
              <details className="mb-4 text-left">
                <summary className="cursor-pointer text-xs text-red-500">
                  Stack trace
                </summary>
                <pre className="mt-2 max-h-32 overflow-auto rounded bg-red-100 p-2 text-xs dark:bg-red-900/50">
                  {this.state.errorInfo}
                </pre>
              </details>
            )}

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                <RefreshCw className="size-4" />
                Try Again
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-800 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
              >
                <Home className="size-4" />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
