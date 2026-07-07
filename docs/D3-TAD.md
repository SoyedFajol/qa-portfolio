# D3 — Technical Architecture Document (TAD)

Project: Soyed's Gamified 3D QA Portfolio
Status: DRAFT v0.1
Owner: TL (Tech Lead)
Last updated: 2026-07-07

---

## 1. System Diagram

```
                       ┌──────────────────────────────────────────────┐
                       │              VISITOR BROWSER                 │
                       │                                              │
                       │  React 18 UI (Tailwind + Framer Motion)      │
                       │    ├─ Section overlays (12 levels)           │
                       │    ├─ Nav fallback menu (no-3D path)         │
                       │    └─ Bugsy chat window (focus-trapped)      │
                       │  R3F Scene (three.js, lazy + <Suspense>)     │
                       │    ├─ Voxel hero + Bugsy NPC (box geometry)  │
                       │    └─ Scroll-driven camera, particles        │
                       │  zustand store                               │
                       │    ├─ persisted → localStorage               │
                       │    │   qa-portfolio-save-v1                  │
                       │    │   { xp, level, progress,                │
                       │    │     achievements, mute }                │
                       │    └─ in-memory: chatMessageCount, UI state  │
                       └───────┬───────────────┬──────────┬───────────┘
                               │ same-origin   │ direct   │ direct
                               │ /api/*        │ HTTPS    │ embed
                               ▼               ▼          ▼
        ┌──────────────────────────────┐  ┌──────────┐  ┌──────────┐
        │  VERCEL (CDN + serverless)   │  │Web3Forms │  │ Calendly │
        │                              │  │(raven    │  │ (inline  │
        │  /api/chat ──────┐           │  │ form     │  │  widget, │
        │  /api/generate-  ├─callAI()──┼──► POST)    │  │  lazy)   │
        │      quiz  ──────┘   │       │  └──────────┘  └──────────┘
        │  /api/jobs ── 6h CDN cache   │
        │        │     (s-maxage=21600)│        Secrets (Vercel env only):
        │        │                     │        GEMINI_API_KEY, RAPIDAPI_KEY
        └────────┼─────────┬───────────┘
                 │         │
                 ▼         ▼
        ┌────────────┐  ┌─────────────────────┐
        │ JSearch    │  │ Google Gemini API   │
        │ (RapidAPI) │  │ (free tier, flash)  │
        └────────────┘  └─────────────────────┘
```

## 2. Layers

| Layer | Tech | Responsibility |
|-------|------|----------------|
| UI | React 18, Tailwind, Framer Motion | Section overlays, pixel dialogs, XP bar, toasts, typewriter text, nav fallback |
| 3D scene | three.js via @react-three/fiber + drei | World, hero, Bugsy NPC, scroll camera, particles; lazy-loaded chunk |
| State | zustand | xp/level/progress/achievements/mute (persisted) + chatMessageCount/UI state (in-memory) |
| Persistence | localStorage `qa-portfolio-save-v1` | Save/load with validation + reset; versioned key |
| Shared logic | /lib (profile.js, jobs.js, validateQuiz.js) | Single source of truth importable by frontend AND serverless |
| Serverless | Vercel Functions /api/chat, /api/generate-quiz, /api/jobs | Secret-holding proxy, validation, rate limiting, caching |
| AI | Gemini free tier behind one `callAI()` helper | Chat replies + quiz JSON; provider swappable |
| Jobs | JSearch (RapidAPI); Jooble as documented alternative | Aggregated BD job listings; NO LinkedIn scraping |
| Forms/booking | Web3Forms (public-safe key), Calendly embed | Raven messages, session booking; both bypass our backend |

## 3. Data Flows

### 3.1 Chat (Bugsy)
1. User types (≤ 500 chars, enforced client-side); frontend appends to in-memory history; increments `chatMessageCount`.
2. If `chatMessageCount` > 20 → Bugsy shows "I need a potion break! Email Soyed directly 📧" — NO API call.
3. Frontend POSTs last ≤ 10 messages to /api/chat.
4. Function validates shape/lengths/roles → 400 on violation; rate-limits per IP → 429.
5. Function builds system prompt from lib/profile.js (persona rules: on-topic only, no invented facts, no phone/address, 2–5 sentences) and calls `callAI()`.
6. Reply streams/returns → typewriter render + retro blip.

