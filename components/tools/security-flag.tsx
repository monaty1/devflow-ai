import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import type { SecurityFlag, SecurityFlagType } from "@/types/prompt-analyzer";

interface SecurityFlagBadgeProps {
  flag: SecurityFlag;
}

const FLAG_LABELS: Record<SecurityFlagType, string> = {
  prompt_injection: "Injection",
  role_override: "Role Override",
  data_exfiltration: "Data Leak",
  jailbreak_attempt: "Jailbreak",
  ignore_instruction: "Ignore Instructions",
};

const SEVERITY_STYLES = {
  critical: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-900 dark:text-red-200",
    border: "border-red-200 dark:border-red-800",
    Icon: AlertTriangle,
  },
  warning: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-900 dark:text-yellow-200",
    border: "border-yellow-200 dark:border-yellow-800",
    Icon: AlertCircle,
  },
  info: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-900 dark:text-blue-200",
    border: "border-blue-200 dark:border-blue-800",
    Icon: Info,
  },
};

export function SecurityFlagBadge({ flag }: SecurityFlagBadgeProps) {
  const styles = SEVERITY_STYLES[flag.severity];
  const { Icon } = styles;

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-3 ${styles.bg} ${styles.border}`}
    >
      <Icon className={`mt-0.5 size-5 shrink-0 ${styles.text}`} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`font-medium ${styles.text}`}>
            {FLAG_LABELS[flag.type]}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase ${styles.bg} ${styles.text}`}
          >
            {flag.severity}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{flag.description}</p>
      </div>
    </div>
  );
}

interface SecurityFlagsListProps {
  flags: SecurityFlag[];
}

export function SecurityFlagsList({ flags }: SecurityFlagsListProps) {
  if (flags.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-100 p-4 dark:border-green-800 dark:bg-green-900/30">
        <Info className="size-5 text-green-900 dark:text-green-200" />
        <span className="text-green-900 dark:text-green-200">No security issues detected</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {flags.map((flag, index) => (
        <SecurityFlagBadge key={`${flag.type}-${index}`} flag={flag} />
      ))}
    </div>
  );
}
