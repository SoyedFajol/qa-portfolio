import { describe, expect, it } from 'vitest'
import {
  MAX_LEVEL,
  RANKS,
  levelForXp,
  nextThreshold,
  progressToNext,
  rankForLevel,
} from '../src/game/progression.js'

describe('rank ladder', () => {
  it('runs Lv1 Bug Spotter → Lv10 QA Legend', () => {
    expect(RANKS).toHaveLength(10)
    expect(rankForLevel(1).title).toBe('Bug Spotter')
    expect(rankForLevel(10).title).toBe('QA Legend')
    expect(MAX_LEVEL).toBe(10)
  })

  it('has strictly increasing XP thresholds', () => {
    for (let i = 1; i < RANKS.length; i++) {
      expect(RANKS[i].minXp).toBeGreaterThan(RANKS[i - 1].minXp)
    }
  })
})

describe('levelForXp', () => {
  it('maps XP to the right level at the boundaries', () => {
    expect(levelForXp(0)).toBe(1)
    expect(levelForXp(99)).toBe(1)
    expect(levelForXp(100)).toBe(2)
    expect(levelForXp(3199)).toBe(9)
    expect(levelForXp(3200)).toBe(10)
  })

  it('caps at max level and survives garbage input', () => {
    expect(levelForXp(9_999_999)).toBe(MAX_LEVEL)
    expect(levelForXp(-50)).toBe(1)
    expect(levelForXp(NaN)).toBe(1)
    expect(levelForXp(undefined)).toBe(1)
  })
})

describe('progressToNext', () => {
  it('reports fractional progress within a level', () => {
    const { pct, next } = progressToNext(50)
    expect(next).toBe(100)
    expect(pct).toBeCloseTo(0.5)
  })

  it('pins to 100% at max level', () => {
    expect(progressToNext(99_999)).toEqual({ pct: 1, current: 3200, next: null })
    expect(nextThreshold(MAX_LEVEL)).toBeNull()
  })
})
