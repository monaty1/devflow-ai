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
import { CRON_FIELD_RANGES } from "@/types/cron-builder";

// --- Locale type (pure, no React) ---

type Locale = "en" | "es";

// --- i18n Strings Lookup ---

const CRON_STRINGS = {
  en: {
    // Field labels
    fieldLabels: {
      minute: "Minute",
      hour: "Hour",
      dayOfMonth: "Day of month",
      month: "Month",
      dayOfWeek: "Day of week",
    } satisfies Record<CronField, string>,

    // Field units (plural)
    fieldUnits: {
      minute: "minutes",
      hour: "hours",
      dayOfMonth: "days",
      month: "months",
      dayOfWeek: "days",
    } satisfies Record<CronField, string>,

    // Month abbreviations (index 0-11)
    monthNames: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],

    // Day-of-week abbreviations (index 0=Sun .. 6=Sat)
    dayNames: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],

    // Parse / validation messages
    parseError: "Cron expression must have 5 fields",
    invalidExpression: "Invalid expression",
    invalidStep: (label: string, step: string | undefined) => `${label}: invalid step "${step}"`,
    invalidRange: (label: string) => `${label}: invalid range`,
    rangeStartGreaterThanEnd: (label: string) => `${label}: range start is greater than end`,
    invalidRangeInList: (label: string) => `${label}: invalid range in list`,
    notAValidNumber: (label: string, value: string) => `${label}: "${value}" is not a valid number`,
    outOfRange: (label: string, num: number, min: number, max: number) =>
      `${label}: ${num} out of range (${min}-${max})`,

    // Explanation templates
    every: (unit: string) => `Every ${unit}`,
    everyN: (step: string | undefined, unit: string) => `Every ${step} ${unit}`,
    everyNStartingAt: (step: string | undefined, unit: string, base: string | undefined) =>
      `Every ${step} ${unit} starting at ${base}`,
    fromTo: (start: string, end: string) => `From ${start} to ${end}`,

    // buildHumanReadable templates
    everyMinute: "Every minute",
    everyNMinutes: (step: string | undefined) => `Every ${step} minutes`,
    atMinuteOfEveryHour: (minute: string) => `At minute ${minute} of every hour`,
    atTime: (h: string, m: string) => `At ${h}:${m}`,
    atMinuteFromTo: (m: string, start: string | undefined, end: string | undefined) =>
      `At minute ${m}, from ${start}:00 to ${end}:00`,
    minuteFallback: (minute: string) => `minute ${minute}`,
    hourFallback: (hour: string) => `hour ${hour}`,
    onDay: (day: string) => `on day ${day}`,
    days: (dayOfMonth: string) => `days ${dayOfMonth}`,
    inMonth: (monthName: string) => `in ${monthName}`,
    months: (month: string) => `months ${month}`,
    onDayOfWeek: (dayName: string) => `on ${dayName}`,
    mondayToFriday: "Monday to Friday",
    saturdaysAndSundays: "Saturdays and Sundays",
    weekdays: (dayOfWeek: string) => `weekdays ${dayOfWeek}`,

    // formatRelative templates
    inMinutes: (n: number) => `in ${n} minute${n !== 1 ? "s" : ""}`,
    inHoursAndMinutes: (h: number, m: number) => `in ${h}h ${m}m`,
    inHours: (n: number) => `in ${n} hour${n !== 1 ? "s" : ""}`,
    inDays: (n: number) => `in ${n} day${n !== 1 ? "s" : ""}`,
    inWeeks: (n: number) => `in ${n} week${n !== 1 ? "s" : ""}`,

    // Intl locale code for date formatting
    intlLocale: "en-US",

    // Preset names and descriptions
    presets: {
      "every-minute": { name: "Every minute", description: "Runs every minute" },
      "every-5-minutes": { name: "Every 5 minutes", description: "Runs every 5 minutes" },
      "every-15-minutes": { name: "Every 15 minutes", description: "Runs every 15 minutes" },
      "every-30-minutes": { name: "Every 30 minutes", description: "Runs every half hour" },
      "hourly": { name: "Hourly", description: "Runs at the start of every hour" },
      "daily-midnight": { name: "Daily (midnight)", description: "Runs at 00:00 every day" },
      "daily-noon": { name: "Daily (noon)", description: "Runs at 12:00 every day" },
      "weekly-monday": { name: "Weekly (Monday)", description: "Runs every Monday at 00:00" },
      "monthly": { name: "Monthly", description: "Runs on the 1st of every month at 00:00" },
      "weekdays": { name: "Weekdays", description: "Runs Monday to Friday at 09:00" },
      "weekends": { name: "Weekends", description: "Runs Saturdays and Sundays at 10:00" },
      "yearly": { name: "Yearly", description: "Runs on January 1st at 00:00" },
    } as Record<string, { name: string; description: string }>,
  },

  es: {
    // Field labels
    fieldLabels: {
      minute: "Minuto",
      hour: "Hora",
      dayOfMonth: "Día del mes",
      month: "Mes",
      dayOfWeek: "Día de la semana",
    } satisfies Record<CronField, string>,

    // Field units (plural)
    fieldUnits: {
      minute: "minutos",
      hour: "horas",
      dayOfMonth: "días",
      month: "meses",
      dayOfWeek: "días",
    } satisfies Record<CronField, string>,

    // Month abbreviations (index 0-11)
    monthNames: ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"],

    // Day-of-week abbreviations (index 0=Sun .. 6=Sat)
    dayNames: ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"],

    // Parse / validation messages
    parseError: "La expresión cron debe tener 5 campos",
    invalidExpression: "Expresión inválida",
    invalidStep: (label: string, step: string | undefined) => `${label}: paso inválido "${step}"`,
    invalidRange: (label: string) => `${label}: rango inválido`,
    rangeStartGreaterThanEnd: (label: string) => `${label}: el inicio del rango es mayor que el fin`,
    invalidRangeInList: (label: string) => `${label}: rango inválido en lista`,
    notAValidNumber: (label: string, value: string) => `${label}: "${value}" no es un número válido`,
    outOfRange: (label: string, num: number, min: number, max: number) =>
      `${label}: ${num} fuera de rango (${min}-${max})`,

    // Explanation templates
    every: (unit: string) => `Cada ${unit}`,
    everyN: (step: string | undefined, unit: string) => `Cada ${step} ${unit}`,
    everyNStartingAt: (step: string | undefined, unit: string, base: string | undefined) =>
      `Cada ${step} ${unit} empezando en ${base}`,
    fromTo: (start: string, end: string) => `Del ${start} al ${end}`,

    // buildHumanReadable templates
    everyMinute: "Cada minuto",
    everyNMinutes: (step: string | undefined) => `Cada ${step} minutos`,
    atMinuteOfEveryHour: (minute: string) => `En el minuto ${minute} de cada hora`,
    atTime: (h: string, m: string) => `A las ${h}:${m}`,
    atMinuteFromTo: (m: string, start: string | undefined, end: string | undefined) =>
      `En el minuto ${m}, de ${start}:00 a ${end}:00`,
    minuteFallback: (minute: string) => `minuto ${minute}`,
    hourFallback: (hour: string) => `hora ${hour}`,
    onDay: (day: string) => `el día ${day}`,
    days: (dayOfMonth: string) => `días ${dayOfMonth}`,
    inMonth: (monthName: string) => `en ${monthName}`,
    months: (month: string) => `meses ${month}`,
    onDayOfWeek: (dayName: string) => `los ${dayName}`,
    mondayToFriday: "de lunes a viernes",
    saturdaysAndSundays: "sábados y domingos",
    weekdays: (dayOfWeek: string) => `días de semana ${dayOfWeek}`,

    // formatRelative templates
    inMinutes: (n: number) => `en ${n} minuto${n !== 1 ? "s" : ""}`,
    inHoursAndMinutes: (h: number, m: number) => `en ${h}h ${m}m`,
    inHours: (n: number) => `en ${n} hora${n !== 1 ? "s" : ""}`,
    inDays: (n: number) => `en ${n} día${n !== 1 ? "s" : ""}`,
    inWeeks: (n: number) => `en ${n} semana${n !== 1 ? "s" : ""}`,

    // Intl locale code for date formatting
    intlLocale: "es-ES",

    // Preset names and descriptions
    presets: {
      "every-minute": { name: "Cada minuto", description: "Se ejecuta cada minuto" },
      "every-5-minutes": { name: "Cada 5 minutos", description: "Se ejecuta cada 5 minutos" },
      "every-15-minutes": { name: "Cada 15 minutos", description: "Se ejecuta cada 15 minutos" },
      "every-30-minutes": { name: "Cada 30 minutos", description: "Se ejecuta cada media hora" },
      "hourly": { name: "Cada hora", description: "Se ejecuta al inicio de cada hora" },
      "daily-midnight": { name: "Diario (medianoche)", description: "Se ejecuta a las 00:00 cada día" },
      "daily-noon": { name: "Diario (mediodía)", description: "Se ejecuta a las 12:00 cada día" },
      "weekly-monday": { name: "Semanal (lunes)", description: "Se ejecuta cada lunes a las 00:00" },
      "monthly": { name: "Mensual", description: "Se ejecuta el día 1 de cada mes a las 00:00" },
      "weekdays": { name: "Días laborables", description: "Se ejecuta de lunes a viernes a las 09:00" },
      "weekends": { name: "Fines de semana", description: "Se ejecuta sábados y domingos a las 10:00" },
      "yearly": { name: "Anual", description: "Se ejecuta el 1 de enero a las 00:00" },
    } as Record<string, { name: string; description: string }>,
  },
} as const;

