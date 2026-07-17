# TASK LOG (append-only)

[2026-07-07] TASK: Phase 1 — Inspect existing scaffold
  ROLE:     TL
  CHANGE:   none (read-only review of pre-existing package.json, lib/*, vercel.json, index.html, configs)
  VERIFY:   manual review — React 18 + fiber v8 + drei v9 pairing correct; profile data matches Master Prompt; no phone/address present; CSP headers present
  RESULT:   PASS — decision: build on existing scaffold, do not recreate
  GATE:     B7 (groundwork), C5 (groundwork)
  DOCS:     —

[2026-07-07] TASK: Phase 1 — Repo + docs bootstrap
  ROLE:     DEVOPS + PM
  CHANGE:   git init (branch main); docs/portfolio-master-prompt-v4.md, docs/loop-protocol-v2.md persisted verbatim; folder architecture created (src/{components,scene,game,hooks,store,data,styles}, api/, tests/, docs/, public/, .github/workflows)
  VERIFY:   git status clean init; files present
  RESULT:   PASS
  GATE:     —
  DOCS:     master prompt + protocol now versioned in-repo

[2026-07-07] TASK: Phase 1 — Core scaffold implementation
  ROLE:     DEV
  CHANGE:   src/styles/index.css (palette as CSS variables + pixel UI base + reduced-motion guard); tailwind.config.js (colors mapped to CSS vars); src/game/progression.js (XP curve + 10-rank ladder Bug Spotter→QA Legend); src/store/useGameStore.js (zustand persist → qa-portfolio-save-v1, sanitizeSave corruption guard, chatMessageCount in-memory only); src/hooks/useLocalStorage.js; src/data/profile.js (re-export of lib/profile.js); src/main.jsx; src/App.jsx (Phase 1 systems-check screen); public/favicon.svg (pixel bug) + manifest.webmanifest
  VERIFY:   npm run build ✓ (three.js vendor chunk 145 kB gz 47 kB); vite preview smoke test — page title, favicon 200, manifest 200
  RESULT:   PASS
  GATE:     H5 (sanitizeSave implemented + tested), H3 (reduced-motion base CSS)
  DOCS:     README.md written

[2026-07-07] TASK: Phase 1 — Unit test suite
  ROLE:     QA
  CHANGE:   tests/setup.js (localStorage stub), tests/{progression,store,validateQuiz,jobs,profile}.test.js — 32 cases: XP boundaries, level-up, streaks, achievement idempotency, corrupted-save repair, quiz JSON contract rejection paths, XSS via crafted job title, javascript: URL rejection, phone/address privacy grep of profile module
  VERIFY:   npm test → 5 files, 32/32 passed
  RESULT:   PASS
  GATE:     A1 (validator paths tested), B7 (privacy test green), C4 (XSS normalization tested), H5 (corruption cases tested)
  DOCS:     cases to be folded into D6-FTL numbering

[2026-07-07] TASK: Phase 1 — Lint hardening + CI
  ROLE:     DEVOPS + TL
  CHANGE:   eslint-plugin-react added with react/jsx-uses-vars (fixes JSX false-positive unused-vars); stale disable-directive removed from tests/jobs.test.js; .github/workflows/ci.yml (npm ci → lint → test → build on push/PR)
  VERIFY:   npm run lint → 0 errors 0 warnings; npm test 32/32; npm run build ✓
  RESULT:   PASS (initial lint run had 4 warnings → fixed, not suppressed)
  GATE:     A7 (CI skeleton in place)
  DOCS:     —

[2026-07-07] TASK: Phase 1 — Document Suite D1–D10 first drafts
  ROLE:     BA + TL + RESEARCHER + STRATEGIST + QA + SEC (delegated batch)
  CHANGE:   docs/D1-BRD.md … docs/D10-THREAT-MODEL.md (DRAFT v0.1)
  VERIFY:   files reviewed for presence + master-prompt grounding
  RESULT:   see next entry for review outcome
  GATE:     D suite prerequisite for Phase 2
  DOCS:     D1–D10 created

[2026-07-08] TASK: Phases 2–3 — 3D world, hero, Bugsy NPC, checkpoints, signposts, overlays
  ROLE:     3D + DEV + DESIGN
  CHANGE:   src/scene/{constants,World,Hero,BugsyNpc,Checkpoints,Signposts}.jsx — scroll-driven camera rig (exp-damped lerp), voxel hero (glasses/hoodie/laptop/bug-net, walk+idle anims), floating Bugsy (click → chat), 10 crystal checkpoints + 6 story signposts, Stars/Sparkles particles, fog, mobile budget (dpr cap, shadow off, reduced counts); src/components/{SectionOverlay,IntroScreen,LoadingScreen,Hud,NavMenu,Toasts,LevelUpBurst,Typewriter}.jsx; hooks/{useFocusTrap,usePrefersReducedMotion}
  VERIFY:   npm run build ✓ (three chunk lazy, 270 kB gz); lint 0/0; manual review of anim math
  RESULT:   PASS
  GATE:     H3 (flat mode on prefers-reduced-motion), H4 (FlatWorld + MENU reach all sections without WebGL), H7 (Suspense pixel loading screen)
  DOCS:     D3-TAD scene layer as-built

[2026-07-08] TASK: Phase 4–5 — content sections + Question Dungeon
  ROLE:     DEV + BA
  CHANGE:   src/components/sections/{Journey,Skills,Projects,Roadmap,SideQuests,Contact}Section.jsx, QuestionDungeon.jsx; src/data/{sections,projects,dungeonQuestions}.js (6 topics × 5 real Q&A with model answers)
  VERIFY:   tests/dungeon.test.js (5-per-topic, unique ids, substantial answers, privacy grep) — green
  RESULT:   PASS
  GATE:     B7 (no phone/address in any content — grep-tested)
  DOCS:     —

[2026-07-08] TASK: Phase 6 — Learning Game + /api/generate-quiz
  ROLE:     DEV + QA + SEC
  CHANGE:   src/components/sections/LearningGame.jsx (topic→lesson→quiz→result, difficulty scales with level, XP 10/15/20, 70% pass); lib/fallbackQuizzes.js (7 topics, schema-validated content); api/generate-quiz.js (enum/type input validation, callAI json mode, validate → retry-once(temp 0.4) → fallback, 6 req/min/IP)
  VERIFY:   tests/fallbackQuizzes.test.js (every fallback passes validateQuiz); api smoke: bad topic 400, bad count 400, no-key → 200 fallback quiz
  RESULT:   PASS
  GATE:     A1 (all 3 contract paths exercised), C1, C2 (limiter smoke-tested)
  DOCS:     D2-TRD API contract as-built

[2026-07-08] TASK: Phase 7 — Bugsy chat (frontend + /api/chat)
  ROLE:     DEV + SEC
  CHANGE:   lib/bugsy.js (server-side system prompt: profile-grounded, injection-hardened, no-phone rule; validateChatBody); lib/ai.js (shared callAI, Gemini flash, 20s timeout, provider-swappable); api/chat.js (8 req/min/IP, 512-token cap, in-character fallback on AI failure); src/components/BugsyChat.jsx (floating button, typewriter replies, 3 starters, 500-char cap, 20-msg session cap → potion-break, error fallback with email)
  VERIFY:   tests/bugsy.test.js — 14 cases: prompt grounding, injection rules, phone-leak grep, body validation matrix; api smoke: 405/400/oversize-400/no-key-fallback/429 after burst
  RESULT:   PASS
  GATE:     A3/A4 (rules encoded + unit-tested; live-model attack set pending key), A5 (caps live, burst-tested), C1, C2
  DOCS:     D10 threat model updated to as-built

[2026-07-08] TASK: Phase 8 — Job Quest Board + /api/jobs
  ROLE:     DEV + DEVOPS
  CHANGE:   api/jobs.js (JSearch, country=bd, per-category queries, s-maxage=21600 + SWR 86400, error/no-key → fallback:true cached 300s, 10 req/min/IP); src/components/sections/JobQuestBoard.jsx (tabs, search, difficulty stars, skeleton scrolls, courier-resting fallback + curated links, per-visit category cache)
  VERIFY:   api smoke: 405, bad category 400, no-key fallback with 300s cache header; existing jobs.test.js XSS/URL normalization still green
  RESULT:   PASS
  GATE:     C4 (external data sanitized, no dangerouslySetInnerHTML)
  DOCS:     —

[2026-07-08] TASK: Phase 9 — Ask Me / Party Up
  ROLE:     DEV
  CHANGE:   src/components/sections/AskMeSection.jsx — Web3Forms raven form (client validation, botcheck honeypot, flying-raven success, error path → direct email) behind not-configured state; Calendly inline embed lazy-loaded on demand behind CALENDLY_URL placeholder ("Session scrolls coming soon")
  VERIFY:   build + lint green; both unconfigured states render (keys intentionally empty until Soyed provides them — HALT item)
  RESULT:   PASS
  GATE:     G3 pending real key (HALT: credentials)
  DOCS:     —

[2026-07-08] TASK: Phase 10 — polish & ship prep
  ROLE:     DEV + DEVOPS + SEC + STRATEGIST
  CHANGE:   rewritten src/App.jsx (routes /, /privacy, /terms, 404 GAME OVER; PRESS START gate; WebGL detect → FlatWorld; body-scroll lock under overlays; section rewards + analytics events); StaticPages (plain-language privacy/terms per gate B1/B2 incl. no-cookie-banner rationale); Vercel Analytics + trackEvent wrapper; retro WebAudio sfx + mute; public/{og.png,robots.txt,sitemap.xml}; docs/D8-STRATEGY, D9-ANALYSIS, D10-THREAT-MODEL
  VERIFY:   npm test 64/64; lint 0/0; build ✓; API smoke suite 11/11 PASS
  RESULT:   PASS
  GATE:     B1, B2, B3 (documented: no non-essential cookies), E1, E3, F3, F4 groundwork
  DOCS:     D8, D9, D10 complete — suite D1–D10 present

[2026-07-08] TASK: Owner decision — remove the AI chatbot; add full sound design (bruno-simon.com inspired)
  ROLE:     PM (scope change per Soyed) + DEV + DESIGN
  CHANGE:   REMOVED: api/chat.js, lib/bugsy.js, BugsyChat.jsx, tests/bugsy.test.js, chat state in both stores, all "Talk to Bugsy" entry points, chat copy in README/meta/privacy/terms, og.png regenerated. Bugsy stays as the 3D companion — poking him chirps + barrel-rolls + grants NPC Whisperer. ADDED sound layer in src/game/sfx.js: ambient chiptune loop (A-minor pentatonic, WebAudio scheduler, starts on PRESS START, respects mute + hidden tab), footsteps while walking (stride-distance based), checkpoint pass chimes, hover ticks, Bugsy chirp — all synthesized, zero audio assets.
  VERIFY:   grep sweep for dangling chat references (clean); npm lint/test/build; store tests updated (chatMessageCount removed)
  RESULT:   PASS
  GATE:     A2–A6 chat items now N/A (feature removed); B1/B2 pages updated to match reality
  DOCS:     README, privacy, terms updated; D9 deltas superseded by this entry

[2026-07-08] TASK: Fix 3D click-through + bruno-simon-inspired polish pass
  ROLE:     DEV + DESIGN + QA
  CHANGE:   BUG FIX: the invisible scroll track sat over the canvas and swallowed every 3D click — pointer-events-none on the track (footer opts back in) so checkpoints/Bugsy/coins are clickable again. POLISH (bruno-simon.com study): HOW TO PLAY card after PRESS START (dismisses on scroll/9s), bottom journey map with clickable checkpoint dots (smooth-scroll fast travel, visited state), speed-reactive camera FOV, click-anywhere ground ripple + tick, end-of-path fanfare toast. FRAMER MOTION pass: HUD spring entrance, staggered level-select menu, PRESS START hover/tap spring, tab micro-interactions in Dungeon + Job Board. Also swapped index.html inline <style> for a style attribute (Vite html-proxy build failure on Windows).
  VERIFY:   lint 0/0; 50/50 tests; build ✓; prod smoke after deploy
  RESULT:   PASS
  GATE:     H6 (full playthrough now actually possible by mouse), H7
  DOCS:     —

[2026-07-17] TASK: VERSION 2 — per Soyed's sketch (rounds, map-first start, more fun, more content)
  ROLE:     PM + DEV + DESIGN + 3D + BA
  CHANGE:   BRANDING: direct name — intro/manifest/meta now "Soyed Solaman — Software Engineer" (full legal name kept in profile/contact); new primary domain soyed-solaman.vercel.app added to the Vercel project (old URL still works); canonical/OG/sitemap/robots/og.png updated. STRUCTURE: world split into ROUND 1 — THE PORTFOLIO (journey, skills, projects, roadmap, resume/contact) and ROUND 2 — THE PLAYGROUND (dungeon, learning game, jobs, company codex, side-quests, ask); 3D gate arches at each round; nav menu grouped by round; journey-map dots colored per round. MAP-FIRST: WorldMap popup auto-opens after PRESS START (all stops + one-line descriptions + controls legend, click-to-travel), reopenable via new 🗺️ HUD button; replaces the HowToPlay card. CONTENT: fallback quiz bank expanded 5→15 questions per topic (105 total), sessions now 5 questions sampled per replay (validateQuiz cap 10→20, api count 5); NEW Company Codex section — 18 real BD software companies with city, focus, tags, website + careers links (no invented emails/phones; careers page framed as the reliable channel). FUN: hero JUMP (Space/ArrowUp/click, gravity arc, legs tuck, jump sfx, no page-scroll hijack) and head follows the visitor's pointer.
  VERIFY:   lint 0/0; 55/55 tests (new: companies data shape, ≥15-per-topic guard — which caught three off-by-one content bugs during authoring, sampleFallbackQuiz validity); build ✓
  RESULT:   PASS
  GATE:     F3 (meta/canonical on new domain), B7 re-checked on new content
  DOCS:     TASK-LOG; company data disclaimer in-UI

[2026-07-17] TASK: VERSION 3 — circular city loop (Soyed's sketch v2, full autonomy granted)
  ROLE:     3D + DEV + DESIGN + BA + QA
  CHANGE:   WORLD: straight path → CIRCULAR loop road (ring arcs, 1 draw call each) around a voxel MINI CITY — 15 lit buildings + beacon tower, inner street with 2 cars + 1 van driving, 4 flapping birds circling, 11 trees (some blossoming), 26 glowing flowers, garden ring; Round 1 ends at a WALKWAY GAP the hero auto-JUMPS into Round 2 (⚠️ JUMP! sign), lap ends at a crumbling CLIFF → hero falls (tilt + gravity) → toast + 25 XP lap bonus → respawn at start (the loop from the sketch). Camera follows around the ring; coins/chimes/signposts/gates/Bugsy all re-mapped to curve coordinates; coins respawn each lap. Caught + fixed a ring-geometry mirroring bug via numeric verification before ship. STRUCTURE: Side-Quest Board → "🏆 Achievement Hall", moved into ROUND 1. RESUME: /resume page generated from shared profile (career summary, UAT/ERP bullets, n8n skill — all synced from Soyed's real resume PDF), print stylesheet for clean PDF export, linked from Resume & Contact + sitemap. Phone/street address intentionally excluded (site-wide privacy rule; noted on page — references "on request"). COMPANIES: +8 (Kaz, Southtech, Astha IT, Dream71, WellDev, Field Nation, Inverse.AI Sylhet, Nascenia) → 26 total.
  VERIFY:   lint 0/0; 55/55 tests; build ✓; ring-arc/hero-path alignment verified numerically (err < 2e-15)
  RESULT:   PASS
  GATE:     H1 watch: mini city adds draw calls — mobile counts reduced; real-device pass still recommended
  DOCS:     TASK-LOG

[2026-07-17] TASK: V3.1 — bigger, living city (per Soyed: wider city, homes, people, garden, river, birds, flowers)
  ROLE:     3D + DESIGN
  CHANGE:   LOOP_RADIUS 21→26 (everything parametric followed: road, camera, gates, checkpoints); buildings 15→20 with wider bands; 4 vehicles on a wider inner street; NEW Homes — 7 voxel houses (pyramid roofs, warm lit windows, chimneys) each with a private garden plot of flowers; NEW People — 6 voxel citizens strolling the sidewalk and city (animated legs) + a greeter waving "hi! 👋" at the starting line; NEW River — glinting water arc across the garden stretch with banks, animated shimmer, water sparkles, wooden footbridge, reeds (trees/flowers placement river-aware); flowers 26→60, trees 11→16, birds 4→7 (some golden); fog/far-plane/grid/sky scaled up; mobile counts scaled proportionally.
  VERIFY:   lint 0/0; 55/55 tests; build ✓ (World chunk 8.3 kB gz)
  RESULT:   PASS
  GATE:     H1 watch stands — desktop fine, real-device mobile pass recommended
  DOCS:     TASK-LOG

[2026-07-17] TASK: V3.2 — performance pass + zoomed-out living world (per Soyed: "laggy feels, fix that; zoom out; rivers/birds/people; no collisions; a garden")
  ROLE:     3D + DEV + QA (perf)
  CHANGE:   PERFORMANCE (the lag fix): repeated geometry GPU-instanced via a reusable <Boxes> instancedMesh helper — flowers (~120 meshes→2 draws incl. garden beds + home plots), trees (→2), coins (→1, animated matrices, per-lap respawn kept), buildings (→3), hedges/reeds/rubble (→1 each); renderer shadows OFF; dpr capped 1.5 desktop/1.25 mobile; stars/sparkles/floaters trimmed. Est. ~500→~150 draw calls. CAMERA: zoomed out — higher (6.2), further back (0.052 arc), outward 4.6, base FOV 55, looks slightly ahead of the hero so more world is in frame. COLLISIONS FIXED: sidewalk walkers moved to R+4.1 (were sitting exactly on the checkpoint circle R+2.7), plaza walkers to r=9.4 (between towers ≤8 and street ≥10.1), homes pinned to river-free slots, trees/flowers river- and home-aware, buildings keep out of the garden sector. ADDED: second river across Round 1 (banks/bridge/reeds/sparkles), formal GARDEN sector inside the ring (lawn arc, 3 neat flower-bed rows, 6 hedges, animated fountain with spray sparkles), birds 7→10, people 6→9.
  VERIFY:   lint 0/0; 55/55; build ✓
  RESULT:   PASS
  GATE:     H1 — this pass exists to close it; re-check on real device
  DOCS:     TASK-LOG

[2026-07-17] TASK: V3.3 — আঁকাবাঁকা winding road, mountains, camera zoom (per Soyed)
  ROLE:     3D + DEV
  CHANGE:   ROAD: no longer a plain circle — pathPoint() now wobbles the radius ±2.5 over 5 bends per lap (proper derivative-based tangent/normal so hero heading, camera, checkpoints, coins, gates all follow the bends); road drawn with a new PathRibbon custom BufferGeometry (exact-fit triangle strip along the curve, 1 draw call per arc) replacing the circular RingArc road. Collision re-pass for the wavy edge: sidewalk walkers → R+5.4, trees → R+5.6 min, homes → R+5.6 slots, roadside flowers now placed RELATIVE to the winding road (hug the bends, never on asphalt). MOUNTAINS: 13 low-poly flat-shaded peaks (3 shades, snow caps on the tall ones) ringing the horizon at r=52–66, hazy in the fog. ZOOM: uiStore zoom (0.55–2.4) eased in the camera rig — HUD 🔍+/🔍− buttons + Ctrl/Cmd+scroll (plain scroll still walks); map legend updated.
  VERIFY:   lint 0/0; 55/55; build ✓
  RESULT:   PASS
  GATE:     —
  DOCS:     TASK-LOG

[2026-07-17] TASK: V3.4 FINAL — showcase polish (per Soyed: billboard in the middle, clean, informative, production-ready)
  ROLE:     DESIGN + DEV + PM + BA
  CHANGE:   CITY BILLBOARD: double-sided glowing billboard mounted on the beacon tower — front (faces the starting line): "WELCOME TO SOYED SOLAMAN'S PORTFOLIO CITY — this whole world is my resume · scroll the road, open the crystals, earn XP"; back (faces Round 2): playground pitch + "HIRE THE PLAYER 🐞 · TESTED LIKE PRODUCTION"; pulsing screen glow, crisp Html-transform text. ANALYSIS/CLEANUP: stale "Talk to Bugsy" line on the intro fixed (chat removed 07-08); intro copy now explains the game in one breath; end-of-path + menu + 2D footers gained Resume and Source(GitHub) links + a build credit line; index.html meta description rewritten around the city/rounds/resume; README intro rewritten to describe v3 accurately; D9 got a "Final version analysis" section (what shipped vs plan, quality position, open owner items).
  VERIFY:   lint 0/0; 55/55 tests; build ✓
  RESULT:   PASS — production-ready for showcase
  GATE:     F3 refreshed; remaining opens are owner-action items (keys, device pass, launch post)
  DOCS:     README, D9, TASK-LOG

[2026-07-17] TASK: V3.5 — Camp Nou (per Soyed)
  ROLE:     3D + DESIGN
  CHANGE:   ⚽ Voxel Camp Nou homage outside the loop at the Round-2 landing (u=0.5, r=43, faces the city): three oval blaugrana tiers (#004d98/#a50044) + dark outer shell, green pitch with halfway line, center circle, goals and a ball on the spot, four floodlight towers with pulsing heads, golden crowd sparkles, and a "CAMP NOU · BARCELONA · MÉS QUE UN CLUB" name board. Fan-tribute only: club colors + name, no crest/logo used (B4 posture: personal non-commercial homage).
  VERIFY:   lint 0/0; 55/55; build ✓; placement checked clear of river band and road reach
  RESULT:   PASS
  GATE:     B4 note recorded
  DOCS:     TASK-LOG

[2026-07-17] TASK: V3.6 — REHEL 10 avatar, the beach, the park (per Soyed's photo + request)
  ROLE:     3D + DESIGN
  CHANGE:   AVATAR: hero redesigned in the Argentina 2026 kit from Soyed's photo — white jersey with three albiceleste stripes front & back, sky-blue collar and sleeves with bare forearms, dark shorts over white socks, and "REHEL / 10" rendered crisply on the back (Html transform); glasses, laptop and bug net stay. BEACH 🏖️: sandy shore beyond the Round-2 river (sand arc, animated open sea to the horizon with a glowing surf line and water sparkles, 5 leaning palms with 4-frond crowns, red umbrella, yellow towel, beach ball) — regular trees excluded from the sector. PARK 🌳: new sector inside the ring (0.79–0.94): lawn, 2 wooden benches, 3 glowing lamp posts, a slide, and a swing set whose two swings actually swing; city buildings now keep out of garden+park sectors.
  VERIFY:   lint 0/0; 55/55; build ✓
  RESULT:   PASS
  GATE:     —
  DOCS:     TASK-LOG
