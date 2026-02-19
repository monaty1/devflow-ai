import { describe, it, expect, beforeEach } from "vitest";
import { RateLimiter } from "@/infrastructure/services/rate-limiter";

describe("RateLimiter", () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter(3, 1000); // 3 RPM, 1000 daily tokens
  });

  describe("checkLimit", () => {
    it("should allow requests under the limit", () => {
      const result = limiter.checkLimit("1.2.3.4", false);
      expect(result.allowed).toBe(true);
      expect(result.remainingRequests).toBe(3);
      expect(result.remainingTokens).toBe(1000);
      expect(result.retryAfterMs).toBeNull();
    });

    it("should block after RPM limit is exceeded", () => {
      limiter.recordRequest("1.2.3.4");
      limiter.recordRequest("1.2.3.4");
      limiter.recordRequest("1.2.3.4");

      const result = limiter.checkLimit("1.2.3.4", false);
      expect(result.allowed).toBe(false);
      expect(result.remainingRequests).toBe(0);
      expect(result.retryAfterMs).toBeGreaterThan(0);
    });

    it("should block after daily token limit is exceeded", () => {
      limiter.recordTokens("1.2.3.4", 1001);

      const result = limiter.checkLimit("1.2.3.4", false);
      expect(result.allowed).toBe(false);
      expect(result.remainingTokens).toBe(0);
    });

    it("should apply BYOK multiplier (5x)", () => {
      // Record 3 requests — should still be allowed with BYOK (limit = 15)
      limiter.recordRequest("1.2.3.4");
      limiter.recordRequest("1.2.3.4");
      limiter.recordRequest("1.2.3.4");

      const result = limiter.checkLimit("1.2.3.4", true);
      expect(result.allowed).toBe(true);
      expect(result.remainingRequests).toBe(12); // 15 - 3
    });

    it("should track IPs independently", () => {
      limiter.recordRequest("1.1.1.1");
      limiter.recordRequest("1.1.1.1");
      limiter.recordRequest("1.1.1.1");

      const blocked = limiter.checkLimit("1.1.1.1", false);
      expect(blocked.allowed).toBe(false);

      const allowed = limiter.checkLimit("2.2.2.2", false);
      expect(allowed.allowed).toBe(true);
    });
  });

  describe("recordRequest", () => {
    it("should increment the request count", () => {
      limiter.recordRequest("1.2.3.4");
      const result = limiter.checkLimit("1.2.3.4", false);
      expect(result.remainingRequests).toBe(2);
    });
  });

  describe("recordTokens", () => {
    it("should accumulate token usage", () => {
      limiter.recordTokens("1.2.3.4", 300);
      limiter.recordTokens("1.2.3.4", 400);

      const result = limiter.checkLimit("1.2.3.4", false);
      expect(result.remainingTokens).toBe(300); // 1000 - 700
    });
  });
});
