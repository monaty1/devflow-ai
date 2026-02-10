// Cron Job Builder Types
// Visual constructor for cron expressions

export interface CronExpression {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

export interface CronPreset {
  id: string;
  name: string;
  description: string;
  expression: string;
  icon: string;
}

export interface CronExplanation {
  summary: string;
  details: CronFieldExplanation[];
  humanReadable: string;
}

export interface CronFieldExplanation {
  field: CronField;
  value: string;
  explanation: string;
}

export type CronField = "minute" | "hour" | "dayOfMonth" | "month" | "dayOfWeek";

export interface NextExecution {
  date: Date;
  formatted: string;
  relative: string;
}

export interface CronValidation {
  isValid: boolean;
  errors: CronFieldError[];
}

export interface CronFieldError {
  field: CronField;
  message: string;
}

export interface CronBuilderState {
  expression: CronExpression;
  rawExpression: string;
  explanation: CronExplanation | null;
  nextExecutions: NextExecution[];
  validation: CronValidation;
}

// Field constraints
export const CRON_FIELD_RANGES: Record<CronField, { min: number; max: number; names?: string[] }> = {
  minute: { min: 0, max: 59 },
  hour: { min: 0, max: 23 },
  dayOfMonth: { min: 1, max: 31 },
  month: {
    min: 1,
    max: 12,
    names: ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"]
  },
  dayOfWeek: {
    min: 0,
    max: 6,
    names: ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"]
  },
};

export const CRON_FIELD_LABELS: Record<CronField, string> = {
  minute: "Minuto",
  hour: "Hora",
  dayOfMonth: "Día del mes",
  month: "Mes",
  dayOfWeek: "Día de la semana",
};

export const DEFAULT_CRON: CronExpression = {
  minute: "0",
  hour: "*",
  dayOfMonth: "*",
  month: "*",
  dayOfWeek: "*",
};
