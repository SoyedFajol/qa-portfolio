// Shared job-board logic: query mapping, normalization, sanitization, fallbacks.
// Used by api/jobs.js (server) and the Job Quest Board UI (fallback + stars).

export const JOB_CATEGORIES = ['qa', 'software', 'ai']

export const CATEGORY_QUERIES = {
  qa: 'QA engineer OR SQA engineer in Dhaka, Bangladesh',
  software: 'software engineer in Bangladesh',
  ai: 'AI engineer OR machine learning engineer in Bangladesh',
}

// Strip tags/control chars so third-party job data can never smuggle markup.
export function sanitize(v, max = 160) {
  return String(v ?? '')
    .replace(/<[^>]*>/g, '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

function safeUrl(u) {
  const s = String(u ?? '').trim()
  return /^https?:\/\//i.test(s) ? s.slice(0, 500) : ''
}

/** Normalize raw JSearch results to our contract. Drops entries without title+apply URL. */
export function normalizeJobs(raw) {
  if (!Array.isArray(raw)) return []
  return raw
    .map((j) => ({
      id: sanitize(j.job_id, 80) || `${sanitize(j.employer_name, 40)}-${sanitize(j.job_title, 40)}`,
      title: sanitize(j.job_title),
      company: sanitize(j.employer_name, 100) || 'Unknown guild',
      location: sanitize(
        [j.job_city, j.job_country].filter(Boolean).join(', ') || j.job_location || 'Bangladesh',
        100
      ),
      postedDate: sanitize(j.job_posted_at_datetime_utc, 40),
      applyUrl: safeUrl(j.job_apply_link),
      source: sanitize(j.job_publisher, 60) || 'aggregator',
      employmentType: sanitize(j.job_employment_type, 40),
    }))
    .filter((j) => j.title && j.applyUrl)
    .slice(0, 30)
}

export function difficultyStars(title = '') {
  if (/intern|junior|entry|trainee|fresher/i.test(title)) return 1
  if (/senior|sr\.?\s|lead|principal|manager|architect/i.test(title)) return 3
  return 2
}

export const CURATED_LINKS = [
  { label: '🔎 LinkedIn Jobs — SQA in Bangladesh', url: 'https://www.linkedin.com/jobs/search/?keywords=SQA%20Engineer&location=Bangladesh' },
  { label: '📋 BdJobs — the local quest hall', url: 'https://www.bdjobs.com/' },
  { label: '🚀 Wellfound — QA at startups', url: 'https://wellfound.com/role/qa-engineer' },
]
