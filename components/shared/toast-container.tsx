"use client";

import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import {
  ToastContext,
  useToastState,
  type Toast,
  type ToastType,
} from "@/hooks/use-toast";

const TOAST_STYLES: Record<
  ToastType,
  { bg: string; icon: typeof CheckCircle; iconColor: string }
> = {
  success: {
    bg: "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800",
    icon: CheckCircle,
    iconColor: "text-green-800 dark:text-green-300",
  },
  error: {
    bg: "bg-red-100 border-red-200 dark:bg-red-900/30 dark:border-red-800",
    icon: XCircle,
    iconColor: "text-red-900 dark:text-red-200",
  },
  warning: {
    bg: "bg-yellow-100 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800",
    icon: AlertTriangle,
    iconColor: "text-yellow-900 dark:text-yellow-200",
  },
  info: {
    bg: "bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800",
    icon: Info,
    iconColor: "text-blue-900 dark:text-blue-200",
  },
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const { t } = useTranslation();
  const styles = TOAST_STYLES[toast.type];
  const Icon = styles.icon;

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm animate-slide-in ${styles.bg}`}
      role="alert"
    >
      <Icon className={`size-5 shrink-0 ${styles.iconColor}`} />
      <p className="flex-1 text-sm text-foreground">{toast.message}</p>
      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={t("common.dismiss")}
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const { toasts, addToast, removeToast } = useToastState();

  return (
    <ToastContext value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}
