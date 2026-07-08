# D7 — Research Findings

Project: Soyed's Gamified 3D QA Portfolio
Status: DRAFT v0.1
Owner: RESEARCHER
Last updated: 2026-07-07

Method note: written from prior knowledge, NOT live browsing. Every number marked **[verify at build time]** must be re-checked against the provider's current pricing/limits page before the relevant phase ships. Free tiers change frequently.

---

## 1. Google Gemini API — free tier

- Free tier exists via Google AI Studio API keys; flash-class models are the intended choice (master prompt: "a current flash model").
- Known order-of-magnitude limits for flash models on the free tier (they have shifted repeatedly): roughly **10–15 requests/minute** and roughly **250–1,500 requests/day** depending on model generation **[verify at build time — check ai.google.dev rate-limits page for the exact model chosen]**.
- Token-per-minute caps exist but are far above our usage (short prompts/replies).
- Practical implications:
  - Portfolio traffic (tens of visitors/day, capped at 20 chat messages each) fits comfortably.
  - A single hostile visitor could burn the per-minute cap → per-IP rate limiting in the functions is required (D10 M-04), not optional.
  - Free-tier data may be used by Google to improve products **[verify current terms]** → note in Privacy Policy (gate B1); we send no visitor PII in prompts — only profile data + visitor questions.
- Provider swap risk is mitigated by the single `callAI()` helper (ADR-1).

## 2. JSearch API (RapidAPI) — free tier

- JSearch (by OpenWeb Ninja) aggregates Google for Jobs results (includes LinkedIn/BdJobs/company postings indirectly and legitimately — no scraping by us).
- Free ("Basic") plan: commonly cited at **~200 requests/month**, hard-capped, with a low per-second rate limit **[verify at build time on the RapidAPI listing — plans have changed]**.
- Overage on RapidAPI free plans typically blocks (or bills if a card is attached — do NOT attach a card).
- Math with our 6-hour CDN cache: 3 categories × 4 possible origin refreshes/day = 12 origin calls/day worst case ≈ **360/month — that EXCEEDS 200**. Mitigations, in order of preference:
  1. Raise cache to 12 h (`s-maxage=43200`) → ~180/month, inside quota.
  2. Or daily pre-fetch (Vercel cron) to 3 calls/day ≈ 90/month with 24 h cache.
  - **Recommendation: plan for 12-hour cache or cron pre-fetch at build time; keep 6 h only if the verified quota is ≥ 500/month.** (Flagged as a deliberate deviation candidate from the master prompt's 6-hour figure.)
- Alternative: **Jooble API** — free key by request, per-country endpoints, decent BD coverage **[verify response fields]**. Behind the same /api/jobs contract.

## 3. Web3Forms — free tier

- Free plan: commonly **250 submissions/month**, unlimited forms, email notifications, no backend needed **[verify at web3forms.com/pricing]**.
- The access key is explicitly public-safe by design (their model: key only routes submissions to your verified email) — consistent with our "one allowed public key" rule.
- Includes honeypot/botcheck support natively (`botcheck` hidden field) — our honeypot approach matches their docs.
- Failure mode: quota exhausted → API returns error → our "raven got lost" fallback + mailto covers it.

## 4. Calendly — free plan

- Free plan: 1 calendar connection, **one active event type** [verify — this is the historical free limit], unlimited one-on-one bookings, inline embed widget supported on free.
- **FINDING: the master prompt wants 3 quest-styled session types ("QA Career Chat", "Interview Prep Duel", "Project Collab") — the free plan's single-event-type limit likely forces ONE event type** (e.g. "Party Up with Soyed — 25 min") with a required "Which quest?" question in the booking form. UI can still SHOW three quest cards that all open the same event type. **[verify current Calendly free limits at build time; HALT-adjacent: if Soyed wants true separate event types, that's a paid decision.]**
- Embed requires their script from assets.calendly.com + iframe — already allowed in our CSP (script-src, frame-src). Lazy-load pattern (inject script on section open) is supported and recommended.

