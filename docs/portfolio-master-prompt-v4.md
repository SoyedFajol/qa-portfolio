# 🎮 MASTER PROMPT v4 — Soyed's Gamified 3D QA Portfolio (real data + Job Board + AI Sidekick + Book-a-Session)

> **How to use:** Paste **PART 1 (Project Brief + My Data)** first and keep it in context. Then feed the **Build Phases** one at a time. Run and check the app after each phase before moving on.

---

## PART 1 — PROJECT BRIEF (paste first, always keep in context)

You are my senior frontend engineer. We are building my personal portfolio website. Read this entire brief before writing any code. All personal content below is REAL — use it exactly, do not invent facts about me.

### 👤 MY REAL DATA (use everywhere, no placeholders)

**Name:** Soyed Md. Solaman Fajul
**Title:** Junior SQA Engineer @ BRAC IT Services Ltd. · Builder of fun things
**Location:** Dhaka, Bangladesh
**Email:** soyedmdsolemanfajul@gmail.com
**GitHub:** https://github.com/SoyedFajol
**LinkedIn:** https://www.linkedin.com/in/soyed-md-solaman-fajul-a492b6214/

**Education:** B.Sc. in Computer Science & Engineering, American International University-Bangladesh (AIUB), CGPA 3.44

**Experience (journey milestones AND About level content):**
1. **Jr. SQA Engineer — BRAC IT Services Ltd.** (May 2025 – Present)
   - Testing microservices-based enterprise applications (university & multi-module business platforms)
   - Manual testing, test case writing, bug reporting across multiple modules
   - RESTful API testing with Postman & Swagger
   - Automation testing contributions + quality documentation
   - Agile/Scrum, cross-functional teams
2. **Java Developer Intern — CMED Health Ltd.** (Feb 2025 – Apr 2025)
   - Spring Boot hospital appointment management system
   - Microservice backend development
   - QA collaborator: API testing & business-logic validation
   - Clean Java code + relational database integration

**Competitive Programming (side-quest achievements):**
- 200+ problems on Codeforces, 100+ on other platforms
- Top 15 — AIUB Programming Competition 2024 & 2025
- Top 10 AIUB team — solved 2 problems in ICPC Asia Dhaka Regional Online Contest 2024

**Research/Extra (optional flavor):**
- Research: Economics & Psychology of Gaming in Bangladesh — player behavior prediction using ML
- AIUB Competitive Programming Club; Campus Ambassador (Locus, Creative Wings); taught kids coding

**Skills (inventory — honest level bars: strong / working / learning):**
- **Testing:** Manual Testing (strong), API Testing (strong), Automation Testing (working), Security Testing (learning)
- **Automation Frameworks:** Playwright (working), Selenium (working)
- **Programming:** Java (strong), Python (working), C++ (working — competitive programming)
- **Databases:** MySQL, SQL, PostgreSQL
- **Tools:** Jira, Postman, Swagger, Git
- **APIs:** RESTful API, third-party API integration
- **Backend ("Secret Class: Developer" bonus):** Spring Boot, microservices

**Story arc for the scroll journey (in order):**
① AIUB CSE student discovers coding → ② Falls in love with competitive programming (200+ problems, ICPC) → ③ Java Developer Intern at CMED Health → ④ Levels up to Jr. SQA Engineer at BRAC IT → ⑤ Current quest: mastering automation & AI-powered QA → ⑥ Side quest (always active): building fun, informative websites like this one.

⚠️ **Privacy rule:** Do NOT display my phone number or home address anywhere on the site. Contact = email, GitHub, LinkedIn only. The AI sidekick must also refuse to share phone/address.

### 🎮 The Core Concept
My portfolio is a **pixel/retro RPG game world rendered in 3D**. The visitor is a player entering my world. A **pixel-art character representing ME** (glasses, hoodie, laptop, bug-catching net) walks through my journey.

- **Scrolling moves the character forward** through a 3D pixel world (scroll-driven camera + walk animation).
- Along the path are **clickable glowing "levels"** opening sections: Skills, Projects, Interview Questions, Roadmap, Learning Game, Job Quest Board, Ask Me / Party Up, Contact.
- A **floating AI sidekick NPC** follows the player and can be talked to at any time (details below).
- Everything animated: particles, glowing checkpoints, idle/walk animations, level-up bursts, smooth transitions.

