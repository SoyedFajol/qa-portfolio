# 🎮 Soyed Solaman — Software Engineer · Gamified 3D Portfolio

**Live: https://soyed-solaman.vercel.app**

A pixel/retro RPG portfolio rendered in 3D for **Soyed Md. Solaman Fajul** — Junior SQA Engineer @ BRAC IT Services Ltd., Dhaka. The visitor is a player: scroll to walk a voxel hero through the journey, open glowing checkpoints (Skills, Projects, Question Dungeon, Learning Game, Job Quest Board…), collect XP coins, and poke **Bugsy**, the ladybug sidekick — all over a synthesized chiptune soundtrack.

## Stack

React 18 + Vite · Three.js via @react-three/fiber + drei · Framer Motion · Tailwind CSS · zustand (+ localStorage save `qa-portfolio-save-v1`) · Vercel serverless `/api` (Gemini for the quiz generator, JSearch for the Job Quest Board) · Web3Forms + Calendly.

## Commands

```bash
npm install     # install dependencies
npm run dev     # local dev server
npm test        # vitest unit suite
npm run lint    # eslint
npm run build   # production build
```

## Structure

```
lib/            shared modules — profile data (single source of truth),
                job normalization, quiz schema validation; imported by
                BOTH src/ and api/
api/            Vercel serverless functions (generate-quiz, jobs)
src/
  components/   pixel UI components
  scene/        R3F 3D world (hero, Bugsy, checkpoints, particles)
  game/         progression (XP curve, rank ladder), quiz logic
  hooks/        reusable hooks (useLocalStorage, …)
  store/        zustand game store (persisted save)
  data/         re-exports of lib/profile for frontend imports
  styles/       Tailwind + palette CSS variables
docs/           Master Prompt, team protocol, document suite D1–D10, task log
tests/          vitest unit suite
```

## Environment variables (server-side only — never in frontend code)

| Var | Used by | Where to get it |
| --- | --- | --- |
| `GEMINI_API_KEY` | `/api/generate-quiz` | Google AI Studio (free tier) |
| `RAPIDAPI_KEY` | `/api/jobs` | RapidAPI → JSearch (free tier) |

Copy `.env.example` to `.env` for local dev. Real values live only in Vercel → Project → Settings → Environment Variables.

## Deploying (Vercel)

```bash
vercel          # preview deployment
vercel --prod   # production
```

Set `GEMINI_API_KEY` and `RAPIDAPI_KEY` in Vercel → Project → Settings →
Environment Variables. Until they exist, quiz/jobs run on their built-in
fallbacks — the site never breaks.

**Activation TODOs in `lib/profile.js`:** `WEB3FORMS_ACCESS_KEY` (free at
web3forms.com — enables the "Send a Raven" form), `CALENDLY_URL` (enables
"Party Up" booking), `RESUME_URL` (drop the PDF in `/public` first).

## Non-negotiables

- No API keys in frontend code.
- No phone number / home address anywhere — UI, code, metadata, or AI answers (enforced by `tests/profile.test.js`).
- No LinkedIn scraping — jobs come from legitimate aggregator APIs.
- AI features never break the site: validate → retry once → hardcoded fallback.