## 5. Three.js / R3F performance on low-end mobile (BD audience is mobile-heavy)

Patterns we will apply (all standard, evidence-backed practice):
- **Cap devicePixelRatio**: `<Canvas dpr={[1, 1.5]}>` mobile, `[1, 2]` desktop — fill-rate is the #1 killer on budget Android GPUs (Mali/Adreno entry class).
- **Instancing** (`InstancedMesh` / drei `<Instances>`) for repeated voxels, path blocks, particles — collapses hundreds of draw calls into one.
- **Low draw calls**: merge static geometry; budget < 100 on mobile; measure with r3f-perf/spector.js.
- **No real-time shadows on mobile**; fake with blob/gradient planes or baked AO tints. Shadows double render passes.
- **Frameloop discipline**: `frameloop="demand"` where possible (invalidate on scroll), pause rendering when tab hidden or overlay fully covers the canvas.
- **Particles**: single buffer-geometry points system, count scaled by device class; zero particles under reduced-motion.
- **Materials**: MeshBasic/Lambert over Standard where lighting allows; pixelated textures = tiny textures (nearest filter) — texture memory stays trivial.
- **Box-geometry characters** (per master prompt) — no skinned meshes, no GLTF payloads; animate with simple transform groups.
- **Device-class probe**: WebGL renderer string / deviceMemory heuristic → "low" preset (dpr 1, fewer particles) or non-3D fallback offer.

## 6. Font licensing — Google Fonts

- **Press Start 2P** (CodeMan38) and **Inter** (Rasmus Andersson): both under the **SIL Open Font License 1.1** — free for commercial use, embedding, and self-hosting; no attribution required on-site (license text must accompany redistributed font files).
- index.html currently loads both from fonts.googleapis.com (CSP already allows). Optional perf improvement: self-host WOFF2 to cut a connection — OFL permits this. No licensing risk either way.
- Retro sound effects: source only CC0/openly licensed (e.g. self-generated with jsfxr/ZzFX — ZzFX is MIT). Keep a license inventory line per asset (gate B5).

## 7. Comparable gamified portfolios — lessons

| Site | What it is | Lesson for us |
|------|-----------|----------------|
| bruno-simon.com | Drive a 3D car through a portfolio playground | The gold standard for "portfolio as game" buzz — but heavy on mid/low devices. Lesson: fame comes from the CONCEPT + polish, and it offers a "skip" path; we must run well on budget Android, not just impress on desktop |
| Jesse Zhou — ramen shop (jesse-zhou.com) | 3D ramen-shop scene portfolio | Baked lighting + small scene = smooth everywhere. Lesson: fake the lighting, keep the world small and dense rather than large and sparse |
| Henry Heffernan — shizuku/OS portfolio | Retro computer/OS simulation | Deep commitment to one aesthetic sells the whole experience; retro pixel look hides low poly counts gracefully |
| rleonardi.com/interactive-resume | 2D side-scrolling game resume | Scroll-as-gameplay works and is instantly understood — validates our scroll-driven journey; content remains skimmable for recruiters in a hurry |
| Various Three.js Journey student portfolios | assorted | Common failure: no fallback for WebGL/perf — recruiters on laptops with blocked GPU acceleration bounce. Our nav-menu fallback (gate H4) is a differentiator |

Unique angle none of the above have: **the QA framing — a portfolio that ships with its own visible test suite, threat model, and graceful-degradation engineering.** That is the story (see D8).

## 8. Open verification checklist (carry into build phases)

- [ ] Gemini: exact RPM/RPD for the chosen flash model + data-use terms.
- [ ] JSearch: current free-plan monthly cap + rate limit → set cache 6 h vs 12 h vs cron.
- [ ] Web3Forms: monthly cap + current botcheck field name.
- [ ] Calendly: free-plan event-type limit → one-event-type workaround wording.
- [ ] Vercel Hobby: function invocation/duration limits (generous, but confirm) + cron availability on Hobby.
- [ ] ZzFX/jsfxr license texts into /docs license inventory.
