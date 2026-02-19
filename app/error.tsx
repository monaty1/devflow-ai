"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorPageProps) {
  const { t } = useTranslation();

  useEffect(() => {
    console.error("Root error boundary caught:", error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-8" role="alert" aria-live="assertive">
      <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950/30">
        <AlertTriangle className="mx-auto mb-4 size-12 text-red-500" aria-hidden="true" />
        <h2 className="mb-2 text-xl font-bold text-red-700 dark:text-red-400">
          {t("error.title")}
        </h2>
        <p className="mb-4 text-sm text-red-600 dark:text-red-300">
          {error.message || t("error.defaultMessage")}
        </p>

        {process.env.NODE_ENV === "development" && error.digest && (
          <p className="mb-4 text-xs text-red-500">Digest: {error.digest}</p>
        )}

        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="flex min-h-11 min-w-11 items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            {t("error.tryAgain")}
          </button>
          <Link
            href="/"
            className="flex min-h-11 min-w-11 items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-800 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
          >
            <Home className="size-4" aria-hidden="true" />
            {t("error.goHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
