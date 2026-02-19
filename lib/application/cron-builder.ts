// Cron Job Builder: Visual cron expression constructor
// Parses, generates, explains and validates cron expressions

import type {
  CronExpression,
  CronPreset,
  CronExplanation,
  CronFieldExplanation,
  CronField,
  NextExecution,
  CronValidation,
  CronFieldError,
  ConfigFormat,
  CronConfig,
} from "@/types/cron-builder";
import { CRON_FIELD_RANGES, CRON_FIELD_LABELS } from "@/types/cron-builder";

// --- IaC Generators ---

export function generateConfig(expression: string, format: ConfigFormat): CronConfig {
  switch (format) {
    case "kubernetes":
      return {
        format,
        label: "Kubernetes CronJob",
        language: "yaml",
        code: `apiVersion: batch/v1
kind: CronJob
metadata:
  name: my-cron-job
spec:
  schedule: "${expression}"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: job
            image: my-image:latest
          restartPolicy: OnFailure`,
      };
    case "github-actions":
      return {
        format,
        label: "GitHub Actions",
        language: "yaml",
        code: `name: Scheduled Job
on:
  schedule:
    - cron: '${expression}'
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run script
        run: echo "Running scheduled task"`,
      };
    case "aws-eventbridge":
      return {
        format,
        label: "AWS EventBridge",
        language: "json",
        code: `{
  "Name": "my-scheduled-rule",
  "ScheduleExpression": "cron(${expression.replace(/\*/g, "?")})", # Note: AWS uses ? for wildcards sometimes
  "State": "ENABLED"
}`,
      };
    case "linux-crontab":
    default:
      return {
        format,
        label: "Linux Crontab",
        language: "bash",
        code: `${expression} /usr/bin/python3 /path/to/script.py >> /var/log/cron.log 2>&1`,
      };
  }
}

// --- Common Presets ---

export const CRON_PRESETS: CronPreset[] = [
  {
    id: "every-minute",
    name: "Cada minuto",
    description: "Se ejecuta cada minuto",
    expression: "* * * * *",
    icon: "Zap",
  },
  {
    id: "every-5-minutes",
    name: "Cada 5 minutos",
    description: "Se ejecuta cada 5 minutos",
    expression: "*/5 * * * *",
    icon: "Clock",
  },
  {
    id: "every-15-minutes",
    name: "Cada 15 minutos",
    description: "Se ejecuta cada 15 minutos",
    expression: "*/15 * * * *",
    icon: "Clock",
  },
  {
    id: "every-30-minutes",
    name: "Cada 30 minutos",
    description: "Se ejecuta cada media hora",
    expression: "*/30 * * * *",
    icon: "Clock",
  },
  {
    id: "hourly",
    name: "Cada hora",
    description: "Se ejecuta al inicio de cada hora",
    expression: "0 * * * *",
    icon: "Clock",
  },
  {
    id: "daily-midnight",
    name: "Diario (medianoche)",
    description: "Se ejecuta a las 00:00 cada día",
    expression: "0 0 * * *",
    icon: "Calendar",
  },
  {
    id: "daily-noon",
    name: "Diario (mediodía)",
    description: "Se ejecuta a las 12:00 cada día",
    expression: "0 12 * * *",
    icon: "Sun",
  },
  {
    id: "weekly-monday",
    name: "Semanal (lunes)",
    description: "Se ejecuta cada lunes a las 00:00",
    expression: "0 0 * * 1",
    icon: "Calendar",
  },
  {
    id: "monthly",
    name: "Mensual",
    description: "Se ejecuta el día 1 de cada mes a las 00:00",
    expression: "0 0 1 * *",
    icon: "Calendar",
  },
  {
    id: "weekdays",
    name: "Días laborables",
    description: "Se ejecuta de lunes a viernes a las 09:00",
    expression: "0 9 * * 1-5",
    icon: "Briefcase",
  },
  {
    id: "weekends",
    name: "Fines de semana",
    description: "Se ejecuta sábados y domingos a las 10:00",
    expression: "0 10 * * 0,6",
    icon: "Coffee",
  },
  {
    id: "yearly",
    name: "Anual",
    description: "Se ejecuta el 1 de enero a las 00:00",
    expression: "0 0 1 1 *",
    icon: "Gift",
  },
];