### 3.2 Quiz (Learning Game)
1. UI requests `{ topic, difficulty, count }` from /api/generate-quiz (enums validated both sides).
2. Function calls `callAI()` demanding strict JSON only.
3. `extractJson()` + `validateQuiz()` (lib/validateQuiz.js) — on failure, **retry once** with a "JSON only" reminder.
4. Second failure → serve the **hardcoded fallback bank** entry for that topic, `source: "fallback"`.
5. Client re-validates (defense in depth) before rendering; correct/incorrect always shows the explanation; XP written to store → localStorage.

### 3.3 Jobs (Quest Board)
1. UI GETs /api/jobs?category=qa (enum validated).
2. Vercel CDN serves cached response if < 6 h old (`s-maxage=21600`) — most visitors never hit origin.
3. On cache miss, function queries JSearch with CATEGORY_QUERIES (lib/jobs.js), normalizes + sanitizes via `normalizeJobs` (tag-strip, control-char strip, length caps, https-only applyUrl, ≤ 30 items).
4. Upstream error/quota → 200 with `fallback: true` → UI shows "The quest board courier is resting…" + CURATED_LINKS (LinkedIn search URL, BdJobs, Wellfound) + freshness disclaimer.

### 3.4 Raven / Party Up
- Raven: client-side validation + honeypot → POST directly to api.web3forms.com (allowed by CSP form-action/connect-src) → raven fly-off success animation. Failure → inline retry message + mailto link.
- Party Up: Calendly script + iframe lazy-load only when section opens; CALENDLY_URL empty → "Session scrolls coming soon — send a raven instead!" placeholder state.

## 4. Failure Modes & Fallback Paths

| # | Failure | Detection | Fallback | User sees |
|---|---------|-----------|----------|-----------|
| F1 | Gemini returns malformed quiz JSON | extractJson/validateQuiz fail | Retry once → hardcoded topic bank | A normal quiz (badge may note "offline question bank") |
| F2 | Gemini down / quota exhausted (chat) | callAI throws / 429 / 5xx | Static Bugsy apology + soyedmdsolemanfajul@gmail.com | Friendly error, site fully usable |
| F3 | JSearch down / 429 / monthly quota gone | fetch error or non-200 | `fallback: true` → curated links | "Courier is resting…" + 3 real job-search links |
| F4 | Corrupted localStorage save | JSON.parse/shape validation fails on load | Reset to defaults, keep site running | "Save file corrupted — starting a new game!" toast |
| F5 | WebGL unavailable / low-end GPU | context creation fails / capability probe | Non-3D mode: nav menu + all section content | Full content, no game world (gate H4) |
| F6 | Slow network (3G) | — | Lazy 3D chunk + Suspense pixel loader; content-first | Pixel loading screen, no white flash |
| F7 | Web3Forms unreachable | fetch rejects / non-200 | Inline error + mailto:soyedmdsolemanfajul@gmail.com | "The raven got lost — email me instead" |
| F8 | Calendly blocked/unset | embed onload timeout / empty CALENDLY_URL | Placeholder card pointing to raven form | "Session scrolls coming soon" |
| F9 | Abusive chat volume | rate limiter (per-IP) + session cap | 429 / potion-break message | Bugsy asks to email Soyed |
| F10 | Prompt injection attempt | server-side system prompt + persona rules | Deflection reply; system prompt never client-visible | "That quest is outside my map! 🐞" |

## 5. Key Architecture Decisions

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-1 | One `callAI()` helper for chat + quiz | Provider swap (Gemini → other) touches one file |
| ADR-2 | Shared /lib for profile, jobs, quiz validation | One source of truth for UI and /api; enables identical client/server validation |
| ADR-3 | CDN caching instead of a database for jobs | Free, zero-ops, fits 200 req/month quota |
| ADR-4 | localStorage over any backend persistence | No accounts, no PII stored server-side, zero cost |
| ADR-5 | Box-geometry voxel models, no external GLTFs | Tiny bundle, no asset licensing risk, fast on low-end Android |
| ADR-6 | chatMessageCount in memory only | Session cap is abuse protection, not UX state; resetting per visit is acceptable and simpler |
