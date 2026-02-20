import { describe, it, expect, vi } from "vitest";
import {
  parseExpression,
  buildExpression,
  validateExpression,
  explainExpression,
  calculateNextExecutions,
  isValidExpression,
  generateConfig,
  CRON_PRESETS,
  getCronPresets,
} from "@/lib/application/cron-builder";

describe("Cron Builder", () => {
  describe("parseExpression", () => {
    it("should parse a standard cron expression", () => {
      const result = parseExpression("0 12 * * *");

      expect(result.minute).toBe("0");
      expect(result.hour).toBe("12");
      expect(result.dayOfMonth).toBe("*");
      expect(result.month).toBe("*");
      expect(result.dayOfWeek).toBe("*");
    });

    it("should parse expression with step values", () => {
      const result = parseExpression("*/5 * * * *");

      expect(result.minute).toBe("*/5");
    });

    it("should parse expression with ranges", () => {
      const result = parseExpression("0 9-17 * * *");

      expect(result.hour).toBe("9-17");
    });

    it("should parse expression with lists", () => {
      const result = parseExpression("0 0 * * 1,3,5");

      expect(result.dayOfWeek).toBe("1,3,5");
    });

    it("should throw error for invalid expression format (en)", () => {
      expect(() => parseExpression("0 12 *")).toThrow("5 fields");
      expect(() => parseExpression("0 12 * * * *")).toThrow("5 fields");
    });

    it("should throw error for invalid expression format (es)", () => {
      expect(() => parseExpression("0 12 *", "es")).toThrow("5 campos");
      expect(() => parseExpression("0 12 * * * *", "es")).toThrow("5 campos");
    });

    it("should handle extra whitespace", () => {
      const result = parseExpression("  0   12   *   *   *  ");

      expect(result.minute).toBe("0");
      expect(result.hour).toBe("12");
    });
  });

  describe("buildExpression", () => {
    it("should build expression from parts", () => {
      const result = buildExpression({
        minute: "30",
        hour: "8",
        dayOfMonth: "*",
        month: "*",
        dayOfWeek: "1-5",
      });

      expect(result).toBe("30 8 * * 1-5");
    });

    it("should handle all wildcards", () => {
      const result = buildExpression({
        minute: "*",
        hour: "*",
        dayOfMonth: "*",
        month: "*",
        dayOfWeek: "*",
      });

      expect(result).toBe("* * * * *");
    });
  });

  describe("validateExpression", () => {
    it("should validate correct expression", () => {
      const result = validateExpression("0 12 * * *");

      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it("should reject minute out of range", () => {
      const result = validateExpression("60 12 * * *");

      expect(result.isValid).toBe(false);
      expect(result.errors[0]!.field).toBe("minute");
    });

    it("should reject hour out of range", () => {
      const result = validateExpression("0 25 * * *");

      expect(result.isValid).toBe(false);
      expect(result.errors[0]!.field).toBe("hour");
    });

    it("should reject day of month out of range", () => {
      const result = validateExpression("0 0 32 * *");

      expect(result.isValid).toBe(false);
      expect(result.errors[0]!.field).toBe("dayOfMonth");
    });

    it("should reject month out of range", () => {
      const result = validateExpression("0 0 * 13 *");

      expect(result.isValid).toBe(false);
      expect(result.errors[0]!.field).toBe("month");
    });

    it("should reject day of week out of range", () => {
      const result = validateExpression("0 0 * * 7");

      expect(result.isValid).toBe(false);
      expect(result.errors[0]!.field).toBe("dayOfWeek");
    });

    it("should validate step values", () => {
      expect(validateExpression("*/5 * * * *").isValid).toBe(true);
      expect(validateExpression("0/10 * * * *").isValid).toBe(true);
    });

    it("should validate ranges", () => {
      expect(validateExpression("0 9-17 * * *").isValid).toBe(true);
      expect(validateExpression("0 17-9 * * *").isValid).toBe(false); // Invalid range
    });

    it("should validate lists", () => {
      expect(validateExpression("0 0 * * 1,3,5").isValid).toBe(true);
      expect(validateExpression("0,15,30,45 * * * *").isValid).toBe(true);
    });

    it("should validate complex expressions", () => {
      expect(validateExpression("0 9-17 * * 1-5").isValid).toBe(true);
      expect(validateExpression("*/15 8-18 1,15 * *").isValid).toBe(true);
    });

    it("should produce English error messages by default", () => {
      const result = validateExpression("60 12 * * *");
      expect(result.errors[0]!.message).toContain("out of range");
    });

    it("should produce Spanish error messages with es locale", () => {
      const result = validateExpression("60 12 * * *", "es");
      expect(result.errors[0]!.message).toContain("fuera de rango");
    });
  });

  describe("explainExpression", () => {
    it("should explain every minute (en)", () => {
      const result = explainExpression("* * * * *");

      expect(result.humanReadable).toContain("Every minute");
    });

    it("should explain every minute (es)", () => {
      const result = explainExpression("* * * * *", "es");

      expect(result.humanReadable).toContain("Cada minuto");
    });

    it("should explain daily at specific time", () => {
      const result = explainExpression("0 12 * * *");

      expect(result.humanReadable).toContain("12:00");
    });

    it("should explain step values (en)", () => {
      const result = explainExpression("*/5 * * * *");

      expect(result.humanReadable).toContain("5 minutes");
    });

    it("should explain step values (es)", () => {
      const result = explainExpression("*/5 * * * *", "es");

      expect(result.humanReadable).toContain("5 minutos");
    });

    it("should explain weekdays (en)", () => {
      const result = explainExpression("0 9 * * 1-5");

      expect(result.humanReadable).toContain("Monday to Friday");
    });

    it("should explain weekdays (es)", () => {
      const result = explainExpression("0 9 * * 1-5", "es");

      expect(result.humanReadable).toContain("lunes a viernes");
    });

    it("should provide field details", () => {
      const result = explainExpression("30 8 * * *");

      expect(result.details.length).toBe(5);
      expect(result.details[0]!.field).toBe("minute");
      expect(result.details[0]!.value).toBe("30");
    });

    it("should handle invalid expression (en)", () => {
      const result = explainExpression("invalid");

      expect(result.summary).toContain("Invalid expression");
    });

    it("should handle invalid expression (es)", () => {
      const result = explainExpression("invalid", "es");

      expect(result.summary).toContain("Expresión inválida");
    });
  });

  describe("calculateNextExecutions", () => {
    it("should return requested number of executions", () => {
      const result = calculateNextExecutions("* * * * *", 5);

      expect(result.length).toBe(5);
    });

    it("should return empty array for invalid expression", () => {
      const result = calculateNextExecutions("invalid", 5);

      expect(result.length).toBe(0);
    });

    it("should calculate correct times for every minute", () => {
      const result = calculateNextExecutions("* * * * *", 3);

      expect(result.length).toBe(3);
      // Each execution should be 1 minute apart
      const diff1 = result[1]!.date.getTime() - result[0]!.date.getTime();
      const diff2 = result[2]!.date.getTime() - result[1]!.date.getTime();
      expect(diff1).toBe(60000); // 1 minute in ms
      expect(diff2).toBe(60000);
    });

    it("should include formatted date", () => {
      const result = calculateNextExecutions("0 12 * * *", 1);

      expect(result[0]!.formatted).toBeTruthy();
      expect(result[0]!.formatted.length).toBeGreaterThan(0);
    });

    it("should include relative time (en)", () => {
      const result = calculateNextExecutions("* * * * *", 1);

      expect(result[0]!.relative).toContain("in");
    });

    it("should include relative time (es)", () => {
      const result = calculateNextExecutions("* * * * *", 1, undefined, "es");

      expect(result[0]!.relative).toContain("en");
    });
  });

  describe("isValidExpression", () => {
    it("should return true for valid expressions", () => {
      expect(isValidExpression("0 12 * * *")).toBe(true);
      expect(isValidExpression("*/5 * * * *")).toBe(true);
      expect(isValidExpression("0 9-17 * * 1-5")).toBe(true);
    });

    it("should return false for invalid expressions", () => {
      expect(isValidExpression("invalid")).toBe(false);
      expect(isValidExpression("60 12 * * *")).toBe(false);
      expect(isValidExpression("0 25 * * *")).toBe(false);
    });
  });

  describe("CRON_PRESETS", () => {
    it("should have valid expressions for all presets", () => {
      for (const preset of CRON_PRESETS) {
        expect(isValidExpression(preset.expression)).toBe(true);
      }
    });

    it("should have required fields for all presets", () => {
      for (const preset of CRON_PRESETS) {
        expect(preset.id).toBeTruthy();
        expect(preset.name).toBeTruthy();
        expect(preset.description).toBeTruthy();
        expect(preset.expression).toBeTruthy();
      }
    });

    it("should include common presets", () => {
      const ids = CRON_PRESETS.map((p) => p.id);

      expect(ids).toContain("every-minute");
      expect(ids).toContain("hourly");
      expect(ids).toContain("daily-midnight");
      expect(ids).toContain("weekly-monday");
      expect(ids).toContain("monthly");
    });
  });

  describe("getCronPresets (locale-aware)", () => {
    it("should return English preset names by default", () => {
      const presets = getCronPresets();
      const first = presets.find((p) => p.id === "every-minute");
      expect(first?.name).toBe("Every minute");
      expect(first?.description).toBe("Runs every minute");
    });

    it("should return English preset names for en locale", () => {
      const presets = getCronPresets("en");
      const hourly = presets.find((p) => p.id === "hourly");
      expect(hourly?.name).toBe("Hourly");
      expect(hourly?.description).toContain("start of every hour");
    });

    it("should return Spanish preset names for es locale", () => {
      const presets = getCronPresets("es");
      const first = presets.find((p) => p.id === "every-minute");
      expect(first?.name).toBe("Cada minuto");
      expect(first?.description).toBe("Se ejecuta cada minuto");
    });

    it("should have same number of presets for both locales", () => {
      expect(getCronPresets("en").length).toBe(getCronPresets("es").length);
    });

    it("should have valid expressions for all locale presets", () => {
      for (const preset of getCronPresets("es")) {
        expect(isValidExpression(preset.expression)).toBe(true);
      }
    });
  });

  describe("generateConfig", () => {
    it("should generate linux-crontab config", () => {
      const config = generateConfig("0 12 * * *", "linux-crontab");
      expect(config.format).toBe("linux-crontab");
      expect(config.language).toBe("bash");
      expect(config.code).toContain("0 12 * * *");
    });

    it("should generate kubernetes config", () => {
      const config = generateConfig("*/5 * * * *", "kubernetes");
      expect(config.format).toBe("kubernetes");
      expect(config.language).toBe("yaml");
      expect(config.code).toContain("*/5 * * * *");
    });

    it("should generate github-actions config", () => {
      const config = generateConfig("0 0 * * *", "github-actions");
      expect(config.format).toBe("github-actions");
      expect(config.language).toBe("yaml");
      expect(config.code).toContain("0 0 * * *");
    });

    it("should generate aws-eventbridge config", () => {
      const config = generateConfig("0 12 * * *", "aws-eventbridge");
      expect(config.format).toBe("aws-eventbridge");
      expect(config.language).toBe("json");
      expect(config.code).toContain("ScheduleExpression");
    });
  });

  describe("calculateNextExecutions with timezone", () => {
    it("should return executions with timezone", () => {
      const executions = calculateNextExecutions("* * * * *", 3, "UTC");
      expect(executions.length).toBe(3);
    });

    it("should format dates with timezone info", () => {
      const executions = calculateNextExecutions("* * * * *", 1, "America/New_York");
      expect(executions[0]!.formatted).toBeTruthy();
    });

    it("should return empty for invalid expression with timezone", () => {
      const executions = calculateNextExecutions("invalid", 3, "UTC");
      expect(executions.length).toBe(0);
    });
  });

  describe("formatRelative exact-hours branch", () => {
    it("should format exact whole hours (en)", () => {
      vi.useFakeTimers();
      const now = new Date("2025-06-01T10:00:00Z");
      vi.setSystemTime(now);
      const targetHour = (now.getHours() + 2) % 24;
      const executions = calculateNextExecutions(`0 ${targetHour} * * *`, 1);
      expect(executions.length).toBe(1);
      expect(executions[0]!.relative).toContain("in 2 hour");
      vi.useRealTimers();
    });

    it("should format exact whole hours (es)", () => {
      vi.useFakeTimers();
      const now = new Date("2025-06-01T10:00:00Z");
      vi.setSystemTime(now);
      const targetHour = (now.getHours() + 2) % 24;
      const executions = calculateNextExecutions(`0 ${targetHour} * * *`, 1, undefined, "es");
      expect(executions.length).toBe(1);
      expect(executions[0]!.relative).toContain("en 2 horas");
      vi.useRealTimers();
    });

    it("should use singular hour for exactly 1 hour (en)", () => {
      vi.useFakeTimers();
      const now = new Date("2025-06-01T10:00:00Z");
      vi.setSystemTime(now);
      const targetHour = (now.getHours() + 1) % 24;
      const executions = calculateNextExecutions(`0 ${targetHour} * * *`, 1);
      expect(executions[0]!.relative).toBe("in 1 hour");
      vi.useRealTimers();
    });

    it("should use singular hora for exactly 1 hour (es)", () => {
      vi.useFakeTimers();
      const now = new Date("2025-06-01T10:00:00Z");
      vi.setSystemTime(now);
      const targetHour = (now.getHours() + 1) % 24;
      const executions = calculateNextExecutions(`0 ${targetHour} * * *`, 1, undefined, "es");
      expect(executions[0]!.relative).toBe("en 1 hora");
      vi.useRealTimers();
    });
  });

  describe("Edge cases", () => {
    it("should handle complex list with ranges", () => {
      const result = validateExpression("0 0 1-15,20-25 * *");
      expect(result.isValid).toBe(true);
    });

    it("should handle step with range base", () => {
      const result = validateExpression("0 8-18/2 * * *");
      // This is a valid cron pattern: every 2 hours from 8 to 18
      expect(result.isValid).toBe(true);
    });

    it("should handle weekends preset", () => {
      const result = validateExpression("0 10 * * 0,6");
      expect(result.isValid).toBe(true);
    });
  });

  describe("buildHumanReadable (via explainExpression) — en", () => {
    it("should explain specific dayOfMonth", () => {
      const result = explainExpression("0 12 15 * *");
      expect(result.humanReadable).toContain("day 15");
    });

    it("should explain non-specific dayOfMonth pattern", () => {
      const result = explainExpression("0 12 1-15 * *");
      expect(result.humanReadable).toContain("days 1-15");
    });

    it("should explain specific month number", () => {
      const result = explainExpression("0 12 1 6 *");
      expect(result.humanReadable).toContain("in ");
    });

    it("should explain non-specific month pattern", () => {
      const result = explainExpression("0 12 1 1-6 *");
      expect(result.humanReadable).toContain("months 1-6");
    });

    it("should explain specific weekday number", () => {
      const result = explainExpression("0 12 * * 1");
      expect(result.humanReadable).toContain("on ");
    });

    it("should explain weekdays 1-5", () => {
      const result = explainExpression("0 12 * * 1-5");
      expect(result.humanReadable).toContain("Monday to Friday");
    });

    it("should explain weekends 0,6", () => {
      const result = explainExpression("0 12 * * 0,6");
      expect(result.humanReadable).toContain("Saturdays and Sundays");
    });

    it("should explain non-specific weekday pattern", () => {
      const result = explainExpression("0 12 * * 2-4");
      expect(result.humanReadable).toContain("weekdays 2-4");
    });

    it("should explain minute with hour range", () => {
      const result = explainExpression("30 8-18 * * *");
      expect(result.humanReadable).toContain("minute 30");
      expect(result.humanReadable).toContain("8");
    });

    it("should explain each minute (wildcard minute and hour)", () => {
      const result = explainExpression("* * * * *");
      expect(result.humanReadable).toContain("Every minute");
    });

    it("should explain minute at specific hour (single minute, single hour)", () => {
      const result = explainExpression("30 14 * * *");
      expect(result.humanReadable).toContain("14:30");
    });

    it("should explain step minutes", () => {
      const result = explainExpression("*/15 * * * *");
      expect(result.humanReadable).toContain("Every 15 minutes");
    });

    it("should explain single minute every hour", () => {
      const result = explainExpression("30 * * * *");
      expect(result.humanReadable).toContain("minute 30");
      expect(result.humanReadable).toContain("every hour");
    });
  });

  describe("buildHumanReadable (via explainExpression) — es", () => {
    it("should explain specific dayOfMonth (es)", () => {
      const result = explainExpression("0 12 15 * *", "es");
      expect(result.humanReadable).toContain("día 15");
    });

    it("should explain non-specific dayOfMonth pattern (es)", () => {
      const result = explainExpression("0 12 1-15 * *", "es");
      expect(result.humanReadable).toContain("días 1-15");
    });

    it("should explain non-specific month pattern (es)", () => {
      const result = explainExpression("0 12 1 1-6 *", "es");
      expect(result.humanReadable).toContain("meses 1-6");
    });

    it("should explain weekdays 1-5 (es)", () => {
      const result = explainExpression("0 12 * * 1-5", "es");
      expect(result.humanReadable).toContain("de lunes a viernes");
    });

    it("should explain weekends 0,6 (es)", () => {
      const result = explainExpression("0 12 * * 0,6", "es");
      expect(result.humanReadable).toContain("sábados y domingos");
    });

    it("should explain non-specific weekday pattern (es)", () => {
      const result = explainExpression("0 12 * * 2-4", "es");
      expect(result.humanReadable).toContain("días de semana 2-4");
    });

    it("should explain each minute (es)", () => {
      const result = explainExpression("* * * * *", "es");
      expect(result.humanReadable).toContain("Cada minuto");
    });

    it("should explain step minutes (es)", () => {
      const result = explainExpression("*/15 * * * *", "es");
      expect(result.humanReadable).toContain("Cada 15 minutos");
    });

    it("should explain single minute every hour (es)", () => {
      const result = explainExpression("30 * * * *", "es");
      expect(result.humanReadable).toContain("minuto 30");
      expect(result.humanReadable).toContain("cada hora");
    });
  });

  describe("matchesField branches (via calculateNextExecutions)", () => {
    it("should match range pattern (e.g. hours 8-18)", () => {
      const executions = calculateNextExecutions("0 8-18 * * *", 3);
      expect(executions.length).toBeGreaterThan(0);
      for (const exec of executions) {
        const hour = exec.date.getHours();
        expect(hour).toBeGreaterThanOrEqual(8);
        expect(hour).toBeLessThanOrEqual(18);
      }
    });

    it("should match list pattern with range (e.g. 1-5,10)", () => {
      const executions = calculateNextExecutions("0 0 1-5,10 * *", 3);
      expect(executions.length).toBeGreaterThan(0);
      for (const exec of executions) {
        const day = exec.date.getDate();
        expect(day === 10 || (day >= 1 && day <= 5)).toBe(true);
      }
    });

    it("should match list pattern (e.g. 1,15)", () => {
      const executions = calculateNextExecutions("0 0 1,15 * *", 2);
      expect(executions.length).toBeGreaterThan(0);
      for (const exec of executions) {
        const day = exec.date.getDate();
        expect([1, 15]).toContain(day);
      }
    });

    it("should match step pattern (e.g. */5 minutes)", () => {
      const executions = calculateNextExecutions("*/5 * * * *", 3);
      expect(executions.length).toBeGreaterThan(0);
      for (const exec of executions) {
        expect(exec.date.getMinutes() % 5).toBe(0);
      }
    });

    it("should match specific single value", () => {
      const executions = calculateNextExecutions("30 12 * * *", 2);
      expect(executions.length).toBeGreaterThan(0);
      for (const exec of executions) {
        expect(exec.date.getMinutes()).toBe(30);
        expect(exec.date.getHours()).toBe(12);
      }
    });
  });

  describe("explainExpression – uncovered branches (en)", () => {
    it("should explain cron with step value */5 mentioning 'Every 5 minutes'", () => {
      const result = explainExpression("*/5 * * * *");

      expect(result.humanReadable).toContain("Every 5 minutes");
      const minuteDetail = result.details.find((d) => d.field === "minute");
      expect(minuteDetail).toBeDefined();
      expect(minuteDetail!.explanation).toContain("Every 5 minutes");
    });

    it("should explain cron with step on non-star base 10/5 mentioning 'starting at 10'", () => {
      const result = explainExpression("10/5 * * * *");

      const minuteDetail = result.details.find((d) => d.field === "minute");
      expect(minuteDetail).toBeDefined();
      expect(minuteDetail!.explanation).toContain("Every 5");
      expect(minuteDetail!.explanation).toContain("starting at 10");
    });

    it("should explain range value 1-5 in minute field with 'From 1 to 5'", () => {
      const result = explainExpression("1-5 * * * *");

      const minuteDetail = result.details.find((d) => d.field === "minute");
      expect(minuteDetail).toBeDefined();
      expect(minuteDetail!.explanation).toContain("From 1 to 5");
    });

    it("should explain comma-separated with range '1,3-5' formatting both items", () => {
      const result = explainExpression("1,3-5 * * * *");

      const minuteDetail = result.details.find((d) => d.field === "minute");
      expect(minuteDetail).toBeDefined();
      expect(minuteDetail!.explanation).toContain("1");
      expect(minuteDetail!.explanation).toContain("3");
      expect(minuteDetail!.explanation).toContain("5");
    });

    it("should explain specific minute + wildcard hour '30 * * * *' as 'At minute 30 of every hour'", () => {
      const result = explainExpression("30 * * * *");

      expect(result.humanReadable).toContain("At minute 30 of every hour");
    });

    it("should explain specific minute + hour range '0 9-17 * * *' mentioning the range", () => {
      const result = explainExpression("0 9-17 * * *");

      expect(result.humanReadable).toContain("minute 00");
      expect(result.humanReadable).toContain("9:00");
      expect(result.humanReadable).toContain("17:00");
    });

    it("should explain day of month as number '0 0 15 * *' with 'on day 15'", () => {
      const result = explainExpression("0 0 15 * *");

      expect(result.humanReadable).toContain("on day 15");
    });

    it("should explain day of month as pattern '0 0 1,15 * *' with 'days 1,15'", () => {
      const result = explainExpression("0 0 1,15 * *");

      expect(result.humanReadable).toContain("days 1,15");
    });

    it("should handle else branch for non-star minute and hour like '1-5 2-4 * * *'", () => {
      const result = explainExpression("1-5 2-4 * * *");

      expect(result.humanReadable).toContain("minute 1-5");
      expect(result.humanReadable).toContain("hour 2-4");
    });
  });

  describe("explainExpression – uncovered branches (es)", () => {
    it("should explain cron with step value */5 in Spanish", () => {
      const result = explainExpression("*/5 * * * *", "es");

      expect(result.humanReadable).toContain("Cada 5 minutos");
      const minuteDetail = result.details.find((d) => d.field === "minute");
      expect(minuteDetail).toBeDefined();
      expect(minuteDetail!.explanation).toContain("Cada 5 minutos");
    });

    it("should explain cron with step on non-star base 10/5 in Spanish", () => {
      const result = explainExpression("10/5 * * * *", "es");

      const minuteDetail = result.details.find((d) => d.field === "minute");
      expect(minuteDetail).toBeDefined();
      expect(minuteDetail!.explanation).toContain("Cada 5");
      expect(minuteDetail!.explanation).toContain("empezando en 10");
    });

    it("should explain range value 1-5 in minute field in Spanish", () => {
      const result = explainExpression("1-5 * * * *", "es");

      const minuteDetail = result.details.find((d) => d.field === "minute");
      expect(minuteDetail).toBeDefined();
      expect(minuteDetail!.explanation).toContain("Del 1 al 5");
    });

    it("should explain specific minute + wildcard hour in Spanish", () => {
      const result = explainExpression("30 * * * *", "es");

      expect(result.humanReadable).toContain("En el minuto 30 de cada hora");
    });

    it("should explain specific minute + hour range in Spanish", () => {
      const result = explainExpression("0 9-17 * * *", "es");

      expect(result.humanReadable).toContain("minuto 00");
      expect(result.humanReadable).toContain("9:00");
      expect(result.humanReadable).toContain("17:00");
    });

    it("should explain day of month as number in Spanish", () => {
      const result = explainExpression("0 0 15 * *", "es");

      expect(result.humanReadable).toContain("el día 15");
    });

    it("should explain day of month as pattern in Spanish", () => {
      const result = explainExpression("0 0 1,15 * *", "es");

      expect(result.humanReadable).toContain("días 1,15");
    });

    it("should handle else branch for non-star minute and hour in Spanish", () => {
      const result = explainExpression("1-5 2-4 * * *", "es");

      expect(result.humanReadable).toContain("minuto 1-5");
      expect(result.humanReadable).toContain("hora 2-4");
    });
  });

  describe("formatRelative branches (via calculateNextExecutions)", () => {
    it("should produce relative strings for next executions (en)", () => {
      const executions = calculateNextExecutions("* * * * *", 1);
      expect(executions.length).toBe(1);
      expect(executions[0]!.relative).toContain("in ");
    });

    it("should produce relative strings for next executions (es)", () => {
      const executions = calculateNextExecutions("* * * * *", 1, undefined, "es");
      expect(executions.length).toBe(1);
      expect(executions[0]!.relative).toContain("en ");
    });

    it("should handle execution within minutes (en)", () => {
      const executions = calculateNextExecutions("* * * * *", 1);
      expect(executions[0]!.relative).toMatch(/in \d+ minute/);
    });

    it("should handle execution within minutes (es)", () => {
      const executions = calculateNextExecutions("* * * * *", 1, undefined, "es");
      expect(executions[0]!.relative).toMatch(/en \d+ minuto/);
    });

    it("should handle execution in hours", () => {
      const executions = calculateNextExecutions("0 0 * * *", 1);
      expect(executions[0]!.relative).toMatch(/in \d/);
    });

    it("should handle execution days away", () => {
      // Yearly cron - next execution could be days/weeks away
      const executions = calculateNextExecutions("0 0 1 1 *", 1);
      expect(executions.length).toBe(1);
      expect(executions[0]!.relative).toContain("in ");
    });
  });
});
