# D2 — Technical Requirements Document (TRD)

Project: Soyed's Gamified 3D QA Portfolio
Status: DRAFT v0.1
Owner: TL (Tech Lead)
Last updated: 2026-07-07

---

## 1. Functional Requirements (FR)

| ID | Requirement |
|----|-------------|
| FR-01 | React 18 + Vite SPA; Three.js via @react-three/fiber + drei; Framer Motion; Tailwind; zustand; localStorage persistence (no login) |
| FR-02 | Scroll-driven 3D journey: scrolling advances a voxel hero along a path; idle/walk animations; PRESS START intro with typewriter text |
| FR-03 | 12 sections as clickable glowing checkpoints (see D5); every section also reachable via a non-3D nav menu |
| FR-04 | Learning Game: topic select → lesson card → 3–5 MCQs → XP/levels/streaks/achievements; AI-generated via POST /api/generate-quiz with hardcoded fallback bank |
| FR-05 | Bugsy AI sidekick: floating chat everywhere; POST /api/chat with server-side system prompt built from lib/profile.js; last ~10 messages sent as history (stateless API) |
| FR-06 | Job Quest Board: GET /api/jobs?category=qa|software|ai via JSearch (RapidAPI); normalized contract; curated-links fallback |
| FR-07 | Ask Me / Party Up: Web3Forms raven form (validation + honeypot) and lazy-loaded Calendly inline embed via CALENDLY_URL |
| FR-08 | Persistence: save key `qa-portfolio-save-v1` with Reset option; corrupted saves recovered without crash |
| FR-09 | Retro sound effects with mute toggle (persisted); achievement toasts; LEVEL UP bursts |
| FR-10 | SEO/meta: title, description, OG + Twitter cards, canonical, pixel bug favicon, 404 "GAME OVER" page |

## 2. Non-Functional Requirements (NFR)

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-01 | Performance | 60fps target desktop; 30fps floor on mid-range Android; capped device pixel ratio (dpr clamp, e.g. [1, 2] desktop, [1, 1.5] mobile) |
| NFR-02 | Performance | Lazy-load 3D scene and Calendly embed; `<Suspense>` pixel loading screen; no white flash on load; usable on throttled 3G |
| NFR-03 | Performance | Draw-call budget for scene (target < 100 mobile); no real-time shadows on mobile; particle counts reduced on mobile/reduced-motion |
| NFR-04 | Accessibility | prefers-reduced-motion honored (static scene / instant text); keyboard navigable; chat focus-trapped and screen-reader friendly; alt text everywhere |
| NFR-05 | Resilience | Any /api failure degrades gracefully: quiz → fallback bank; chat → friendly error + email; jobs → curated links. Site never blank-screens on AI failure |
| NFR-06 | Security | Input validation on all /api endpoints (types, lengths, enums); sanitization of third-party job data; CSP + security headers per vercel.json |
| NFR-07 | Privacy | No phone/home address anywhere (UI, code, metadata, AI output). localStorage-only persistence; no non-essential cookies in v1 |
| NFR-08 | Cost | All services on free tiers; quota protection via caching, session caps, and rate limiting (see §7) |
| NFR-09 | Maintainability | Small focused files; /src/components, /src/scene, /src/game, /src/hooks; shared /lib importable by frontend AND /api; provider-swappable callAI() |
| NFR-10 | Responsiveness | Fully responsive 360px–1920px; touch-friendly scroll journey; no horizontal overflow at 360px |

## 3. Performance Budgets

| Budget | Desktop | Mobile (mid/low-end Android) |
|--------|---------|------------------------------|
| Frame rate | 60fps sustained | 30fps floor |
| Pixel ratio | capped at 2 | capped at 1.5 (1 on low-end) |
| Draw calls | < 150 | < 100 |
| JS bundle (initial, gz) | < 250 KB before 3D chunk | same; 3D chunk lazy |
| Time to interactive (4G) | < 3.5 s | < 6 s |
| Shadows | static/baked only | none |
| Post-processing | minimal (bloom optional) | none |

## 4. Browser / Device Matrix

Bangladesh traffic is mobile-heavy and skews to budget Android — low-end Android is a first-class target, not an afterthought.

| Tier | Device / Browser | Support level |
|------|------------------|---------------|
| A | Chrome (latest, Win/mac) | Full 3D, 60fps |
| A | Edge (latest, Win) | Full 3D, 60fps |
| A | Firefox (latest) | Full 3D |
| A | Safari 16+ (macOS/iOS) | Full 3D, verify WebGL quirks |
| A | Chrome Android — mid-range (e.g. 4 GB RAM, Snapdragon 6xx class) | Simplified 3D, 30fps floor |
| B | Chrome Android — low-end (2–3 GB RAM, e.g. entry Xiaomi/Realme/Symphony) | Simplified 3D at dpr 1 OR auto-fallback to nav-menu mode |
| B | Samsung Internet (latest) | Simplified 3D |
| B | iOS Safari on older iPhones (iPhone 8+) | Simplified 3D |
| C | Any browser with WebGL disabled/unavailable | Non-3D fallback: full content via nav menu (gate H4) |
| C | UC Browser / Opera Mini extreme mode | Content-readable fallback; no 3D guarantee |

