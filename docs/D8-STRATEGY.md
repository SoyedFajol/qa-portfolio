# D8 — STRATEGY DOC (owner: STRATEGIST) — v1.0

## Positioning
**"The QA engineer whose portfolio IS a QA-tested game."**
Every claim on the site is backed by visible engineering: a vitest suite, CI,
schema-validated AI, graceful fallbacks, and an in-product "Report a Bug"
invitation. The medium is the message: quality work, playfully delivered.

## Target audiences (priority order)
1. **Recruiters / hiring managers (BD + remote)** — need signal in <60s:
   PRESS START → journey → Skills/Contact reachable in 2 clicks via MENU.
2. **Hiring engineers / QA leads** — will poke at the seams: the repo, tests,
   fallbacks, and Bugsy's injection resistance ARE the demo.
3. **Peer juniors** — retained by the Learning Game, Question Dungeon, and
   Job Quest Board; they share it, which feeds audience #1.

## Success metrics (Vercel Analytics events)
| Metric | Event | 90-day target |
| --- | --- | --- |
| Engagement | `section_opened` per session | ≥ 4 |
| Centerpiece use | `game` section opened | ≥ 30% of sessions |
| AI feature use | `chat_opened` | ≥ 20% of sessions |
| Job board value | `quest-accepted` achievement | ≥ 10/week |
| Conversion | raven sent / session booked / email click | ≥ 5/month |

## Launch plan
1. Ship to production (Vercel) → self-QA pass on desktop + real Android.
2. LinkedIn post (HALT: human approves wording) — hook: "I built my portfolio
   as a game, then tested it like it's production." + 30s screen recording.
3. Share in dev communities: r/QualityAssurance, dev.to write-up ("How I
   QA-tested my own portfolio"), BD tech groups.
4. Add the URL to resume header, GitHub profile README, LinkedIn featured.

## v2 candidates
Real Calendly link, resume PDF, GitHub API auto-projects, more dungeon
topics, Bangla language toggle, sound pack upgrade.
