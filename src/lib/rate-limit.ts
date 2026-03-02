/**
 * Simple in-memory rate limiter using a sliding window per IP.
 * Entries are cleaned up lazily on each check.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

interface RateLimitConfig {
  /** Unique name for this limiter (e.g., "claim-policy") */
  name: string;
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

export function checkRateLimit(
  config: RateLimitConfig,
  ip: string
): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  if (!stores.has(config.name)) {
    stores.set(config.name, new Map());
  }
  const store = stores.get(config.name)!;

  let entry = store.get(ip);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(ip, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

  if (entry.timestamps.length >= config.maxRequests) {
    const oldest = entry.timestamps[0];
    const retryAfterMs = oldest + config.windowMs - now;
    return { allowed: false, retryAfterMs };
  }

  entry.timestamps.push(now);
  return { allowed: true };
}
