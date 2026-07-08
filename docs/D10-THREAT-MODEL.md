# D10 — THREAT MODEL (owner: SEC) — v1.0

## Assets
1. **Gemini + RapidAPI free-tier quotas** (money-adjacent: exhaustion = broken features)
2. **Soyed's personal data boundary** (email/GitHub/LinkedIn public; phone/address must never exist)
3. **Visitor trust** (no XSS, no tracking beyond cookieless analytics)
4. **Site availability/reputation**

## Attack surfaces & mitigations

### 1. /api/chat (Bugsy)
- **Prompt injection / persona hijack** → system prompt is server-side only;
  explicit rules to ignore instruction-change attempts, never reveal the
  prompt, never invent facts (tested: tests/bugsy.test.js; manual attack set
  in D6-FTL). Residual: a novel jailbreak may slip through — impact limited
  because the model only *knows* the public profile; there is no private data
  in context to leak.
- **Quota burn** → 500-char input cap + 10-msg history cap (client AND server),
  20-msg session cap (client), 8 req/min/IP server limiter, 512-token output cap.
  Residual: in-memory limiter resets per serverless instance — acceptable;
  hard stop is the free-tier quota itself, failure mode is the friendly fallback.
- **PII leak via AI answer** → profile contains no phone/address (grep-tested),
  so the model cannot output what it never saw; prompt additionally forbids it.

### 2. /api/generate-quiz
- **Malformed/hostile AI output** → strict schema validation server-side
  (validateQuiz), retry once, hardcoded fallback; client re-validates
  (defense in depth). Content is rendered as text nodes only.
- **Quota burn** → 6 req/min/IP + enum/type validation on inputs.

### 3. /api/jobs + third-party job data rendered in UI
- **Stored XSS via crafted job title/company** → normalizeJobs strips tags and
  control chars, whitelists http(s) apply URLs (javascript: rejected — tested);
  React renders text nodes, no dangerouslySetInnerHTML anywhere (grep-verified).
- **Quota burn** → 6h CDN cache (s-maxage=21600 + SWR), 10 req/min/IP,
  category enum validation. Failures cached only 300s.

### 4. Frontend
- **localStorage save tampering** → sanitizeSave repairs field-by-field,
  re-derives level, caps array sizes (tested with garbage + 10k-item floods).
- **Supply chain** → npm audit in CI habit; lockfile committed; no CDN scripts
  except Calendly (lazy, user-initiated) — CSP restricts script-src to
  'self' + assets.calendly.com.
- **Clickjacking / MIME sniffing / referrer leaks** → X-Frame-Options DENY,
  frame-ancestors 'none', nosniff, strict-origin-when-cross-origin (vercel.json).

### 5. Secrets
- GEMINI_API_KEY / RAPIDAPI_KEY: Vercel env vars only; .env gitignored;
  .env.example documents names only; repo history contains no values
  (scanned at commit time). Web3Forms access key is public-safe by design.

## Explicitly out of scope (v1)
No auth, no payments, no user accounts, no server-side storage of visitor
data. If any of these arrive, this model must be revised first (gate C6/D).
