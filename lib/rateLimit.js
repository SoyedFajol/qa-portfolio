// Best-effort in-memory rate limiter for the serverless functions. Instances
// are ephemeral so this is not a hard guarantee — it exists to stop casual
// abuse and quota burn (gates A5/C2). Hard money caps live at the provider
// (free-tier quotas).

const buckets = new Map() // key -> number[] of request timestamps

export function rateLimit(key, { limit = 10, windowMs = 60_000 } = {}) {
  const now = Date.now()
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs)
  if (hits.length >= limit) {
    buckets.set(key, hits)
    return false
  }
  hits.push(now)
  buckets.set(key, hits)
  // keep the map from growing unbounded on long-lived instances
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.length === 0 || now - v[v.length - 1] > windowMs) buckets.delete(k)
    }
  }
  return true
}

/** Client IP from Vercel's proxy headers. */
export function clientIp(req) {
  const fwd = req.headers['x-forwarded-for']
  return (typeof fwd === 'string' ? fwd.split(',')[0].trim() : '') || req.socket?.remoteAddress || 'unknown'
}
