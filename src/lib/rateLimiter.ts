// src/lib/rateLimiter.ts
// ─────────────────────────────────────────────────────────────────────────────
// Sliding-window rate limiter.
//
// Two independent limiters protect the contact endpoint:
//   • Per-IP    – cap burst from one network source  (default: 5 req / 10 min)
//   • Per-email – cap submissions for one address    (default: 3 req / 60 min)
//
// Store: in-process Map (works for single-instance / serverless cold starts).
// To scale horizontally, swap the store for Redis by setting REDIS_URL and
// installing ioredis — the interface is identical; only getStore() changes.
//
// Environment variables:
//   RL_IP_MAX              (default: 5)
//   RL_IP_WINDOW_SECONDS   (default: 600   = 10 min)
//   RL_EMAIL_MAX           (default: 3)
//   RL_EMAIL_WINDOW_SECONDS(default: 3600  = 60 min)
// ─────────────────────────────────────────────────────────────────────────────

// ── Config ───────────────────────────────────────────────────────────────────

export interface LimiterConfig {
  max: number;
  windowMs: number;
  keyPrefix: string;
}

export const IP_CONFIG: LimiterConfig = {
  max: Number(import.meta.env.RL_IP_MAX ?? 3),
  windowMs: Number(import.meta.env.RL_IP_WINDOW_SECONDS ?? 3600) * 1000,
  keyPrefix: "ip:",
};

export const EMAIL_CONFIG: LimiterConfig = {
  max: Number(import.meta.env.RL_EMAIL_MAX ?? 3),
  windowMs: Number(import.meta.env.RL_EMAIL_WINDOW_SECONDS ?? 3600) * 1000,
  keyPrefix: "em:",
};

// ── Result ────────────────────────────────────────────────────────────────────

export interface RateLimitResult {
  allowed: boolean;
  /** Current count within the window */
  count: number;
  limit: number;
  /** Seconds until the oldest request falls out of the window */
  retryAfterSeconds: number;
}

// ── In-memory sliding-window store ───────────────────────────────────────────
// Each key maps to a sorted list of timestamps (ms).

const store = new Map<string, number[]>();

/** Prune keys whose last timestamp is older than their window to prevent leaks. */
function prune(key: string, windowMs: number): void {
  const now = Date.now();
  const cutoff = now - windowMs;
  const times = store.get(key);
  if (!times) return;
  const fresh = times.filter((t) => t > cutoff);
  if (fresh.length === 0) store.delete(key);
  else store.set(key, fresh);
}

// ── Core function ─────────────────────────────────────────────────────────────

/**
 * Records one request for `identifier` under the given config and returns
 * whether it is within the allowed limit.
 *
 * @param config  - Limiter configuration (use IP_CONFIG or EMAIL_CONFIG)
 * @param identifier - Raw key value (IP address, email address, etc.)
 */
export function checkRateLimit(
  config: LimiterConfig,
  identifier: string,
): RateLimitResult {
  // Normalise & namespace the key
  const key = config.keyPrefix + identifier.trim().toLowerCase().slice(0, 256);
  const now = Date.now();
  const cutoff = now - config.windowMs;

  // Fetch + prune existing timestamps
  const existing = (store.get(key) ?? []).filter((t) => t > cutoff);

  // Calculate retry-after BEFORE appending the new timestamp
  const oldestInWindow = existing[0] ?? now;
  const retryAfterMs = Math.max(0, oldestInWindow + config.windowMs - now);

  const allowed = existing.length < config.max;

  if (allowed) {
    // Only record allowed requests — rejected ones don't count toward the window
    existing.push(now);
    store.set(key, existing);
  }

  return {
    allowed,
    count: existing.length,
    limit: config.max,
    retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
  };
}

/**
 * Convenience wrapper that checks both IP and email limits.
 * Returns the most restrictive result (first failure wins).
 */
export function checkContactLimits(
  ip: string,
  email: string,
): RateLimitResult & { blockedBy?: "ip" | "email" } {
  const ipResult = checkRateLimit(IP_CONFIG, ip);
  if (!ipResult.allowed) return { ...ipResult, blockedBy: "ip" };

  const emailResult = checkRateLimit(EMAIL_CONFIG, email);
  if (!emailResult.allowed) return { ...emailResult, blockedBy: "email" };

  return ipResult; // both allowed → return IP result (has correct count/limit)
}
