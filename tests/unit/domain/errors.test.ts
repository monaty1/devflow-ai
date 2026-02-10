import { describe, it, expect } from "vitest";
import { DomainError, ValidationError, NotFoundError, ConflictError } from "@/domain/errors";

describe("Domain Errors", () => {
  describe("DomainError", () => {
    it("should create error with message", () => {
      const error = new DomainError("Something went wrong");

      expect(error.message).toBe("Something went wrong");
      expect(error.name).toBe("DomainError");
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("ValidationError", () => {
    it("should extend DomainError", () => {
      const error = new ValidationError("Invalid input");

      expect(error.message).toBe("Invalid input");
      expect(error.name).toBe("ValidationError");
      expect(error).toBeInstanceOf(DomainError);
    });
  });

  describe("NotFoundError", () => {
    it("should extend DomainError", () => {
      const error = new NotFoundError("Entity not found");

      expect(error.message).toBe("Entity not found");
      expect(error.name).toBe("NotFoundError");
      expect(error).toBeInstanceOf(DomainError);
    });
  });

  describe("ConflictError", () => {
    it("should extend DomainError", () => {
      const error = new ConflictError("Entity already exists");

      expect(error.message).toBe("Entity already exists");
      expect(error.name).toBe("ConflictError");
      expect(error).toBeInstanceOf(DomainError);
    });
  });
});
