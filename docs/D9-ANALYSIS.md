# D9 — ANALYSIS DOC (owner: BA + PM) — v1.0 (post-build)

## Shipped vs. planned (Master Prompt v4)

| Phase | Planned | Shipped | Notes |
| --- | --- | --- | --- |
| 1 | Scaffold, palette, store, profile, tests, CI | ✅ | commit 7dbf241 |
| 2 | 3D world, voxel hero, Bugsy NPC, scroll camera, PRESS START | ✅ | box-geometry only, no external models |
| 3 | Checkpoints + section overlays + 6 signposts | ✅ | overlays focus-trapped, Esc-closable |
| 4 | Skills, Projects, Roadmap, Side-Quests, Contact | ✅ | honest level bars; no phone anywhere |
| 5 | Question Dungeon | ✅ | 6 topics × 5 Q&A, search + dice |
| 6 | Learning Game + /api/generate-quiz | ✅ | validate → retry → fallback chain smoke-tested |
| 7 | Bugsy chat + /api/chat | ✅ | server-side system prompt, caps, 429 limiter |
| 8 | Job Quest Board + /api/jobs | ✅ | 6h CDN cache; curated-links fallback |
| 9 | Ask Me / Party Up | ✅ | Web3Forms + Calendly both behind graceful "not configured" states |
| 10 | Polish & ship | ✅ | SEO/OG/robots/sitemap, privacy, terms, 404, analytics, sounds+mute |

## Known deltas / deferred (need Soyed)
1. `WEB3FORMS_ACCESS_KEY`, `CALENDLY_URL`, `RESUME_URL` are placeholder-empty
   in lib/profile.js — UI shows friendly "coming soon" states until set.
2. `GEMINI_API_KEY` / `RAPIDAPI_KEY` must be set in Vercel env vars — until
   then chat/quiz/jobs run on their fallbacks (site fully usable).
3. Search Console + Bing submission (gate F1/F2) and the LinkedIn launch post
   (gate F5) are human-account actions.
4. Real-device Android performance pass (gate H1/H2) needs physical hardware.

## Metric baseline
To be filled ~2 weeks post-launch from Vercel Analytics (targets in D8).

## Top 5 v2 candidates
1. Wire real Calendly + resume PDF (highest conversion impact, zero code).
2. GitHub API auto-populated Projects arcade.
3. Playwright E2E smoke suite in CI (fits the brand; gate H6 automation).
4. More dungeon content + difficulty filter.
5. Bangla language toggle for local recruiters.


## Final version analysis (v3.4 — 2026-07-17, showcase-ready)

**What the product is now:** an endless-loop 3D city world. Compared to the
Master Prompt v4 baseline, the shipped product ADDS: rounds structure with a
gap-jump and cliff-respawn loop, a living mini city (billboard, towers,
traffic, citizens, birds, two rivers, gardens, mountains), a winding road,
camera zoom, a world-map-first UX, a company codex (26 real BD companies), a
print-ready in-site resume, jump/head-tracking hero controls, a synthesized
chiptune sound engine, and a 105-question offline quiz bank. It REMOVED one
planned feature deliberately: the AI chatbot (owner decision, 2026-07-08).

**Quality position at ship:** 55 unit tests green in CI on every push;
serverless endpoints validated + rate-limited + fallback-tested; instanced
rendering keeps the scene ~150 draw calls; accessibility fallback (2D mode,
reduced motion, keyboard, focus traps) intact; privacy rule (no phone/street
address) enforced by tests and honored on the resume page.

**Still open (needs the owner):** GEMINI_API_KEY + RAPIDAPI_KEY env vars,
WEB3FORMS_ACCESS_KEY + CALENDLY_URL constants, real-device mobile perf pass
(H1/H2), Search Console/Bing submission (F1/F2), launch post approval (F5).