/** Helper to get the locale-aware strings object */
function t(locale: Locale) {
  return CRON_STRINGS[locale];
}

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
        // Note: AWS uses ? for wildcards sometimes
        code: `{
  "Name": "my-scheduled-rule",
  "ScheduleExpression": "cron(${expression.replace(/\*/g, "?")})",
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

// --- Common Presets (base data, locale-independent) ---

const CRON_PRESETS_BASE: Omit<CronPreset, "name" | "description">[] = [
  { id: "every-minute", expression: "* * * * *", icon: "Zap" },
  { id: "every-5-minutes", expression: "*/5 * * * *", icon: "Clock" },
  { id: "every-15-minutes", expression: "*/15 * * * *", icon: "Clock" },
  { id: "every-30-minutes", expression: "*/30 * * * *", icon: "Clock" },
  { id: "hourly", expression: "0 * * * *", icon: "Clock" },
  { id: "daily-midnight", expression: "0 0 * * *", icon: "Calendar" },
  { id: "daily-noon", expression: "0 12 * * *", icon: "Sun" },
  { id: "weekly-monday", expression: "0 0 * * 1", icon: "Calendar" },
  { id: "monthly", expression: "0 0 1 * *", icon: "Calendar" },
  { id: "weekdays", expression: "0 9 * * 1-5", icon: "Briefcase" },
  { id: "weekends", expression: "0 10 * * 0,6", icon: "Coffee" },
  { id: "yearly", expression: "0 0 1 1 *", icon: "Gift" },
];

/** Get locale-aware presets. Defaults to English. */
export function getCronPresets(locale: Locale = "en"): CronPreset[] {
  const strings = t(locale);
  return CRON_PRESETS_BASE.map((base) => {
    const presetStrings = strings.presets[base.id];
    return {
      ...base,
      name: presetStrings?.name ?? base.id,
      description: presetStrings?.description ?? "",
    };
  });
}

/**
 * Legacy static export for backward-compatibility.
 * New callers should prefer `getCronPresets(locale)`.
 */
export const CRON_PRESETS: CronPreset[] = getCronPresets("en");

// --- Parse Expression ---

export function parseExpression(expression: string, locale: Locale = "en"): CronExpression {
  const parts = expression.trim().split(/\s+/);

  if (parts.length !== 5) {
    throw new Error(t(locale).parseError);
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

export function validateExpression(expression: string, locale: Locale = "en"): CronValidation {
  const errors: CronFieldError[] = [];

  try {
    const cron = parseExpression(expression, locale);
    const fields: CronField[] = ["minute", "hour", "dayOfMonth", "month", "dayOfWeek"];

    for (const field of fields) {
      const value = cron[field];
      const fieldError = validateField(field, value, locale);
      if (fieldError) {
        errors.push(fieldError);
      }
    }
  } catch (e) {
    errors.push({
      field: "minute",
      message: e instanceof Error ? e.message : t(locale).invalidExpression,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function validateField(field: CronField, value: string, locale: Locale): CronFieldError | null {
  const range = CRON_FIELD_RANGES[field];
  const strings = t(locale);
  const label = strings.fieldLabels[field];

  // Wildcard
  if (value === "*") return null;

  // Step values: */n or n/m
  if (value.includes("/")) {
    const [base, step] = value.split("/");
    if (base !== "*" && base !== undefined) {
      const baseError = validateFieldValue(field, base, range, locale);
      if (baseError) return baseError;
    }
    if (step === undefined || !/^\d+$/.test(step) || parseInt(step) < 1) {
      return { field, message: strings.invalidStep(label, step) };
    }
    return null;
  }

  // Range: n-m
  if (value.includes("-") && !value.includes(",")) {
    const [start, end] = value.split("-");
    if (start === undefined || end === undefined) {
      return { field, message: strings.invalidRange(label) };
    }
    const startError = validateFieldValue(field, start, range, locale);
    if (startError) return startError;
    const endError = validateFieldValue(field, end, range, locale);
    if (endError) return endError;

    if (parseInt(start) > parseInt(end)) {
      return { field, message: strings.rangeStartGreaterThanEnd(label) };
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
          return { field, message: strings.invalidRangeInList(label) };
        }
        const startError = validateFieldValue(field, start, range, locale);
        if (startError) return startError;
        const endError = validateFieldValue(field, end, range, locale);
        if (endError) return endError;
      } else {
        const itemError = validateFieldValue(field, item, range, locale);
        if (itemError) return itemError;
      }
    }
    return null;
  }

  // Single value
  return validateFieldValue(field, value, range, locale);
}

function validateFieldValue(
  field: CronField,
  value: string,
  range: { min: number; max: number },
  locale: Locale
): CronFieldError | null {
  const num = parseInt(value);
  const strings = t(locale);
  const label = strings.fieldLabels[field];

  if (isNaN(num)) {
    return { field, message: strings.notAValidNumber(label, value) };
  }

  if (num < range.min || num > range.max) {
    return {
      field,
      message: strings.outOfRange(label, num, range.min, range.max),
    };
  }

  return null;
}

// --- Explanation ---

export function explainExpression(expression: string, locale: Locale = "en"): CronExplanation {
  const validation = validateExpression(expression, locale);
  if (!validation.isValid) {
    return {
      summary: t(locale).invalidExpression,
      details: [],
      humanReadable: validation.errors.map((e) => e.message).join(". "),
    };
  }

  const cron = parseExpression(expression, locale);
  const details: CronFieldExplanation[] = [
    { field: "minute", value: cron.minute, explanation: explainField("minute", cron.minute, locale) },
    { field: "hour", value: cron.hour, explanation: explainField("hour", cron.hour, locale) },
    { field: "dayOfMonth", value: cron.dayOfMonth, explanation: explainField("dayOfMonth", cron.dayOfMonth, locale) },
    { field: "month", value: cron.month, explanation: explainField("month", cron.month, locale) },
    { field: "dayOfWeek", value: cron.dayOfWeek, explanation: explainField("dayOfWeek", cron.dayOfWeek, locale) },
  ];

  const humanReadable = buildHumanReadable(cron, locale);

  return {
    summary: humanReadable,
    details,
    humanReadable,
  };
}

function explainField(field: CronField, value: string, locale: Locale): string {
  const strings = t(locale);
  const label = strings.fieldLabels[field];
  const range = CRON_FIELD_RANGES[field];

  if (value === "*") {
    return strings.every(label.toLowerCase());
  }

  if (value.includes("/")) {
    const [base, step] = value.split("/");
    const unit = strings.fieldUnits[field];
    if (base === "*") {
      return strings.everyN(step, unit);
    }
    return strings.everyNStartingAt(step, unit, base);
  }

  if (value.includes("-") && !value.includes(",")) {
    const [start, end] = value.split("-");
    return strings.fromTo(
      formatFieldValue(field, start!, range, locale),
      formatFieldValue(field, end!, range, locale)
    );
  }

  if (value.includes(",")) {
    const items = value.split(",");
    const formatted = items.map((item) => {
      if (item.includes("-")) {
        const [start, end] = item.split("-");
        return `${formatFieldValue(field, start!, range, locale)}-${formatFieldValue(field, end!, range, locale)}`;
      }
      return formatFieldValue(field, item, range, locale);
    });
    return formatted.join(", ");
  }

  return `${label}: ${formatFieldValue(field, value, range, locale)}`;
}

function formatFieldValue(
  field: CronField,
  value: string,
  range: { min: number; max: number; names?: string[] },
  locale: Locale
): string {
  const num = parseInt(value);
  if (isNaN(num)) return value;

  // Use locale-aware names for months and days
  const strings = t(locale);
  if (field === "month" && num >= range.min && num <= range.max) {
    return strings.monthNames[num - 1] ?? value;
  }
  if (field === "dayOfWeek" && num >= range.min && num <= range.max) {
    return strings.dayNames[num] ?? value;
  }

  // For other fields with names from the types file, fall back to range.names
  if (range.names && num >= range.min && num <= range.max) {
    const index = field === "month" ? num - 1 : num;
    return range.names[index] ?? value;
  }

  if (field === "hour") {
    return `${num.toString().padStart(2, "0")}:00`;
  }

  return value;
}

function buildHumanReadable(cron: CronExpression, locale: Locale): string {
  const strings = t(locale);
  const parts: string[] = [];

  // Time
  const minute = cron.minute;
  const hour = cron.hour;

  if (minute === "*" && hour === "*") {
    parts.push(strings.everyMinute);
  } else if (minute.startsWith("*/")) {
    const step = minute.split("/")[1];
    parts.push(strings.everyNMinutes(step));
  } else if (hour === "*" && /^\d+$/.test(minute)) {
    parts.push(strings.atMinuteOfEveryHour(minute));
  } else if (/^\d+$/.test(minute) && /^\d+$/.test(hour)) {
    const h = parseInt(hour).toString().padStart(2, "0");
    const m = parseInt(minute).toString().padStart(2, "0");
    parts.push(strings.atTime(h, m));
  } else if (/^\d+$/.test(minute) && hour.includes("-")) {
    const [start, end] = hour.split("-");
    const m = parseInt(minute).toString().padStart(2, "0");
    parts.push(strings.atMinuteFromTo(m, start, end));
  } else {
    if (minute !== "*") parts.push(strings.minuteFallback(minute));
    if (hour !== "*") parts.push(strings.hourFallback(hour));
  }

  // Day of month
  if (cron.dayOfMonth !== "*") {
    if (/^\d+$/.test(cron.dayOfMonth)) {
      parts.push(strings.onDay(cron.dayOfMonth));
    } else {
      parts.push(strings.days(cron.dayOfMonth));
    }
  }

  // Month
  if (cron.month !== "*") {
    if (/^\d+$/.test(cron.month)) {
      const idx = parseInt(cron.month) - 1;
      parts.push(strings.inMonth(strings.monthNames[idx] ?? cron.month));
    } else {
      parts.push(strings.months(cron.month));
    }
  }

  // Day of week
  if (cron.dayOfWeek !== "*") {
    if (/^\d+$/.test(cron.dayOfWeek)) {
      const idx = parseInt(cron.dayOfWeek);
      parts.push(strings.onDayOfWeek(strings.dayNames[idx] ?? cron.dayOfWeek));
    } else if (cron.dayOfWeek === "1-5") {
      parts.push(strings.mondayToFriday);
    } else if (cron.dayOfWeek === "0,6") {
      parts.push(strings.saturdaysAndSundays);
    } else {
      parts.push(strings.weekdays(cron.dayOfWeek));
    }
  }

  return parts.join(" ") || strings.everyMinute;
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

export function calculateNextExecutions(
  expression: string,
  count: number = 5,
  timezone?: string,
  locale: Locale = "en"
): NextExecution[] {
  const validation = validateExpression(expression, locale);
  if (!validation.isValid) {
    return [];
  }

  const cron = parseExpression(expression, locale);
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
        formatted: timezone
          ? formatDateWithTimezone(current, timezone, locale)
          : formatDate(current, locale),
        relative: formatRelative(current, now, locale),
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

function formatDate(date: Date, locale: Locale = "en"): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString(t(locale).intlLocale, options);
}

function formatDateWithTimezone(date: Date, timezone: string, locale: Locale = "en"): string {
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
  return date.toLocaleDateString(t(locale).intlLocale, options);
}

function formatRelative(date: Date, now: Date, locale: Locale = "en"): string {
  const strings = t(locale);
  const diffMs = date.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 60) {
    return strings.inMinutes(diffMinutes);
  }

  if (diffHours < 24) {
    const mins = diffMinutes % 60;
    if (mins > 0) {
      return strings.inHoursAndMinutes(diffHours, mins);
    }
    return strings.inHours(diffHours);
  }

  if (diffDays < 7) {
    return strings.inDays(diffDays);
  }

  const diffWeeks = Math.floor(diffDays / 7);
  return strings.inWeeks(diffWeeks);
}

// --- Utility ---

export function isValidExpression(expression: string): boolean {
  return validateExpression(expression).isValid;
}