// --- Parse Expression ---

export function parseExpression(expression: string): CronExpression {
  const parts = expression.trim().split(/\s+/);

  if (parts.length !== 5) {
    throw new Error("La expresión cron debe tener 5 campos");
  }

  return {
    minute: parts[0] ?? "*",
    hour: parts[1] ?? "*",
    dayOfMonth: parts[2] ?? "*",
    month: parts[3] ?? "*",
    dayOfWeek: parts[4] ?? "*",
  };
}

export function buildExpression(cron: CronExpression): string {
  return `${cron.minute} ${cron.hour} ${cron.dayOfMonth} ${cron.month} ${cron.dayOfWeek}`;
}

// --- Validation ---

export function validateExpression(expression: string): CronValidation {
  const errors: CronFieldError[] = [];

  try {
    const cron = parseExpression(expression);
    const fields: CronField[] = ["minute", "hour", "dayOfMonth", "month", "dayOfWeek"];

    for (const field of fields) {
      const value = cron[field];
      const fieldError = validateField(field, value);
      if (fieldError) {
        errors.push(fieldError);
      }
    }
  } catch (e) {
    errors.push({
      field: "minute",
      message: e instanceof Error ? e.message : "Expresión inválida",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function validateField(field: CronField, value: string): CronFieldError | null {
  const range = CRON_FIELD_RANGES[field];

  // Wildcard
  if (value === "*") return null;

  // Step values: */n or n/m
  if (value.includes("/")) {
    const [base, step] = value.split("/");
    if (base !== "*" && base !== undefined) {
      const baseError = validateFieldValue(field, base, range);
      if (baseError) return baseError;
    }
    if (step === undefined || !/^\d+$/.test(step) || parseInt(step) < 1) {
      return { field, message: `${CRON_FIELD_LABELS[field]}: paso inválido "${step}"` };
    }
    return null;
  }

  // Range: n-m
  if (value.includes("-") && !value.includes(",")) {
    const [start, end] = value.split("-");
    if (start === undefined || end === undefined) {
      return { field, message: `${CRON_FIELD_LABELS[field]}: rango inválido` };
    }
    const startError = validateFieldValue(field, start, range);
    if (startError) return startError;
    const endError = validateFieldValue(field, end, range);
    if (endError) return endError;

    if (parseInt(start) > parseInt(end)) {
      return { field, message: `${CRON_FIELD_LABELS[field]}: el inicio del rango es mayor que el fin` };
    }
    return null;
  }

  // List: n,m,o
  if (value.includes(",")) {
    const items = value.split(",");
    for (const item of items) {
      // Each item can be a number or a range
      if (item.includes("-")) {
        const [start, end] = item.split("-");
        if (start === undefined || end === undefined) {
          return { field, message: `${CRON_FIELD_LABELS[field]}: rango inválido en lista` };
        }
        const startError = validateFieldValue(field, start, range);
        if (startError) return startError;
        const endError = validateFieldValue(field, end, range);
        if (endError) return endError;
      } else {
        const itemError = validateFieldValue(field, item, range);
        if (itemError) return itemError;
      }
    }
    return null;
  }

  // Single value
  return validateFieldValue(field, value, range);
}

function validateFieldValue(
  field: CronField,
  value: string,
  range: { min: number; max: number }
): CronFieldError | null {
  const num = parseInt(value);

  if (isNaN(num)) {
    return { field, message: `${CRON_FIELD_LABELS[field]}: "${value}" no es un número válido` };
  }

  if (num < range.min || num > range.max) {
    return {
      field,
      message: `${CRON_FIELD_LABELS[field]}: ${num} fuera de rango (${range.min}-${range.max})`,
    };
  }

  return null;
}

// --- Explanation ---

export function explainExpression(expression: string): CronExplanation {
  const validation = validateExpression(expression);
  if (!validation.isValid) {
    return {
      summary: "Expresión inválida",
      details: [],
      humanReadable: validation.errors.map((e) => e.message).join(". "),
    };
  }

  const cron = parseExpression(expression);
  const details: CronFieldExplanation[] = [
    { field: "minute", value: cron.minute, explanation: explainField("minute", cron.minute) },
    { field: "hour", value: cron.hour, explanation: explainField("hour", cron.hour) },
    { field: "dayOfMonth", value: cron.dayOfMonth, explanation: explainField("dayOfMonth", cron.dayOfMonth) },
    { field: "month", value: cron.month, explanation: explainField("month", cron.month) },
    { field: "dayOfWeek", value: cron.dayOfWeek, explanation: explainField("dayOfWeek", cron.dayOfWeek) },
  ];

  const humanReadable = buildHumanReadable(cron);

  return {
    summary: humanReadable,
    details,
    humanReadable,
  };
}

function explainField(field: CronField, value: string): string {
  const label = CRON_FIELD_LABELS[field];
  const range = CRON_FIELD_RANGES[field];

  if (value === "*") {
    return `Cada ${label.toLowerCase()}`;
  }

  if (value.includes("/")) {
    const [base, step] = value.split("/");
    if (base === "*") {
      return `Cada ${step} ${getFieldUnit(field)}`;
    }
    return `Cada ${step} ${getFieldUnit(field)} empezando en ${base}`;
  }

  if (value.includes("-") && !value.includes(",")) {
    const [start, end] = value.split("-");
    return `Del ${formatFieldValue(field, start!, range)} al ${formatFieldValue(field, end!, range)}`;
  }

  if (value.includes(",")) {
    const items = value.split(",");
    const formatted = items.map((item) => {
      if (item.includes("-")) {
        const [start, end] = item.split("-");
        return `${formatFieldValue(field, start!, range)}-${formatFieldValue(field, end!, range)}`;
      }
      return formatFieldValue(field, item, range);
    });
    return formatted.join(", ");
  }

  return `${label}: ${formatFieldValue(field, value, range)}`;
}

function getFieldUnit(field: CronField): string {
  const units: Record<CronField, string> = {
    minute: "minutos",
    hour: "horas",
    dayOfMonth: "días",
    month: "meses",
    dayOfWeek: "días",
  };
  return units[field];
}

function formatFieldValue(
  field: CronField,
  value: string,
  range: { min: number; max: number; names?: string[] }
): string {
  const num = parseInt(value);
  if (isNaN(num)) return value;

  if (range.names && num >= range.min && num <= range.max) {
    const index = field === "month" ? num - 1 : num;
    return range.names[index] ?? value;
  }

  if (field === "hour") {
    return `${num.toString().padStart(2, "0")}:00`;
  }

  return value;
}

function buildHumanReadable(cron: CronExpression): string {
  const parts: string[] = [];

  // Time
  const minute = cron.minute;
  const hour = cron.hour;

  if (minute === "*" && hour === "*") {
    parts.push("Cada minuto");
  } else if (minute.startsWith("*/")) {
    const step = minute.split("/")[1];
    parts.push(`Cada ${step} minutos`);
  } else if (hour === "*" && /^\d+$/.test(minute)) {
    parts.push(`En el minuto ${minute} de cada hora`);
  } else if (/^\d+$/.test(minute) && /^\d+$/.test(hour)) {
    const h = parseInt(hour).toString().padStart(2, "0");
    const m = parseInt(minute).toString().padStart(2, "0");
    parts.push(`A las ${h}:${m}`);
  } else if (/^\d+$/.test(minute) && hour.includes("-")) {
    const [start, end] = hour.split("-");
    const m = parseInt(minute).toString().padStart(2, "0");
    parts.push(`En el minuto ${m}, de ${start}:00 a ${end}:00`);
  } else {
    if (minute !== "*") parts.push(`minuto ${minute}`);
    if (hour !== "*") parts.push(`hora ${hour}`);
  }

  // Day of month
  if (cron.dayOfMonth !== "*") {
    if (/^\d+$/.test(cron.dayOfMonth)) {
      parts.push(`el día ${cron.dayOfMonth}`);
    } else {
      parts.push(`días ${cron.dayOfMonth}`);
    }
  }

  // Month
  if (cron.month !== "*") {
    const monthNames = CRON_FIELD_RANGES.month.names!;
    if (/^\d+$/.test(cron.month)) {
      const idx = parseInt(cron.month) - 1;
      parts.push(`en ${monthNames[idx] ?? cron.month}`);
    } else {
      parts.push(`meses ${cron.month}`);
    }
  }

  // Day of week
  if (cron.dayOfWeek !== "*") {
    const dayNames = CRON_FIELD_RANGES.dayOfWeek.names!;
    if (/^\d+$/.test(cron.dayOfWeek)) {
      const idx = parseInt(cron.dayOfWeek);
      parts.push(`los ${dayNames[idx] ?? cron.dayOfWeek}`);
    } else if (cron.dayOfWeek === "1-5") {
      parts.push("de lunes a viernes");
    } else if (cron.dayOfWeek === "0,6") {
      parts.push("sábados y domingos");
    } else {
      parts.push(`días de semana ${cron.dayOfWeek}`);
    }
  }

  return parts.join(" ") || "Cada minuto";
}

// --- Timezones ---

export interface TimezoneOption {
  id: string;
  label: string;
  offset: string;
}

export const COMMON_TIMEZONES: TimezoneOption[] = [
  { id: "UTC", label: "UTC", offset: "+00:00" },
  { id: "America/New_York", label: "US Eastern", offset: "-05:00" },
  { id: "America/Chicago", label: "US Central", offset: "-06:00" },
  { id: "America/Denver", label: "US Mountain", offset: "-07:00" },
  { id: "America/Los_Angeles", label: "US Pacific", offset: "-08:00" },
  { id: "Europe/London", label: "London", offset: "+00:00" },
  { id: "Europe/Madrid", label: "Madrid", offset: "+01:00" },
  { id: "Europe/Berlin", label: "Berlin", offset: "+01:00" },
  { id: "Europe/Paris", label: "Paris", offset: "+01:00" },
  { id: "Asia/Tokyo", label: "Tokyo", offset: "+09:00" },
  { id: "Asia/Shanghai", label: "Shanghai", offset: "+08:00" },
  { id: "Asia/Kolkata", label: "Kolkata", offset: "+05:30" },
  { id: "Australia/Sydney", label: "Sydney", offset: "+11:00" },
  { id: "Pacific/Auckland", label: "Auckland", offset: "+13:00" },
];

/** Get date components in a specific timezone using Intl API */
function getDateInTimezone(date: Date, timezone: string): { minute: number; hour: number; day: number; month: number; weekday: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "numeric",
    day: "numeric",
    month: "numeric",
    weekday: "short",
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((p) => p.type === type)?.value ?? "0";

  const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  return {
    minute: parseInt(get("minute")),
    hour: parseInt(get("hour")),
    day: parseInt(get("day")),
    month: parseInt(get("month")),
    weekday: weekdayMap[get("weekday")] ?? 0,
  };
}

// --- Next Executions ---

export function calculateNextExecutions(expression: string, count: number = 5, timezone?: string): NextExecution[] {
  const validation = validateExpression(expression);
  if (!validation.isValid) {
    return [];
  }

  const cron = parseExpression(expression);
  const executions: NextExecution[] = [];
  const now = new Date();
  const current = new Date(now);

  // Reset seconds and milliseconds
  current.setSeconds(0);
  current.setMilliseconds(0);

  // Move to next minute
  current.setMinutes(current.getMinutes() + 1);

  let iterations = 0;
  const maxIterations = 525600; // Max 1 year of minutes

  while (executions.length < count && iterations < maxIterations) {
    const matches = timezone
      ? matchesCronInTimezone(current, cron, timezone)
      : matchesCron(current, cron);

    if (matches) {
      executions.push({
        date: new Date(current),
        formatted: timezone ? formatDateWithTimezone(current, timezone) : formatDate(current),
        relative: formatRelative(current, now),
      });
    }

    current.setMinutes(current.getMinutes() + 1);
    iterations++;
  }

  return executions;
}

function matchesCronInTimezone(date: Date, cron: CronExpression, timezone: string): boolean {
  const tz = getDateInTimezone(date, timezone);

  return (
    matchesField(tz.minute, cron.minute, 0) &&
    matchesField(tz.hour, cron.hour, 0) &&
    matchesField(tz.day, cron.dayOfMonth, 1) &&
    matchesField(tz.month, cron.month, 1) &&
    matchesField(tz.weekday, cron.dayOfWeek, 0)
  );
}

function matchesCron(date: Date, cron: CronExpression): boolean {
  const minute = date.getMinutes();
  const hour = date.getHours();
  const dayOfMonth = date.getDate();
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  const dayOfWeek = date.getDay();

  return (
    matchesField(minute, cron.minute, 0) &&
    matchesField(hour, cron.hour, 0) &&
    matchesField(dayOfMonth, cron.dayOfMonth, 1) &&
    matchesField(month, cron.month, 1) &&
    matchesField(dayOfWeek, cron.dayOfWeek, 0)
  );
}

function matchesField(value: number, pattern: string, min: number): boolean {
  if (pattern === "*") return true;

  // Step: */n or m/n
  if (pattern.includes("/")) {
    const [base, stepStr] = pattern.split("/");
    const step = parseInt(stepStr ?? "1");
    const start = base === "*" ? min : parseInt(base ?? "0");
    return (value - start) % step === 0 && value >= start;
  }

  // List: n,m,o
  if (pattern.includes(",")) {
    const items = pattern.split(",");
    return items.some((item) => {
      if (item.includes("-")) {
        const [start, end] = item.split("-");
        return value >= parseInt(start ?? "0") && value <= parseInt(end ?? "0");
      }
      return value === parseInt(item);
    });
  }

  // Range: n-m
  if (pattern.includes("-")) {
    const [start, end] = pattern.split("-");
    return value >= parseInt(start ?? "0") && value <= parseInt(end ?? "0");
  }

  // Single value
  return value === parseInt(pattern);
}

function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString("es-ES", options);
}

function formatDateWithTimezone(date: Date, timezone: string): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
    timeZoneName: "short",
  };
  return date.toLocaleDateString("es-ES", options);
}

function formatRelative(date: Date, now: Date): string {
  const diffMs = date.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 60) {
    return `en ${diffMinutes} minuto${diffMinutes !== 1 ? "s" : ""}`;
  }

  if (diffHours < 24) {
    const mins = diffMinutes % 60;
    if (mins > 0) {
      return `en ${diffHours}h ${mins}m`;
    }
    return `en ${diffHours} hora${diffHours !== 1 ? "s" : ""}`;
  }

  if (diffDays < 7) {
    return `en ${diffDays} día${diffDays !== 1 ? "s" : ""}`;
  }

  const diffWeeks = Math.floor(diffDays / 7);
  return `en ${diffWeeks} semana${diffWeeks !== 1 ? "s" : ""}`;
}

// --- Utility ---

export function isValidExpression(expression: string): boolean {
  return validateExpression(expression).isValid;
}
