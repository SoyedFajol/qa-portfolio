# D5 — Functional Specification Document (FSD)

Project: Soyed's Gamified 3D QA Portfolio
Status: DRAFT v0.1
Owner: BA + QA
Last updated: 2026-07-07

Scope: behavior spec for all 12 site sections plus global systems. Every stated rule maps to FTL cases in D6.

---

## 0. Global Systems (apply to every section)

### 0.1 Non-Negotiables (Master Prompt — repeated in D1, D2, D6, D10)
1. No API keys in frontend code (Web3Forms public key is the single exception).
2. **Privacy rule: no phone number or home address anywhere** — UI, metadata, AI answers. Contact = email, GitHub, LinkedIn only; Bugsy refuses phone/address requests.
3. No LinkedIn scraping — jobs via legitimate aggregators only.
4. AI never breaks the site — validate, retry once, hardcoded fallback.

### 0.2 Navigation & 3D fallback
- 3D checkpoint click OR nav menu entry opens the same section overlay; menu lists all 12 sections and is always reachable (hamburger on mobile).
- WebGL unavailable → non-3D mode: hero banner + nav menu + all overlays fully functional. No blank screen, no crash.
- Section overlays: pixel dialog frame, close button (Esc key + X + click-outside), scroll-locked background, focus moved into the dialog on open and restored on close.

### 0.3 Save system (`qa-portfolio-save-v1`)
- Persisted: xp, level, progress, achievements, mute. Loaded on boot with full shape validation.
- Corrupted/garbage value → silent reset to defaults + toast "Save file corrupted — starting a new game!". Site continues.
- Reset option (in Learning Game and/or settings): confirmation dialog → clears the key → state resets live, no reload needed.
- `chatMessageCount` is in-memory only; the 20-message Bugsy cap resets each visit by design.

### 0.4 Sound & motion
- Retro sounds (blip, pickup, level-up) behind a mute toggle; mute state persisted; default unmuted but NO audio before first user interaction (browser autoplay policy).
- `prefers-reduced-motion`: particles/camera drift stop, typewriter renders instantly, Framer transitions become fades; every feature stays usable.

### 0.5 Error/empty visual language
- Errors are in-world: friendly pixel-styled messages, never raw stack traces or provider error strings.
- Loading states: pixel skeletons/loaders per feature; global `<Suspense>` pixel loading screen for the 3D chunk; no white flash.

### 0.6 404
- Unknown SPA route → "GAME OVER — level not found" screen with a "Continue?" button returning to /.

---

## 1. Start / Intro

- Initial state: night-sky scene (or static fallback), blinking "PRESS START" (Press Start 2P font).
- Interactions: click/tap/Enter on PRESS START → typewriter reveal: "SOYED MD. SOLAMAN FAJUL — Junior SQA Engineer · Builder of fun things" → scroll hint appears; first interaction also unlocks audio.
- Keyboard: PRESS START focusable; Enter/Space activates.
- Reduced motion: no blink animation; text renders instantly.
- Edge: re-visiting with an existing save → intro still shows (no skip in v1) but XP bar reflects saved level immediately.

## 2. About / My Journey

- Content: exactly the 6 story-arc milestones from lib/profile.js `story` (AIUB CSE student → competitive programmer → CMED intern → BRAC IT Jr. SQA → current quest: automation & AI-powered QA → side quest: building fun websites), as signposts along the 3D path.
- Interactions: scrolling walks the hero past signposts; each signpost readable in-world AND in the About overlay (nav fallback lists the same 6 milestones in order).
- Validation: milestone content must match profile.js verbatim — no invented facts.
- Empty state: none (static data).
- Error state: none (no network).

## 3. Skills

- Content: RPG inventory grid from profile.js `skills`: Testing (Manual 3/3 strong, API 3/3 strong, Automation 2/3 working, Security 1/3 learning), Frameworks (Playwright 2, Selenium 2), Programming (Java 3, Python 2, C++ 2), Databases, Tools, APIs chips.
- "Secret Class: Developer" bonus panel: Spring Boot + Microservices, visually distinct (bonus/loot styling).
- Level bars render 1–3 pips with text labels (strong/working/learning) — labels not color-only (accessibility).
- Rule: bars must match profile.js exactly; honest levels are a brand feature. No percentages implying false precision.
- Empty/error: none (static).

## 4. Projects

