# D1 — Business Requirements Document (BRD)

Project: Soyed's Gamified 3D QA Portfolio
Status: DRAFT v0.1
Owner: BA (Business Analyst)
Last updated: 2026-07-07

---

## 1. Business Goals

| # | Goal | Why it matters |
|---|------|----------------|
| G1 | Get Soyed Md. Solaman Fajul (Junior SQA Engineer, BRAC IT Services Ltd., Dhaka) noticed by recruiters and hiring managers | A junior QA CV looks like every other junior QA CV; a playable, QA-tested game portfolio does not |
| G2 | Prove QA skill by demonstration, not claim | The portfolio itself ships with a visible test suite (FTL), threat model, and fallback engineering — "the QA engineer whose portfolio IS a QA-tested game" |
| G3 | Help junior QA peers learn | Learning Game (AI quizzes), Question Dungeon, and live Job Quest Board give peers a reason to visit, return, and share |
| G4 | Open real conversation channels | Bugsy (AI sidekick) for instant answers; "Send a Raven" (Web3Forms) and "Party Up" (Calendly) for human contact |
| G5 | Zero running cost | Free tiers only: Vercel, Gemini, JSearch/RapidAPI, Web3Forms, Calendly, Google Fonts |

## 2. Stakeholders

| Stakeholder | Role | Interest |
|-------------|------|----------|
| Soyed Md. Solaman Fajul | Owner / subject | Career outcomes, honest self-presentation, privacy |
| Recruiters (BD + remote) | Primary audience | Fast signal: is this candidate worth a call? |
| Hiring managers / QA leads | Primary audience | Depth signal: real testing practice, engineering judgment |
| Junior QA peers / students | Secondary audience | Learning content, job leads, mentoring sessions |
| Third-party providers | Dependencies | Gemini, RapidAPI/JSearch, Web3Forms, Calendly, Vercel — terms must be respected |

## 3. Personas

### P1 — "Rima" the Recruiter (Dhaka tech recruiter, mobile-first)
- Opens the link from LinkedIn on a mid-range Android phone, gives it 60–90 seconds.
- Needs: name, title, skills, experience, and contact reachable in under 3 taps — even if the 3D scene is slow on her device.
- Fears: broken pages, slow loads, cannot find the resume.
- Design consequence: nav fallback menu, fast mobile path, resume + email always one click away.

### P2 — "Mahin" the Hiring Manager (QA Lead at a BD software house, desktop)
- Spends 5–10 minutes; pokes at things to see if they break.
- Needs: evidence of real QA practice — test cases, bug thinking, API testing knowledge, honest skill levels.
- Will try to break Bugsy (off-topic questions, prompt injection) and judge how gracefully it fails.
- Design consequence: visible FTL/quality docs, honest "learning" skill bars, hardened AI with graceful fallbacks.

### P3 — "Nusrat" the Junior QA Peer (final-year student / fresher, low-end Android)
- Comes for the Learning Game and Job Quest Board; may book a mentoring session.
- Needs: free learning loop with explanations, real BD job links, a way to ask questions.
- Design consequence: XP/achievements persistence, teach-not-judge quiz feedback, curated job fallbacks, Calendly + raven form.

## 4. User Stories with Acceptance Criteria

| ID | As a… | I want… | Acceptance criteria |
|----|-------|---------|---------------------|
| US-01 | Recruiter | to understand who Soyed is within 10 seconds | Intro shows name + title after PRESS START; nav menu lists all 12 sections; works without 3D (WebGL-off fallback) |
| US-02 | Recruiter | to contact Soyed fast | Contact section shows email, GitHub, LinkedIn, resume download; NO phone/address anywhere; reachable from any section |
| US-03 | Hiring manager | to see honest skill levels | Skills grid shows strong/working/learning bars matching lib/profile.js exactly; no inflated claims |
| US-04 | Hiring manager | to ask the AI about Soyed and get grounded answers | Bugsy answers only from profile data; unknowns deflect to email; 20-question groundedness set passes with zero invented facts |
| US-05 | Hiring manager | to see the portfolio survive abuse | Prompt injection deflected (10+ documented attempts); 500-char input cap; 20-message session cap; API failures show friendly fallback + email |
| US-06 | Junior peer | to learn QA through a game | Pick topic → lesson card → 3–5 MCQs → explanation on every answer → XP/level-up; progress survives refresh via qa-portfolio-save-v1 |
| US-07 | Junior peer | to find real QA/software/AI jobs in Bangladesh | Job Quest Board shows live aggregator jobs per category; "Accept Quest" opens the real apply URL; courier-resting fallback with curated links when API is down |
| US-08 | Junior peer | to book a session with Soyed | "Party Up" Calendly embed loads lazily; if CALENDLY_URL is unset, a "Session scrolls coming soon — send a raven instead!" state appears |
| US-09 | Any visitor | to send Soyed a message | "Send a Raven" form validates name/email/message, has a honeypot, submits via Web3Forms, shows the raven success animation |
| US-10 | Any visitor | to use the site on a cheap phone | 30fps floor on mid-range Android, simplified 3D, no breakage at 360px width, touch-friendly scroll |
| US-11 | Any visitor | an accessible experience | prefers-reduced-motion honored, keyboard navigable, chat focus-trapped, all content reachable without 3D |
| US-12 | Soyed | my privacy protected | Phone number and home address appear nowhere: UI, code, metadata, commits, or AI answers (grep + AI test evidence) |

## 5. Success Metrics (targets for first 90 days post-launch)

| Metric | Target | Source |
|--------|--------|--------|
| Median session time | ≥ 2 min desktop, ≥ 1 min mobile | Vercel Analytics |
| Learning Game: topic completions | ≥ 50 total | game_completed event |
| Bugsy chats opened | ≥ 30% of sessions | chat_opened event |
| Ravens sent (Web3Forms) | ≥ 10 | Web3Forms dashboard |
| Sessions booked (Calendly) | ≥ 3 | Calendly dashboard |
| Recruiter/HM inbound contacts | ≥ 5 | email/LinkedIn tracking by Soyed |
| Lighthouse Performance (mobile) | ≥ 80 | Lighthouse CI / manual run |
| Uptime | ≥ 99.5% | Vercel status + monitoring |

## 6. Non-Negotiables (from Master Prompt — repeated in D2, D5, D6, D10)

1. **No API keys in frontend code.** GEMINI_API_KEY and RAPIDAPI_KEY live only in Vercel env vars. (Web3Forms access key is the single allowed public key.)
2. **Privacy rule: no phone number or home address anywhere** — UI, AI answers, metadata, commits. Contact = email, GitHub, LinkedIn only. Bugsy must refuse to share phone/address.
3. **No LinkedIn scraping.** Jobs come only from legitimate aggregator APIs (JSearch primary, Jooble alternative).
4. **AI features never break the site**: validate output, retry once, fall back to the hardcoded bank / friendly error with Soyed's email.

## 7. Out of Scope (v1)

- User accounts, login, or server-side profiles (localStorage only)
- Payments, paid tiers, or monetized content
- Multiplayer/leaderboards or any shared user-generated content
- Native/mobile app or PWA offline gameplay (manifest kept honest, web-only)
- LinkedIn data integration of any kind
- CMS/admin panel — content updates happen via code (lib/profile.js)
- Blog, i18n/Bangla localization (v2 candidate)
- Custom domain purchase (HALT: money decision)
- Automated resume parsing or job application submission