## 5. API Contracts

### 5.1 POST /api/chat
Request:
```json
{
  "messages": [
    { "role": "user", "content": "What does Soyed do?" },
    { "role": "assistant", "content": "..." }
  ]
}
```
- `messages`: last ≤ 10 turns; each `content` ≤ 500 chars; `role` ∈ {user, assistant}. Server rejects anything else with 400.

Response 200:
```json
{ "reply": "Soyed is a Junior SQA Engineer at BRAC IT Services Ltd. ... 🐞" }
```
Errors: 400 invalid input; 429 rate limited; 502 upstream AI failure → client shows Bugsy's friendly error + soyedmdsolemanfajul@gmail.com.
System prompt is built SERVER-side from lib/profile.js (never sent by client). Frontend enforces the 20-message session cap (in-memory `chatMessageCount`) with the "potion break" message.

### 5.2 POST /api/generate-quiz
Request:
```json
{ "topic": "api-testing", "difficulty": "junior", "count": 4 }
```
- `topic` ∈ {manual-testing, automation, api-testing, sql-database, coding-dsa, ai-in-qa, interview-hr}; `difficulty` ∈ {junior, mid, senior}; `count` integer 3–5.

Response 200 (validated by lib/validateQuiz.js, retry once on invalid, else `"source": "fallback"` from the hardcoded bank):
```json
{
  "lesson": "Short lesson text (20–4000 chars)…",
  "questions": [
    {
      "question": "…",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 2,
      "explanation": "…"
    }
  ],
  "source": "ai"
}
```

### 5.3 GET /api/jobs?category=qa|software|ai
- `category` enum-validated; anything else → 400.

Response 200 (normalized by lib/jobs.js `normalizeJobs`, ≤ 30 entries, sanitized, tag-stripped):
```json
{
  "category": "qa",
  "jobs": [
    {
      "id": "…", "title": "…", "company": "…", "location": "…",
      "postedDate": "…", "applyUrl": "https://…", "source": "…",
      "employmentType": "…"
    }
  ],
  "cachedAt": "2026-07-07T00:00:00Z"
}
```
Headers: `Cache-Control: s-maxage=21600, stale-while-revalidate=3600` (6-hour CDN cache; must be set in the function response). Upstream failure → 200 with `{ "jobs": [], "fallback": true }` so the UI shows the courier-resting state + CURATED_LINKS.

## 6. localStorage Schema — key `qa-portfolio-save-v1`

```json
{
  "xp": 0,
  "level": 1,
  "progress": { "manual-testing": { "completed": 2, "bestStreak": 5 } },
  "achievements": ["first-blood"],
  "mute": false
}
```
- All fields validated on load; unknown/garbage → reset to defaults with a friendly "corrupted save" toast (gate H5). Versioned key: schema changes ship as `-v2` with a documented migration.
- **`chatMessageCount` is IN-MEMORY ONLY (zustand, not persisted)** — the 20-message Bugsy cap intentionally resets on every visit.

## 7. Environment Variables & Quotas

| Var | Scope | Used by |
|-----|-------|---------|
| GEMINI_API_KEY | Server only (Vercel env) | /api/chat, /api/generate-quiz via shared callAI() |
| RAPIDAPI_KEY | Server only (Vercel env) | /api/jobs (JSearch) |

Web3Forms access key and CALENDLY_URL are public-safe constants in lib/profile.js (currently empty — TODO).

Quota strategy (numbers researched in D7; verify at build time):
- **Gemini free tier**: order of 10–15 requests/min and a few hundred requests/day for flash models — protected by 500-char input cap, 20-message session cap, function rate limiting, and quiz-count limits.
- **JSearch free tier**: ~200 requests/month — protected by the **6-hour CDN cache** (`s-maxage=21600`): worst case 3 categories × 4 refreshes/day ≈ 360 origin hits/month WITHOUT cache; with CDN cache shared across all visitors, expected origin calls ≈ 12/day → ~360/month upper bound, so consider 12-hour cache or daily pre-fetch if quota trips (documented follow-up).
- **Web3Forms free**: ~250 submissions/month — honeypot + client validation keep spam out.

## 8. Non-Negotiables (Master Prompt — repeated in D1, D5, D6, D10)

1. No API keys in frontend code — env vars on Vercel only (Web3Forms key is the sole allowed public key).
2. **Privacy rule:** no phone number or home address anywhere — UI, AI answers, metadata, commits. Bugsy refuses to share them.
3. No LinkedIn scraping — jobs from legitimate aggregator APIs only.
4. AI features never break the site — validate, retry once, hardcoded fallback.