- Content: arcade cabinets: (a) this portfolio (live URL + GitHub repo), (b) CMED hospital appointment system (Spring Boot, described from profile.js bullets — no fake live link), (c) GitHub placeholder cabinets linking https://github.com/SoyedFajol.
- Interactions: cabinet hover/tap → glow + short description; action buttons: "Play" (live link, new tab, rel=noopener) and/or "Source" (GitHub).
- Empty state: placeholder cabinets read "Insert coin — new game in development" and link to the GitHub profile.
- Validation: no dead links; CMED cabinet has no live/demo button (internal project).

## 5. Interview Questions — "Question Dungeon"

- Content: seeded local data — 5 junior-to-mid questions with model answers per topic tab (Manual, Automation, API, SQL, Coding/DSA, AI in QA, Interview/HR). Answers reflect real practice: test cases, bug reports, Postman/Swagger workflows.
- Interactions:
  - Topic tabs switch the visible deck (active tab highlighted, keyboard-switchable).
  - Flip-cards: click/tap/Enter flips question → model answer; flip state per card.
  - Search: filters across ALL topics by substring (case-insensitive); shows count; clears with X.
  - Random dice: picks a random question from the current filter set, scrolls to it, flips it closed first.
- Empty state: search with no matches → "The dungeon is quiet… no questions match '<term>'." + clear button.
- Error state: none (local data).
- Edge: search term > 100 chars is truncated; HTML in search input is treated as text (no injection).

## 6. Roadmap

- Content: ✅ Manual Testing (done) → ✅ API Testing (done) → 🔵 Automation mastery (in progress) → 🔒 AI in QA (locked) → 🔒 Senior SQA / SDET (locked).
- Presentation: skill-tree path with states: done (green check), in-progress (pulsing blue), locked (padlock, dimmed but readable text).
- Interactions: node hover/tap shows a 1–2 line description; no unlocking mechanic (this is Soyed's real roadmap, not the visitor's).
- Reduced motion: pulsing becomes a static highlight.

## 7. Learning Game (centerpiece)

### 7.1 Flow
1. Topic select: 7 topics (Manual Testing, Automation, API Testing, SQL/Database, Coding/DSA, AI in QA, Interview/HR) with per-topic progress from the save.
2. Lesson card: short lesson text; "Start Quiz" button.
3. Quiz: 3–5 MCQs, one at a time; 4 options; select → immediate feedback; **explanation ALWAYS shown** (correct or wrong — teach, never just judge); Next button.
4. Results: score, XP earned (+ streak bonus), rank progress; "Next lesson" / "Change topic".

### 7.2 Rules
- XP/levels: QA-themed 10-rank ladder Lv1 "Bug Spotter" → Lv10 "QA Legend" (full ladder defined at build; displayed on the persistent XP bar).
- Streaks: consecutive correct answers add bonus XP; streak resets on wrong answer.
- Difficulty scales with player level (junior → mid → senior prompts).
- Achievements with toasts: "First Blood" (first correct answer), "Bug Exterminator" (10 streak), "Full Regression" (all topics completed) + ladder to be finalized; each unlocks once, persisted.
- Level-up: "LEVEL UP!" burst + sound (respecting mute/reduced-motion).

### 7.3 States
- Loading: pixel "Generating quest…" skeleton while /api/generate-quiz runs.
- AI success: quiz renders after client-side re-validation (validateQuiz).
- AI failure path: server retried once → fallback bank; UI may show a subtle "offline question bank" badge — flow identical.
- Total failure (no fallback match — should be impossible): "The quest master is asleep. Try another topic!" + back button.
- Reset: confirmation → wipes save → Lv1, 0 XP, achievements cleared.

### 7.4 Validation
- Only whitelisted topic/difficulty/count values ever sent; UI never submits free text into quiz requests.
- A quiz with duplicate correct answers, missing explanation, or non-4 options is rejected client-side → fallback (defense in depth).

## 8. Job Quest Board

- Layout: pixel wooden board; category tabs 🐞 QA/SQA · 💻 Software · 🤖 AI/ML; search box; quest-scroll cards.
- Card content (normalized contract): title, company (fallback "Unknown guild"), location, postedDate (relative "2 days ago" formatting when parseable), source, employmentType, difficulty stars (Intern/Junior ★, Mid ★★, Senior ★★★ from title regex in lib/jobs.js), "Accept Quest →" button.
- Interactions:
  - Tab switch → fetch /api/jobs?category=… (CDN-cached 6 h); loading = blank-scroll skeletons.
  - Search filters loaded results client-side (title + company, case-insensitive).
  - "Accept Quest" opens applyUrl in a new tab (rel="noopener noreferrer"); only http(s) URLs ever rendered (safeUrl guarantee).
