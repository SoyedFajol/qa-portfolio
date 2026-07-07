// XP curve + QA-themed rank ladder (Lv1 Bug Spotter → Lv10 QA Legend).
// Level is ALWAYS derived from xp via levelForXp — never stored independently
// by callers, so the two can't drift apart.

export const RANKS = [
  { level: 1, title: 'Bug Spotter', minXp: 0 },
  { level: 2, title: 'Console Scout', minXp: 100 },
  { level: 3, title: 'Test Case Cadet', minXp: 250 },
  { level: 4, title: 'Bug Hunter', minXp: 450 },
  { level: 5, title: 'Regression Ranger', minXp: 700 },
  { level: 6, title: 'Automation Apprentice', minXp: 1000 },
  { level: 7, title: 'API Alchemist', minXp: 1400 },
  { level: 8, title: 'Edge-Case Slayer', minXp: 1900 },
  { level: 9, title: 'Release Guardian', minXp: 2500 },
  { level: 10, title: 'QA Legend', minXp: 3200 },
]

export const MAX_LEVEL = RANKS[RANKS.length - 1].level

export function levelForXp(xp) {
  const safe = Number.isFinite(xp) && xp > 0 ? xp : 0
  let level = 1
  for (const rank of RANKS) {
    if (safe >= rank.minXp) level = rank.level
  }
  return level
}

export function rankForLevel(level) {
  return RANKS.find((r) => r.level === level) ?? RANKS[0]
}

/** XP needed to reach the next level, or null at max level. */
export function nextThreshold(level) {
  const next = RANKS.find((r) => r.level === level + 1)
  return next ? next.minXp : null
}

/** Progress within the current level: { pct: 0..1, current, next } */
export function progressToNext(xp) {
  const level = levelForXp(xp)
  const current = rankForLevel(level).minXp
  const next = nextThreshold(level)
  if (next === null) return { pct: 1, current, next: null }
  const span = next - current
  const pct = Math.min(1, Math.max(0, (xp - current) / span))
  return { pct, current, next }
}
