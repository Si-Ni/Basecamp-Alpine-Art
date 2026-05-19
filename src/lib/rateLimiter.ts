// src/lib/rateLimiter.ts
// ─────────────────────────────────────────────────────────────────────────────
// Sliding-window rate limiter backed by Cloudflare KV.
//
// Two independent limiters protect the contact endpoint:
//   • Per-IP    – cap burst from one network source  (default: 3 req / 60 min)
//   • Per-email – cap submissions for one address    (default: 3 req / 60 min)
//
// KV binding:
//   The Cloudflare KV namespace must be bound as "RATE_LIMIT" in wrangler.toml
//   and in the Cloudflare Pages dashboard (Settings → Functions → KV bindings).
//
// Each KV entry stores a JSON array of timestamps (ms).
// TTL is set to the window length so Cloudflare auto-expires stale entries.
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ─────────────────────────────────────────────────────────────────────

/** Minimal interface for the KV namespace — matches the Cloudflare Workers KV API. */
export interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ): Promise<void>;
}

export interface LimiterConfig {
  max: number;
  windowMs: number;
  keyPrefix: string;
}

export interface RateLimitResult {
  allowed: boolean;
  count: number;
  limit: number;
  retryAfterSeconds: number;
}

// ── Default config ────────────────────────────────────────────────────────────
// Hardcoded here because import.meta.env is not reliable at module init time
// in Cloudflare Workers. Pass overrides via the config objects if needed.

export const IP_CONFIG: LimiterConfig = {
  max: 3,
  windowMs: 60 * 60 * 1000, // 60 min
  keyPrefix: "ip:",
};

export const EMAIL_CONFIG: LimiterConfig = {
  max: 3,
  windowMs: 60 * 60 * 1000, // 60 min
  keyPrefix: "em:",
};

// ── Core ──────────────────────────────────────────────────────────────────────

/**
 * Records one request and returns whether it falls within the allowed limit.
 * All state lives in KV — safe across every Cloudflare edge instance.
 */
export async function checkRateLimit(
  kv: KVNamespace,
  config: LimiterConfig,
  identifier: string,
): Promise<RateLimitResult> {
  const key = config.keyPrefix + identifier.trim().toLowerCase().slice(0, 256);
  const now = Date.now();
  const cutoff = now - config.windowMs;
  const windowSeconds = Math.ceil(config.windowMs / 1000);

  // Read existing timestamps from KV
  const raw = await kv.get(key);
  const allTimestamps: number[] = raw ? (JSON.parse(raw) as number[]) : [];

  // Prune timestamps outside the current window
  const existing = allTimestamps.filter((t) => t > cutoff);

  // Calculate retry-after BEFORE appending
  const oldestInWindow = existing[0] ?? now;
  const retryAfterMs = Math.max(0, oldestInWindow + config.windowMs - now);

  const allowed = existing.length < config.max;

  if (allowed) {
    // Only record allowed requests
    existing.push(now);
    // TTL = window length so KV auto-cleans entries with no recent activity
    await kv.put(key, JSON.stringify(existing), {
      expirationTtl: windowSeconds,
    });
  }

  return {
    allowed,
    count: existing.length,
    limit: config.max,
    retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
  };
}

/**
 * Checks both IP and email limits.
 * Returns the first failure, or the IP result if both pass.
 */
export async function checkContactLimits(
  kv: KVNamespace,
  ip: string,
  email: string,
): Promise<RateLimitResult & { blockedBy?: "ip" | "email" }> {
  const ipResult = await checkRateLimit(kv, IP_CONFIG, ip);
  if (!ipResult.allowed) return { ...ipResult, blockedBy: "ip" };

  const emailResult = await checkRateLimit(kv, EMAIL_CONFIG, email);
  if (!emailResult.allowed) return { ...emailResult, blockedBy: "email" };

  return ipResult;
}
