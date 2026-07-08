import { beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from '../src/store/useGameStore.js'
import { useUiStore } from '../src/store/useUiStore.js'
import { gainXp, grantAchievement, visitSection, recordQuizAnswer, completeTopic } from '../src/game/rewards.js'
import { ACHIEVEMENTS, achievementById, EXPLORABLE_SECTIONS } from '../src/game/achievements.js'
import { TOPIC_IDS } from '../lib/fallbackQuizzes.js'

const game = () => useGameStore.getState()

beforeEach(() => {
  game().resetSave()
})

describe('achievement catalog', () => {
  it('has unique ids and complete definitions', () => {
    const ids = new Set()
    for (const a of ACHIEVEMENTS) {
      expect(ids.has(a.id)).toBe(false)
      ids.add(a.id)
      expect(a.title).toBeTruthy()
      expect(a.desc).toBeTruthy()
      expect(a.xp).toBeGreaterThanOrEqual(0)
    }
    expect(achievementById('first-blood')).toBeTruthy()
    expect(achievementById('nope')).toBeNull()
  })
})

describe('reward orchestration', () => {
  it('grantAchievement unlocks once, pushes a toast, and pays its XP bonus', () => {
    expect(grantAchievement('raven-sent')).toBe(true)
    expect(grantAchievement('raven-sent')).toBe(false) // idempotent
    expect(game().achievements).toContain('raven-sent')
    expect(game().xp).toBe(achievementById('raven-sent').xp)
    expect(useUiStore.getState().toasts.length).toBeGreaterThan(0)
  })

  it('gainXp reports level-ups and unlocks level achievements', () => {
    gainXp(720) // → Lv.5 Regression Ranger
    expect(game().level).toBe(5)
    expect(game().achievements).toContain('level-5')
  })

  it('visitSection awards XP only on first visit and grants World Explorer', () => {
    visitSection('skills')
    const afterFirst = game().xp
    expect(afterFirst).toBeGreaterThan(0)
    visitSection('skills')
    expect(game().xp).toBe(afterFirst) // no double pay
    for (const id of EXPLORABLE_SECTIONS) visitSection(id)
    expect(game().achievements).toContain('world-explorer')
  })

  it('recordQuizAnswer drives First Blood and Bug Exterminator', () => {
    recordQuizAnswer(true)
    expect(game().achievements).toContain('first-blood')
    for (let i = 0; i < 9; i++) recordQuizAnswer(true)
    expect(game().progress.streak).toBe(10)
    expect(game().achievements).toContain('bug-exterminator')
  })

  it('completing every topic grants Full Regression', () => {
    for (const id of TOPIC_IDS) completeTopic(id, TOPIC_IDS)
    expect(game().achievements).toContain('topic-cleared')
    expect(game().achievements).toContain('full-regression')
  })
})