- Empty states:
  - API OK but 0 jobs in category → "No open quests in this guild today — check another board!" + curated links.
  - Search no match → "No scrolls match '<term>'."
- Error/fallback state: fetch failure or `fallback: true` → "The quest board courier is resting…" + CURATED_LINKS (LinkedIn Jobs search, BdJobs, Wellfound).
- Disclaimer always visible: "Quests fetched from public job aggregators. Freshness may vary."
- Security: ALL displayed fields pass sanitize() (tags stripped, control chars removed, length-capped); rendered as text nodes only — never HTML.

## 9. AI Sidekick — Bugsy

- Presence: floating pixel bug/robot bobbing near the hero in 3D AND a floating chat button on every overlay (both open the same window).
- Chat window: pixel dialog; typewriter replies + retro blip; 3 starter questions ("What does Soyed do?", "What are his automation skills?", "Is he open to opportunities?"); input with live 500-char counter; send disabled when empty/over-limit/awaiting reply.
- Conversation rules (server-enforced persona): fun RPG-NPC tone; ONLY about Soyed/his work/this site; off-topic → "That quest is outside my map! Ask me about Soyed 🐞"; unknown facts → admit + suggest emailing Soyed; NEVER phone/address; 2–5 sentence replies.
- Session cap: after 20 sent messages (in-memory count) → input disabled, Bugsy: "I need a potion break! Email Soyed directly 📧" with mailto link. Resets on page reload (accepted behavior).
- History: last ≤ 10 messages sent per request; API stateless.
- States: idle (starters visible) → typing indicator (animated dots) → reply typewriter → error state (friendly apology + soyedmdsolemanfajul@gmail.com, prior conversation preserved, retry allowed).
- Accessibility: focus trap while open; Esc closes; new replies announced via aria-live=polite; typewriter skippable (tap to complete).
- Edge: rapid double-send prevented (send locked while pending); pasted 2 000-char text hard-truncated at 500 with counter warning.

## 10. Ask Me / Party Up

### 10.1 "Send a Raven" (Web3Forms)
- Fields: name (required, 1–100 chars), email (required, HTML5 + regex format check), message (required, 10–2000 chars), hidden honeypot field (must stay empty).
- Submit: disabled until valid; pending state "Releasing the raven…"; success → raven fly-off animation + "Message delivered to Soyed's inbox!" + form clears.
- Errors: per-field inline messages on blur/submit; network/API failure → "The raven got lost in a storm — email me instead: soyedmdsolemanfajul@gmail.com" (input preserved).
- Honeypot filled → silently "succeed" without sending (bot swallow).
- If WEB3FORMS_ACCESS_KEY is empty (current state) → form replaced by a mailto card (no fake-working form).

### 10.2 "Party Up" (Calendly)
- Session types framed as quests: 🐞 QA Career Chat · ⚔️ Interview Prep Duel · 🛠 Project Collab (20–30 min).
- Lazy-load: Calendly script/iframe requested only when this section opens; pixel skeleton while loading.
- CALENDLY_URL empty (current state) → "Session scrolls coming soon — send a raven instead!" placeholder linking to the raven form.
- Embed fails to load (blocked/network) → same placeholder fallback.
- Note under both panels: "Need instant answers? Talk to Bugsy, my AI sidekick!"

## 11. Side-Quest Board

- Content: CP trophies from profile.js `competitive`: 200+ Codeforces problems (+100+ other platforms), Top 15 AIUB Programming Competition 2024 & 2025, Top 10 AIUB team / 2 problems at ICPC Asia Dhaka Regional Online 2024. Optional flavor from `extras` (gaming-economics research, CP club, campus ambassador, taught kids coding).
- Presentation: trophy shelf / quest-complete stamps; hover/tap shows detail line.
- States: static content; no empty/error states.

## 12. Contact — "Join my party!"

- Content: email (soyedmdsolemanfajul@gmail.com, copy-to-clipboard + mailto), GitHub, LinkedIn (new tab, rel=noopener), resume download button.
- Resume: RESUME_URL currently empty → button shows disabled "Resume scroll being inscribed…" state (no dead link) until the PDF ships.
- **NO phone number, NO home address — verified by grep and AI-answer tests (gate B7).**
- Copy-to-clipboard: success tooltip "Copied!"; clipboard API unavailable → fallback selects the text.
