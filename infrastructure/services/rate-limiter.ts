import type { RateLimitInfo } from "@/types/ai";

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const ONE_MINUTE_MS = 60_000;
const ONE_DAY_MS = 86_400_000;

/** BYOK users get 5x the limits */
const BYOK_MULTIPLIER = 5;

/**
 * In-memory IP-based rate limiter.
 * Two buckets: per-minute (RPM) and per-day (tokens).
 * Stale entries are cleaned lazily on each check.
 */
export class RateLimiter {
  private readonly rpmStore = new Map<string, RateLimitEntry>();
  private readonly tokenStore = new Map<string, RateLimitEntry>();
  private readonly baseRpm: number;
  private readonly baseDailyTokens: number;

  constructor(baseRpm: number = 10, baseDailyTokens: number = 500_000) {
    this.baseRpm = baseRpm;
    this.baseDailyTokens = baseDailyTokens;
  }

  /**
   * Check if a request is allowed and return limit info.
   */
  checkLimit(ip: string, isByok: boolean): RateLimitInfo {
    const now = Date.now();
    const rpm = isByok ? this.baseRpm * BYOK_MULTIPLIER : this.baseRpm;
    const dailyTokens = isByok
      ? this.baseDailyTokens * BYOK_MULTIPLIER
      : this.baseDailyTokens;

    // Clean stale entries lazily
    this.cleanStale(now);

    // Check RPM
    const rpmEntry = this.rpmStore.get(ip);
    if (rpmEntry && now - rpmEntry.windowStart < ONE_MINUTE_MS) {
      if (rpmEntry.count >= rpm) {
        const retryAfterMs = ONE_MINUTE_MS - (now - rpmEntry.windowStart);
        return {
          allowed: false,
          remainingRequests: 0,
          remainingTokens: this.getRemainingTokens(ip, dailyTokens, now),
          retryAfterMs,
        };
      }
    }

    // Check daily tokens
    const tokenEntry = this.tokenStore.get(ip);
    if (tokenEntry && now - tokenEntry.windowStart < ONE_DAY_MS) {
      if (tokenEntry.count >= dailyTokens) {
        const retryAfterMs = ONE_DAY_MS - (now - tokenEntry.windowStart);
        return {
          allowed: false,
          remainingRequests: this.getRemainingRequests(ip, rpm, now),
          remainingTokens: 0,
          retryAfterMs,
        };
      }
    }

    return {
      allowed: true,
      remainingRequests: this.getRemainingRequests(ip, rpm, now),
      remainingTokens: this.getRemainingTokens(ip, dailyTokens, now),
      retryAfterMs: null,
    };
  }

  /**
   * Record a request (increment RPM counter).
   */
  recordRequest(ip: string): void {
    const now = Date.now();
    const entry = this.rpmStore.get(ip);

    if (!entry || now - entry.windowStart >= ONE_MINUTE_MS) {
      this.rpmStore.set(ip, { count: 1, windowStart: now });
    } else {
      entry.count++;
    }
  }

  /**
   * Record token usage (increment daily token counter).
   */
  recordTokens(ip: string, tokens: number): void {
    const now = Date.now();
    const entry = this.tokenStore.get(ip);

    if (!entry || now - entry.windowStart >= ONE_DAY_MS) {
      this.tokenStore.set(ip, { count: tokens, windowStart: now });
    } else {
      entry.count += tokens;
    }
  }

  private getRemainingRequests(
    ip: string,
    rpm: number,
    now: number,
  ): number {
    const entry = this.rpmStore.get(ip);
    if (!entry || now - entry.windowStart >= ONE_MINUTE_MS) return rpm;
    return Math.max(0, rpm - entry.count);
  }

  private getRemainingTokens(
    ip: string,
    dailyTokens: number,
    now: number,
  ): number {
    const entry = this.tokenStore.get(ip);
    if (!entry || now - entry.windowStart >= ONE_DAY_MS) return dailyTokens;
    return Math.max(0, dailyTokens - entry.count);
  }

  /**
   * Lazy garbage collection — remove entries whose windows have expired.
   */
  private cleanStale(now: number): void {
    for (const [key, entry] of this.rpmStore) {
      if (now - entry.windowStart >= ONE_MINUTE_MS * 2) {
        this.rpmStore.delete(key);
      }
    }
    for (const [key, entry] of this.tokenStore) {
      if (now - entry.windowStart >= ONE_DAY_MS * 2) {
        this.tokenStore.delete(key);
      }
    }
  }
}

/** Singleton rate limiter instance for the server */
let instance: RateLimiter | null = null;

export function getRateLimiter(
  rpm?: number,
  dailyTokens?: number,
): RateLimiter {
  instance ??= new RateLimiter(rpm, dailyTokens);
  return instance;
}