### 🛠 Tech Stack (do not deviate)
- **React 18 + Vite**
- **Three.js via @react-three/fiber + @react-three/drei**
- **Framer Motion**, **Tailwind CSS**, **zustand**, **localStorage** (no login)
- **Vercel** deployment + **Vercel Serverless Functions** (`/api`) — ALL external API keys (AI, jobs) live ONLY in Vercel environment variables, NEVER in frontend code.
- **AI provider:** use the **Google Gemini API free tier** (model: a current flash model) for BOTH the quiz generator and the chatbot — it is free at portfolio traffic levels. Structure the serverless code so the provider is swappable later (one `callAI()` helper used by both endpoints).

### 🎨 Visual Direction
- Retro pixel RPG meets modern 3D: low-poly/voxel blocks, pixelated textures, chunky UI.
- Palette: deep night-sky + neon green, purple, yellow, warm orange. Exact hex codes as CSS variables.
- Fonts: "Press Start 2P" (headings) + clean body font.
- Game UI: XP bars, pixel dialog boxes with typewriter text, coin/star pickups, "LEVEL UP!" bursts, achievement toasts. Optional retro sounds with mute toggle.

### 🗺 Site Sections (each is a "level")
1. **Start / Intro** — "PRESS START" → "SOYED MD. SOLAMAN FAJUL — Junior SQA Engineer · Builder of fun things".
2. **About / My Journey** — Scroll path with the 6 story-arc milestone signposts.
3. **Skills** — RPG inventory grid, honest level bars, "Secret Class: Developer" bonus.
4. **Projects** — Arcade cabinets: (a) this portfolio, (b) CMED hospital appointment system, (c) GitHub placeholder slots (https://github.com/SoyedFajol).
5. **Interview Questions** — "Question Dungeon": topic tabs, flip-cards, search, random dice.
6. **Roadmap** — ✅ Manual Testing → ✅ API Testing → 🔵 Automation mastery → 🔒 AI in QA → 🔒 Senior SQA / SDET.
7. **Learning Game (centerpiece)** — below.
8. **Job Quest Board** — below.
9. **AI Sidekick Chatbot (NEW)** — below.
10. **Ask Me / Party Up With Me (NEW)** — below.
11. **Side-Quest Board** — CP trophies: Codeforces 200+, ICPC Regional, AIUB Top 15.
12. **Contact** — "Join my party!": email, GitHub, LinkedIn, resume download. (No phone.)

### 🕹 The Learning Game — Mechanics
- **Topics:** Manual Testing, Automation (Selenium/Playwright), API Testing, SQL/Database, Coding/DSA, AI in QA, Interview/HR.
- **Loop:** ① Read short lesson card → ② 3–5 multiple-choice questions → ③ XP, level up, unlock next task.
- **AI-generated:** `POST /api/generate-quiz` (Vercel serverless → Gemini). Input `{ topic, difficulty, count }`; strict JSON-only output `{ lesson, questions: [{ question, options: [4], correctIndex, explanation }] }`. Validate; retry once; hardcoded fallback bank per topic.
- **Progression:** XP, streak bonuses, QA-themed ranks (Lv1 Bug Spotter → Lv10 QA Legend — invent full ladder). Difficulty scales with level.
- **Feedback:** always show explanation — teach, never just judge.
- **Persistence:** localStorage `qa-portfolio-save-v1` + Reset option. **Achievements:** "First Blood", "Bug Exterminator (10 streak)", "Full Regression", etc.

### 📜 Job Quest Board — Live Job Openings
Live QA/SQA, Software Engineering, and AI job openings in Bangladesh, styled as a pixel wooden quest board with pinned quest scrolls.
- **Reality check:** LinkedIn has NO free public jobs API; scraping it violates their terms — do NOT attempt. Primary source: **JSearch API (RapidAPI free tier)** — aggregates Google for Jobs (which includes LinkedIn/BdJobs/company postings). Alternative: **Jooble API**. Provider swappable behind one serverless function.
- `GET /api/jobs?category=qa|software|ai` → per-category queries ("QA engineer in Dhaka, Bangladesh", "software engineer Bangladesh", "AI engineer Bangladesh"), normalized to `{ id, title, company, location, postedDate, applyUrl, source, employmentType }`.
- **Cache aggressively:** 6-hour CDN cache headers (`s-maxage=21600`) so visitors don't burn the free quota.
- **UI:** category tabs (🐞 QA/SQA · 💻 Software · 🤖 AI/ML), search, difficulty stars from title (Intern/Junior ★, Mid ★★, Senior ★★★), "Accept Quest →" opens real apply URL. Loading skeletons as blank scrolls.
- **Graceful fallback:** "The quest board courier is resting…" + curated links (BdJobs QA search, LinkedIn Jobs search URL, Wellfound). Disclaimer: "Quests fetched from public job aggregators. Freshness may vary."

### 🤖 AI Sidekick Chatbot (NEW SECTION + floating companion)
A chatbot that answers visitor questions **about me** — my experience, skills, projects, availability — like a helpful game companion NPC.

**Character & placement:**
- A small **pixel bug/robot sidekick** (name it something fun, e.g., "Bugsy") that floats near the player character in the 3D world AND appears as a floating chat button on every section overlay.
- Clicking it opens a pixel dialog-box chat window with typewriter-animated replies, retro blip per message, and 3 suggested starter questions ("What does Soyed do?", "What are his automation skills?", "Is he open to opportunities?").

**Architecture:**
- `POST /api/chat` Vercel serverless function → Gemini free tier via the shared `callAI()` helper.
- The system prompt is built server-side by injecting my full profile data (import the same data used in `/src/data/profile.js` — keep one shared source, e.g., a `/lib/profile.js` importable by both frontend and api). This makes answers grounded in MY real facts.
- **System prompt rules for Bugsy:** speak in a fun, friendly RPG-NPC tone with light gaming flavor; ONLY answer questions about Soyed, his work, skills, projects, and this website; politely deflect off-topic requests ("That quest is outside my map! Ask me about Soyed 🐞"); NEVER invent facts not in the profile — if unknown, say so and suggest emailing Soyed; NEVER share phone number or address; keep answers short (2–5 sentences).
- Send the last ~10 messages as conversation history from the frontend (the API is stateless).
- **Abuse/cost protection:** limit message length (500 chars), max ~20 messages per visitor session (then Bugsy says "I need a potion break! Email Soyed directly 📧"), and basic rate limiting in the function.
- **Graceful fallback:** if the AI call fails, Bugsy replies with a friendly error + Soyed's email.

### 🤝 Ask Me / Party Up With Me (NEW SECTION)
A section where visitors can ask ME (the real human) a question or book a session with me — for interview prep help, QA career chat, collaboration, or mentoring juniors.

**Two panels, RPG-styled:**
1. **"Send a Raven" (Ask Me Anything):** a pixel form — name, email, question/message — submitted via **Web3Forms** (free, no backend needed; the access key is public-safe by design). Success state: animated raven/pigeon flies off + "Message delivered to Soyed's inbox!". Basic validation + honeypot spam field.
2. **"Party Up" (Book a Session):** an embedded **Calendly** (free plan) inline widget for booking a 20–30 min session with me. Frame the session types as quests: "🐞 QA Career Chat", "⚔️ Interview Prep Duel", "🛠 Project Collab". Lazy-load the Calendly embed only when this section opens (performance). Until I create my Calendly, use a placeholder constant `CALENDLY_URL` in profile.js with a TODO comment.
- Below both: note that visitors can also just talk to Bugsy (the AI sidekick) for instant answers about me.

### ✅ Non-negotiable quality rules
- Fully responsive; simplified 3D on mobile; touch-friendly scroll journey.
- Performance: lazy-load 3D + Calendly embed, `<Suspense>` pixel loading screen, 60fps target, capped pixel ratio.
- Accessibility: nav menu fallback (all content reachable without 3D), `prefers-reduced-motion`, keyboard navigable, alt text; chat window focus-trapped and screen-reader friendly.
- Architecture: `/src/components`, `/src/scene`, `/src/game`, `/src/hooks`, shared profile data importable by both frontend and `/api`. Small focused files.
- No API keys in frontend code (Web3Forms access key is the one allowed public key). No phone number anywhere, including AI answers. No LinkedIn scraping.

When I say "start", scaffold the project and show me the folder structure first.

---

## PART 2 — BUILD PHASES (paste one at a time)

### Phase 1 — Scaffold
"Start. Scaffold Vite + React + Tailwind + @react-three/fiber per the brief. Folder structure, palette as CSS variables, fonts, zustand store (xp, level, progress, achievements, mute, chatMessageCount), localStorage hook (`qa-portfolio-save-v1`), and shared profile data module with ALL my real data (importable by frontend and /api). Show file tree + configs. No 3D yet."

### Phase 2 — 3D World + My Character + Sidekick
"Build the 3D pixel world: night sky, low-poly path, particles, my voxel hero (glasses, hoodie, laptop, bug net — box geometry, no external models), AND the small floating sidekick NPC 'Bugsy' that bobs alongside the player. Scroll-driven camera + walk animation, idle when stopped. 'PRESS START' intro with typewriter text. Reduced-motion and mobile fallbacks."

### Phase 3 — Checkpoints + Section Shells
"Add glowing clickable checkpoints for every section (including Job Quest Board and Ask Me / Party Up). Pixel dialog overlays with close buttons. Animated empty shells for all sections. Place the 6 journey milestone signposts."

### Phase 4 — Skills, Projects, Roadmap, Side-Quests, Contact
"Fill in: Skills inventory with level bars + 'Secret Class: Developer'; Projects cabinets (this portfolio, CMED hospital system, GitHub placeholders); Roadmap with my real states; Side-Quest trophy board; 'Join my party' Contact (email, GitHub, LinkedIn, resume — NO phone)."

### Phase 5 — Interview Question Dungeon
"Build the Question Dungeon: topic tabs, flip-cards, search, random dice. Seed 5 strong junior-to-mid questions per topic with model answers reflecting real practice (test cases, bug reports, Postman/Swagger workflows)."

### Phase 6 — Learning Game + AI
"Build the Learning Game: topic select, lesson card, quiz flow, XP/ranks/streaks/achievements, localStorage, and `/api/generate-quiz` using the shared `callAI()` Gemini helper — strict JSON output, validation, one retry, hardcoded fallbacks. Walk me through getting a free Gemini API key and adding it to Vercel env vars."

### Phase 7 — Bugsy the AI Sidekick Chat
"Build the chatbot per the brief: `/api/chat` using the same `callAI()` helper, server-side system prompt injected with my profile data and all of Bugsy's personality/safety rules (on-topic only, no invented facts, no phone/address, short answers). Frontend: floating Bugsy button everywhere, pixel chat window, typewriter replies, 3 starter questions, 10-message history sent per request, 500-char input limit, 20-message session cap with the potion-break message, and graceful error fallback with my email."

### Phase 8 — Job Quest Board
"Build the Job Quest Board: `/api/jobs` with JSearch (RapidAPI) per-category Bangladesh queries, normalized response, 6-hour CDN caching, env var key. Frontend: quest-scroll cards, tabs, search, difficulty stars, 'Accept Quest' links, skeletons, and the graceful fallback with curated links. Walk me through the free RapidAPI key setup."

### Phase 9 — Ask Me / Party Up
"Build the Ask Me / Party Up section: 'Send a Raven' form via Web3Forms with validation, honeypot, and the raven success animation; 'Party Up' lazy-loaded Calendly inline embed using CALENDLY_URL from profile (placeholder + TODO if unset, showing a 'Session scrolls coming soon — send a raven instead!' state). Walk me through Web3Forms and Calendly free setup."

### Phase 10 — Polish & Ship
"Final pass: loading screen, transitions, retro sounds + mute toggle, pixel bug favicon, SEO meta + OpenGraph ('Soyed Md. Solaman Fajul — Junior SQA Engineer'), 404 'GAME OVER — level not found', Lighthouse check, and step-by-step Vercel deployment listing ALL env vars (GEMINI_API_KEY, RAPIDAPI_KEY)."

---

## PART 3 — HANDY FOLLOW-UP PROMPTS

- "The 3D scene lags on mobile — profile and reduce draw calls/particles."
- "Bugsy sometimes answers off-topic questions — tighten the system prompt and show me test cases proving it deflects."
- "Bugsy invented a fact about me — make the system prompt stricter: profile data only."
- "The AI returns broken JSON in quizzes — harden the parser and prove the fallback works."
- "The jobs API quota ran out — increase cache time and add a daily pre-fetch strategy."
- "Switch the AI provider from Gemini to another API behind the same callAI() helper."
- "Fetch my public repos from GitHub (username: SoyedFajol) and auto-fill Projects."
- "Write 10 more [topic] interview questions at junior level with model answers."
- "Here's my real Calendly link: [paste] — wire it up."
- "Add a downloadable resume — here's the PDF: [attach file]."
