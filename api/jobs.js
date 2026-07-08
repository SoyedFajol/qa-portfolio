// GET /api/jobs?category=qa|software|ai — live openings via JSearch (RapidAPI),
// normalized and aggressively CDN-cached so visitors don't burn the free quota.

import { JOB_CATEGORIES, CATEGORY_QUERIES, normalizeJobs } from '../lib/jobs.js'
import { rateLimit, clientIp } from '../lib/rateLimit.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!rateLimit(`jobs:${clientIp(req)}`, { limit: 10, windowMs: 60_000 })) {
    return res.status(429).json({ error: 'The quest board courier is overloaded — slow down.' })
  }

  const category = typeof req.query.category === 'string' ? req.query.category : ''
  if (!JOB_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: 'category must be one of: ' + JOB_CATEGORIES.join(', ') })
  }

  const key = process.env.RAPIDAPI_KEY
  if (!key) {
    // Not configured yet — the UI shows its curated-links fallback. Short
    // cache so flipping the env var takes effect quickly.
    res.setHeader('Cache-Control', 'public, s-maxage=300')
    return res.status(200).json({ jobs: [], fallback: true })
  }

  try {
    const url = new URL('https://jsearch.p.rapidapi.com/search')
    url.searchParams.set('query', CATEGORY_QUERIES[category])
    url.searchParams.set('page', '1')
    url.searchParams.set('num_pages', '1')
    url.searchParams.set('country', 'bd')
    url.searchParams.set('date_posted', 'month')

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 15000)
    const upstream = await fetch(url, {
      headers: {
        'x-rapidapi-key': key,
        'x-rapidapi-host': 'jsearch.p.rapidapi.com',
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timer))

    if (!upstream.ok) throw new Error(`JSearch HTTP ${upstream.status}`)
    const data = await upstream.json()
    const jobs = normalizeJobs(data?.data)

    // 6h CDN cache + serve-stale — visitors after the first hit cost zero quota.
    res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400')
    return res.status(200).json({ jobs, fallback: false })
  } catch {
    res.setHeader('Cache-Control', 'public, s-maxage=300')
    return res.status(200).json({ jobs: [], fallback: true })
  }
}
