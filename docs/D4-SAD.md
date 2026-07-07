# D4 — Solution Architecture Document (SAD)

Project: Soyed's Gamified 3D QA Portfolio
Status: DRAFT v0.1
Owner: TL + DEVOPS
Last updated: 2026-07-07

---

## 1. Deployment Topology (Vercel)

```
GitHub repo (main + feature branches)
        │  push / PR
        ▼
GitHub Actions CI ──lint──test──build──► required status checks
        │
        ▼
Vercel Git integration
   ├─ Preview deployment  ← every PR/branch push (unique URL)
   └─ Production deployment ← merge to main
              │
              ▼
   Vercel Edge Network (global CDN)
      ├─ Static assets: SPA bundle, immutable hashed files
      ├─ SPA rewrite: /((?!api/).*) → /index.html   (vercel.json)
      ├─ Security headers + CSP on every response    (vercel.json)
      └─ /api/* → Serverless Functions (Node runtime)
            ├─ /api/chat            (no cache)
            ├─ /api/generate-quiz   (no cache)
            └─ /api/jobs            (CDN cache: s-maxage=21600)
```

- Region: default (iad1) is fine; job/AI upstreams are global. Optional: pin to `sin1` (Singapore) for lower latency to Bangladesh visitors — decide at build time with measurements.
- No custom domain in v1 (HALT: money). Production URL: https://soyed-qa-portfolio.vercel.app.

## 2. Environments

| Env | Trigger | URL | Env vars | Purpose |
|-----|---------|-----|----------|---------|
| Local | `npm run dev` (Vite) + `vercel dev` for /api | localhost:5173 | `.env` (git-ignored; `.env.example` documents keys) | Development; fallback paths testable by leaving keys empty |
| Preview | Any branch push / PR | `*-git-*.vercel.app` per branch | Vercel "Preview" scope — SAME server keys as prod (free tiers) or empty to exercise fallbacks | QA executes FTL against preview before merge |
| Production | Merge to main | soyed-qa-portfolio.vercel.app | Vercel "Production" scope: GEMINI_API_KEY, RAPIDAPI_KEY | Live site |

Rules:
- Secrets exist ONLY in Vercel env settings and local `.env` (git-ignored). Repo history scanned before ship (gate C3).
- Preview deployments are safe to share with Soyed for HALT approvals (branding, launch copy).

## 3. CI Pipeline (GitHub Actions)

Workflow: `.github/workflows/ci.yml` — on push + pull_request:

| Step | Command | Fails build on |
|------|---------|----------------|
| Install | `npm ci` | lockfile mismatch |
| Lint | `npm run lint` (eslint) | any error |
| Test | `npm test` (vitest run) | any failing unit test (validateQuiz, jobs normalization/sanitize, store/save logic) |
| Build | `npm run build` (vite) | build error |

Notes:
- Project is plain JS — no type-check step in v1 (loop protocol mentions type-check; documented as N/A unless we add JSDoc + `tsc --noEmit` later).
- Branch protection on main: CI must be green before merge; Vercel production deploy only from main.
- AI-quality checks that can be automated (quiz schema fuzz tests, injection prompt regression set with mocked callAI) run in vitest; live-model checks stay manual in the FTL with recorded evidence (gate A7).

## 4. Rollback Strategy

1. **Vercel instant rollback** (primary): Deployments → previous known-good → "Promote to Production". Atomic, < 1 minute, no rebuild.
2. **Git revert** (root cause): revert the offending commit on main → CI → fresh deploy. Used after the instant rollback stops the bleeding.
3. Env-var rollback: keys are decoupled from deploys; rotating a leaked/burned key requires only a redeploy.
4. Save-schema safety: localStorage key is versioned (`qa-portfolio-save-v1`); a rolled-back deploy never writes a newer schema, and readers validate + reset on garbage, so rollbacks cannot brick returning visitors.

## 5. Monitoring Plan

| What | Tool | Signal |
|------|------|--------|
| Traffic + Web Vitals | Vercel Analytics (@vercel/analytics already in package.json) + Speed Insights | Sessions, LCP/CLS/INP baselines for D9 |
| Function errors | Vercel function logs + log drain review cadence (weekly) | 4xx/5xx spikes on /api/* |
| Uptime | Free external ping (e.g. UptimeRobot, 5-min interval) on / and /api/jobs?category=qa | Down alerts → Soyed's email |
| Quota health | Google AI Studio dashboard + RapidAPI dashboard, checked weekly pre-launch, monthly after | Approaching-limit warnings |
| Forms/bookings | Web3Forms dashboard, Calendly notifications | Raven delivery, session bookings |
| Custom game events | Vercel Analytics custom events: section_opened, game_started, game_completed, level_up, chat_opened, quest_accepted, raven_sent, session_booked | Success metrics feed (D1 §5, D8) |

Alert response: any production 5xx spike or uptime alert → instant rollback first, diagnose second.

## 6. Caching & Headers (as deployed)

- `vercel.json` already ships: X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, X-Frame-Options DENY, Permissions-Policy (camera/mic/geo off), and a CSP allowing only self + Google Fonts + Calendly + Web3Forms + Vercel vitals.
- Static assets: Vercel default immutable caching for hashed files.
- /api/jobs sets `Cache-Control: s-maxage=21600, stale-while-revalidate=3600` in the function response (NOT in vercel.json — verify at build time it is emitted).
- /api/chat and /api/generate-quiz: `Cache-Control: no-store`.

## 7. Open Items

- [ ] Add `.github/workflows/ci.yml` (repo currently has no workflow).
- [ ] Decide function region (default vs sin1) with latency measurements.
- [ ] Configure UptimeRobot monitors post first production deploy.
- [ ] Wire custom analytics events once sections exist.
