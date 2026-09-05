const buckets = new Map<string, number[]>();

const WINDOW_MS = 60_000;
const MAX_HITS = 12;

/** Lightweight in-memory rate limit, suitable for Vercel single-instance v1. */
export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_HITS) {
    buckets.set(key, hits);
    return true;
  }
  hits.push(now);
  buckets.set(key, hits);
  // Prevent unbounded growth in long-lived processes
  if (buckets.size > 5000) {
    const oldest = Array.from(buckets.keys()).slice(0, 1000);
    for (const k of oldest) buckets.delete(k);
  }
  return false;
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}
