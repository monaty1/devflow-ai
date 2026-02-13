import { describe, it, expect } from "vitest";
import {
  explainRegex,
  generateRegex,
  testRegex,
  isValidRegex,
  COMMON_PATTERNS,
} from "@/lib/application/regex-humanizer";

describe("Regex Humanizer", () => {
  describe("explainRegex", () => {
    it("should explain a simple email regex", () => {
      const result = explainRegex("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");

      expect(result.pattern).toBe("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");
      expect(result.explanation).toContain("Inicio de la línea");
      expect(result.explanation).toContain("@");
      expect(result.tokens.length).toBeGreaterThan(0);
    });

    it("should detect email as common pattern", () => {
      const emailPattern = COMMON_PATTERNS.find((p) => p.id === "email")!.pattern;
      const result = explainRegex(emailPattern);

      expect(result.commonPattern).toBe("Email");
    });

    it("should extract capture groups", () => {
      const result = explainRegex("(\\d{3})-(\\d{2})-(\\d{4})");

      expect(result.groups.length).toBe(3);
      expect(result.groups[0]!.index).toBe(1);
      expect(result.groups[1]!.index).toBe(2);
      expect(result.groups[2]!.index).toBe(3);
    });

    it("should handle regex with flags", () => {
      const result = explainRegex("/hello/gi");

      expect(result.pattern).toBe("hello");
      expect(result.flags).toBe("gi");
      expect(result.explanation).toContain("Global");
      expect(result.explanation).toContain("Insensible");
    });

    it("should explain anchors correctly", () => {
      const result = explainRegex("^start$");

      const anchorTokens = result.tokens.filter((t) => t.type === "anchor");
      expect(anchorTokens.length).toBe(2);
      expect(anchorTokens[0]!.description).toContain("Inicio");
      expect(anchorTokens[1]!.description).toContain("Final");
    });

    it("should explain quantifiers", () => {
      const result = explainRegex("a+b*c?d{2}e{1,3}");

      const quantifiers = result.tokens.filter((t) => t.type === "quantifier");
      expect(quantifiers.length).toBe(5);
    });

    it("should explain character classes", () => {
      const result = explainRegex("[a-zA-Z0-9]");

      const charClass = result.tokens.find((t) => t.type === "charClass");
      expect(charClass).toBeDefined();
      expect(charClass!.description).toContain("letras");
      expect(charClass!.description).toContain("dígitos");
    });

    it("should explain escape sequences", () => {
      const result = explainRegex("\\d\\w\\s");

      const escapes = result.tokens.filter((t) => t.type === "escape");
      expect(escapes.length).toBe(3);
      expect(escapes[0]!.description).toContain("dígito");
    });
  });

  describe("generateRegex", () => {
    it("should generate email regex from description", () => {
      const regex = generateRegex("email");

      expect(regex).toContain("@");
      expect(isValidRegex(regex)).toBe(true);
    });

    it("should generate phone regex for Spain", () => {
      const regex = generateRegex("teléfono español de 9 dígitos");

      expect(regex).toContain("[679]");
      expect(regex).toContain("8");
      expect(isValidRegex(regex)).toBe(true);
    });

    it("should generate date regex", () => {
      const regex = generateRegex("fecha ISO");

      expect(regex).toContain("\\d{4}");
      expect(regex).toContain("\\d{2}");
      expect(isValidRegex(regex)).toBe(true);
    });

    it("should generate digit pattern from description", () => {
      const regex = generateRegex("5 dígitos");

      expect(regex).toBe("^\\d{5}$");
      expect(isValidRegex(regex)).toBe(true);
    });

    it("should generate pattern with starting digits", () => {
      const regex = generateRegex("9 dígitos empezando por 6, 7 o 9");

      expect(isValidRegex(regex)).toBe(true);
      // Test that it matches Spanish phone numbers
      const testRegexResult = testRegex(regex, "612345678");
      expect(testRegexResult.matches).toBe(true);
    });

    it("should generate password regex", () => {
      const regex = generateRegex("contraseña segura");

      expect(regex).toContain("?=");
      expect(isValidRegex(regex)).toBe(true);
    });

    it("should generate DNI regex", () => {
      const regex = generateRegex("DNI español");

      expect(regex).toContain("\\d{8}");
      expect(regex).toContain("[A-Z]");
      expect(isValidRegex(regex)).toBe(true);
    });
  });

  describe("testRegex", () => {
    it("should return true for matching pattern", () => {
      const result = testRegex("^\\d{3}$", "123");

      expect(result.isValid).toBe(true);
      expect(result.matches).toBe(true);
      expect(result.allMatches.length).toBe(1);
      expect(result.allMatches[0]!.match).toBe("123");
    });

    it("should return false for non-matching pattern", () => {
      const result = testRegex("^\\d{3}$", "12");

      expect(result.isValid).toBe(true);
      expect(result.matches).toBe(false);
      expect(result.allMatches.length).toBe(0);
    });

    it("should find all matches with global flag", () => {
      const result = testRegex("\\d+", "abc123def456ghi789");

      expect(result.matches).toBe(true);
      expect(result.allMatches.length).toBe(3);
      expect(result.allMatches[0]!.match).toBe("123");
      expect(result.allMatches[1]!.match).toBe("456");
      expect(result.allMatches[2]!.match).toBe("789");
    });

    it("should extract capture groups", () => {
      const result = testRegex("(\\d{3})-(\\d{2})-(\\d{4})", "123-45-6789");

      expect(result.matches).toBe(true);
      expect(result.allMatches[0]!.groups["$1"]).toBe("123");
      expect(result.allMatches[0]!.groups["$2"]).toBe("45");
      expect(result.allMatches[0]!.groups["$3"]).toBe("6789");
    });

    it("should handle invalid regex gracefully", () => {
      const result = testRegex("[invalid", "test");

      expect(result.isValid).toBe(false);
      expect(result.matches).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it("should handle /pattern/flags format", () => {
      const result = testRegex("/hello/i", "HELLO world");

      expect(result.isValid).toBe(true);
      expect(result.matches).toBe(true);
    });

    it("should return match indices", () => {
      const result = testRegex("test", "this is a test string");

      expect(result.matches).toBe(true);
      expect(result.allMatches[0]!.index).toBe(10);
    });
  });

  describe("isValidRegex", () => {
    it("should return true for valid regex", () => {
      expect(isValidRegex("^[a-z]+$")).toBe(true);
      expect(isValidRegex("\\d{3}")).toBe(true);
      expect(isValidRegex("/test/gi")).toBe(true);
    });

    it("should return false for invalid regex", () => {
      expect(isValidRegex("[invalid")).toBe(false);
      expect(isValidRegex("(unclosed")).toBe(false);
      expect(isValidRegex("*invalid")).toBe(false);
    });
  });

  describe("COMMON_PATTERNS", () => {
    it("should have valid patterns", () => {
      for (const pattern of COMMON_PATTERNS) {
        expect(isValidRegex(pattern.pattern)).toBe(true);
      }
    });

    it("should have examples that match", () => {
      for (const pattern of COMMON_PATTERNS) {
        for (const example of pattern.examples) {
          const result = testRegex(pattern.pattern, example);
          expect(result.matches).toBe(true);
        }
      }
    });
  });

  describe("generateRegex - letter patterns", () => {
    it("should generate uppercase letter pattern", () => {
      const result = generateRegex("solo letras mayúsculas");
      expect(result).toBe("^[A-Z]+$");
    });

    it("should generate lowercase letter pattern", () => {
      const result = generateRegex("solo letras minúsculas");
      expect(result).toBe("^[a-z]+$");
    });

    it("should generate generic letter pattern", () => {
      const result = generateRegex("solo letras");
      expect(result).toBe("^[a-zA-Z]+$");
    });

    it("should generate alphanumeric pattern", () => {
      const result = generateRegex("alfanumérico");
      expect(result).toBe("^[a-zA-Z0-9]+$");
    });

    it("should generate default pattern for unknown description", () => {
      const result = generateRegex("something completely unknown xyz");
      expect(result).toBe("^.*$");
    });

    it("should generate digits pattern", () => {
      const result = generateRegex("5 dígitos");
      expect(result).toContain("\\d{5}");
    });

    it("should handle digits starting with specific numbers", () => {
      const result = generateRegex("4 dígitos empezando por 6,9");
      expect(result).toContain("[69]");
    });
  });

  describe("generateRegex - generateFromDescription branches", () => {
    it("should return Spanish phone pattern for description with teléfono AND español", () => {
      const regex = generateRegex("teléfono español");
      const phoneEs = COMMON_PATTERNS.find((p) => p.id === "phone-es")!.pattern;
      expect(regex).toBe(phoneEs);
      expect(isValidRegex(regex)).toBe(true);
    });

    it("should return generic phone pattern for description with teléfono without español", () => {
      // Use a description that contains "teléfono" but NOT "español", "espanol", or "es"
      const regex = generateRegex("validar teléfono global");
      expect(regex).toBe("^\\+?[\\d\\s\\-\\(\\)]+$");
      expect(isValidRegex(regex)).toBe(true);
    });

    it("should return ISO date pattern for 'fecha iso'", () => {
      const regex = generateRegex("fecha iso");
      const dateIso = COMMON_PATTERNS.find((p) => p.id === "date-iso")!.pattern;
      expect(regex).toBe(dateIso);
      expect(isValidRegex(regex)).toBe(true);
    });

    it("should return dd/mm/yyyy pattern for 'fecha dd/mm'", () => {
      const regex = generateRegex("fecha dd/mm");
      expect(regex).toBe("^\\d{2}/\\d{2}/\\d{4}$");
      expect(isValidRegex(regex)).toBe(true);
    });

    it("should default to ISO date pattern for 'fecha' alone", () => {
      const regex = generateRegex("fecha");
      const dateIso = COMMON_PATTERNS.find((p) => p.id === "date-iso")!.pattern;
      expect(regex).toBe(dateIso);
      expect(isValidRegex(regex)).toBe(true);
    });

    it("should return IPv4 pattern for 'ip' description", () => {
      const regex = generateRegex("ip");
      const ipv4 = COMMON_PATTERNS.find((p) => p.id === "ipv4")!.pattern;
      expect(regex).toBe(ipv4);
      expect(isValidRegex(regex)).toBe(true);
    });

    it("should return IPv4 pattern for 'ipv4' description", () => {
      const regex = generateRegex("dirección ipv4");
      const ipv4 = COMMON_PATTERNS.find((p) => p.id === "ipv4")!.pattern;
      expect(regex).toBe(ipv4);
      expect(isValidRegex(regex)).toBe(true);
    });

    it("should return password pattern for 'contraseña' description", () => {
      const regex = generateRegex("contraseña");
      const password = COMMON_PATTERNS.find((p) => p.id === "password")!.pattern;
      expect(regex).toBe(password);
      expect(isValidRegex(regex)).toBe(true);
    });

    it("should return password pattern for 'password' description", () => {
      const regex = generateRegex("validar password");
      const password = COMMON_PATTERNS.find((p) => p.id === "password")!.pattern;
      expect(regex).toBe(password);
      expect(isValidRegex(regex)).toBe(true);
    });

    it("should return DNI pattern for 'dni' description", () => {
      const regex = generateRegex("dni");
      const dni = COMMON_PATTERNS.find((p) => p.id === "dni-es")!.pattern;
      expect(regex).toBe(dni);
      expect(isValidRegex(regex)).toBe(true);
    });

    it("should return DNI pattern for 'nif' description", () => {
      const regex = generateRegex("validar nif");
      const dni = COMMON_PATTERNS.find((p) => p.id === "dni-es")!.pattern;
      expect(regex).toBe(dni);
      expect(isValidRegex(regex)).toBe(true);
    });

    it("should return hex color pattern for 'color' description", () => {
      const regex = generateRegex("color");
      const hexColor = COMMON_PATTERNS.find((p) => p.id === "hex-color")!.pattern;
      expect(regex).toBe(hexColor);
      expect(isValidRegex(regex)).toBe(true);
    });

    it("should return hex color pattern for 'hex' description", () => {
      const regex = generateRegex("validar hex");
      const hexColor = COMMON_PATTERNS.find((p) => p.id === "hex-color")!.pattern;
      expect(regex).toBe(hexColor);
      expect(isValidRegex(regex)).toBe(true);
    });

    it("should generate digit pattern with starting digit like '10 dígitos empezando por 6'", () => {
      const regex = generateRegex("10 dígitos empezando por 6");
      expect(regex).toBe("^[6]\\d{9}$");
      expect(isValidRegex(regex)).toBe(true);
      const result = testRegex(regex, "6123456789");
      expect(result.matches).toBe(true);
    });

    it("should return URL pattern for 'enlace' description", () => {
      const regex = generateRegex("enlace web");
      const url = COMMON_PATTERNS.find((p) => p.id === "url")!.pattern;
      expect(regex).toBe(url);
      expect(isValidRegex(regex)).toBe(true);
    });

    it("should return email pattern for 'correo' description", () => {
      const regex = generateRegex("correo electrónico");
      const email = COMMON_PATTERNS.find((p) => p.id === "email")!.pattern;
      expect(regex).toBe(email);
      expect(isValidRegex(regex)).toBe(true);
    });

    it("should return dd/mm pattern for 'fecha día/mes'", () => {
      const regex = generateRegex("fecha día/mes");
      expect(regex).toBe("^\\d{2}/\\d{2}/\\d{4}$");
      expect(isValidRegex(regex)).toBe(true);
    });

    it("should generate alphanumeric for 'alfanumerico' (no accent)", () => {
      const regex = generateRegex("alfanumerico");
      expect(regex).toBe("^[a-zA-Z0-9]+$");
    });

    it("should generate lowercase for 'minuscula' (no accent)", () => {
      const regex = generateRegex("letras minuscula");
      expect(regex).toBe("^[a-z]+$");
    });

    it("should generate uppercase for 'mayuscula' (no accent)", () => {
      const regex = generateRegex("letras mayuscula");
      expect(regex).toBe("^[A-Z]+$");
    });
  });

  describe("testRegex - advanced matching", () => {
    it("should handle /pattern/flags format", () => {
      const result = testRegex("/hello/i", "Hello World");
      expect(result.isValid).toBe(true);
      expect(result.matches).toBe(true);
    });

    it("should extract named groups", () => {
      const result = testRegex("(?<year>\\d{4})-(?<month>\\d{2})", "2024-01");
      expect(result.isValid).toBe(true);
      expect(result.matches).toBe(true);
      expect(result.allMatches[0]!.groups["year"]).toBe("2024");
      expect(result.allMatches[0]!.groups["month"]).toBe("01");
    });

    it("should extract numbered groups", () => {
      const result = testRegex("(\\d+)-(\\d+)", "123-456");
      expect(result.isValid).toBe(true);
      expect(result.allMatches[0]!.groups["$1"]).toBe("123");
      expect(result.allMatches[0]!.groups["$2"]).toBe("456");
    });

    it("should prevent infinite loops with zero-length matches", () => {
      const result = testRegex("a*", "bbb");
      expect(result.isValid).toBe(true);
      // Zero-length matches at each position should not cause infinite loop
      expect(result.allMatches.length).toBeGreaterThan(0);
    });

    it("should handle /pattern/ with no extra flags", () => {
      const result = testRegex("/test/", "test string test");
      expect(result.isValid).toBe(true);
      expect(result.matches).toBe(true);
      // Should add 'g' flag automatically
      expect(result.allMatches.length).toBeGreaterThanOrEqual(1);
    });

    it("should return error for invalid regex", () => {
      const result = testRegex("[invalid", "test");
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });
});
