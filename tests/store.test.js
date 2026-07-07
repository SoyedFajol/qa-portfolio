import { beforeEach, describe, expect, it } from 'vitest'
import { sanitizeSave, useGameStore } from '../src/store/useGameStore.js'

const state = () => useGameStore.getState()

beforeEach(() => {
  state().resetSave()
})

describe('useGameStore actions', () => {
  it('starts a fresh save at Lv.1 with nothing unlocked', () => {
    expect(state().xp).toBe(0)
    expect(state().level).toBe(1)
    expect(state().achievements).toEqual([])
    expect(state().mute).toBe(false)
    expect(state().chatMessageCount).toBe(0)
  })

  it('addXp accumulates and levels up across a threshold', () => {
    expect(state().addXp(60).leveledUp).toBe(false)
    const result = state().addXp(60) // total 120 ≥ 100 → Lv.2
    expect(result).toEqual({ xp: 120, level: 2, leveledUp: true })
    expect(state().level).toBe(2)
  })

  it('addXp ignores garbage amounts', () => {
    state().addXp(-100)
    state().addXp(NaN)
    state().addXp('50')
    expect(state().xp).toBe(0)
  })

  it('unlockAchievement is idempotent', () => {
    expect(state().unlockAchievement('first-blood')).toBe(true)
    expect(state().unlockAchievement('first-blood')).toBe(false)
    expect(state().achievements).toEqual(['first-blood'])
  })

  it('tracks visited sections and completed topics without duplicates', () => {
    state().markSectionVisited('skills')
    state().markSectionVisited('skills')
    state().completeTopic('api-testing')
    expect(state().progress.sectionsVisited).toEqual(['skills'])
    expect(state().progress.topicsCompleted).toEqual(['api-testing'])
  })

  it('recordAnswer maintains streak and bestStreak', () => {
    state().recordAnswer(true)
    state().recordAnswer(true)
    expect(state().progress.streak).toBe(2)
    state().recordAnswer(false)
    expect(state().progress.streak).toBe(0)
    expect(state().progress.bestStreak).toBe(2)
  })

  it('toggleMute flips and incrementChatCount counts', () => {
    state().toggleMute()
    expect(state().mute).toBe(true)
    expect(state().incrementChatCount()).toBe(1)
    expect(state().incrementChatCount()).toBe(2)
  })

  it('resetSave restores a brand-new game', () => {
    state().addXp(500)
    state().unlockAchievement('x')
    state().resetSave()
    expect(state().xp).toBe(0)
    expect(state().level).toBe(1)
    expect(state().achievements).toEqual([])
  })
})

describe('sanitizeSave — corrupted save handling (gate H5)', () => {
  it('returns defaults for non-object garbage', () => {
    for (const garbage of [null, undefined, 'hax', 42, [], true]) {
      expect(sanitizeSave(garbage).xp).toBe(0)
      expect(sanitizeSave(garbage).level).toBe(1)
    }
  })

  it('repairs field-level corruption and re-derives level from xp', () => {
    const repaired = sanitizeSave({
      xp: 700.9,
      level: 999, // lies — must be re-derived
      progress: { sectionsVisited: ['a', 5, null], streak: -3 },
      achievements: 'not-an-array',
      mute: 'yes',
    })
    expect(repaired.xp).toBe(700)
    expect(repaired.level).toBe(5) // 700 XP → Regression Ranger
    expect(repaired.progress.sectionsVisited).toEqual(['a'])
    expect(repaired.progress.streak).toBe(0)
    expect(repaired.achievements).toEqual([])
    expect(repaired.mute).toBe(false)
  })

  it('caps runaway arrays from a tampered save', () => {
    const huge = sanitizeSave({ achievements: Array(10_000).fill('spam') })
    expect(huge.achievements.length).toBeLessThanOrEqual(200)
  })
})
