// Global game state, persisted to localStorage under qa-portfolio-save-v1.
// chatMessageCount is deliberately NOT persisted: Bugsy's 20-message cap is
// per visit, so it lives in memory only and resets on reload.

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { levelForXp } from '../game/progression'

export const SAVE_KEY = 'qa-portfolio-save-v1'
export const SAVE_VERSION = 1

const defaultSave = {
  xp: 0,
  level: 1,
  progress: {
    sectionsVisited: [], // section ids opened at least once
    topicsCompleted: [], // learning-game topics finished
    streak: 0,           // current correct-answer streak
    bestStreak: 0,
  },
  achievements: [],      // achievement ids, in the order earned
  mute: false,
}

const sessionOnly = {
  chatMessageCount: 0,
}

const stringArray = (v) =>
  Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, 200) : []
const nonNegInt = (v, fallback = 0) =>
  Number.isFinite(v) && v >= 0 ? Math.floor(v) : fallback

/**
 * A corrupted or hand-edited save must never crash the app (gate H5).
 * Anything unrecognizable falls back field-by-field to defaults, and
 * level is re-derived from xp so the pair can never disagree.
 */
export function sanitizeSave(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ...defaultSave }
  const xp = nonNegInt(raw.xp)
  const p = raw.progress && typeof raw.progress === 'object' ? raw.progress : {}
  return {
    xp,
    level: levelForXp(xp),
    progress: {
      sectionsVisited: stringArray(p.sectionsVisited),
      topicsCompleted: stringArray(p.topicsCompleted),
      streak: nonNegInt(p.streak),
      bestStreak: nonNegInt(p.bestStreak),
    },
    achievements: stringArray(raw.achievements),
    mute: raw.mute === true,
  }
}

export const useGameStore = create(
  persist(
    (set, get) => ({
      ...defaultSave,
      ...sessionOnly,

      /** Adds XP, recomputes level. Returns { xp, level, leveledUp }. */
      addXp: (amount) => {
        const gain = Number.isFinite(amount) && amount > 0 ? Math.floor(amount) : 0
        const xp = get().xp + gain
        const level = levelForXp(xp)
        const leveledUp = level > get().level
        set({ xp, level })
        return { xp, level, leveledUp }
      },

      /** Idempotent. Returns true only the first time an id is unlocked. */
      unlockAchievement: (id) => {
        if (typeof id !== 'string' || !id) return false
        const { achievements } = get()
        if (achievements.includes(id)) return false
        set({ achievements: [...achievements, id] })
        return true
      },

      markSectionVisited: (id) => {
        if (typeof id !== 'string' || !id) return
        const { progress } = get()
        if (progress.sectionsVisited.includes(id)) return
        set({ progress: { ...progress, sectionsVisited: [...progress.sectionsVisited, id] } })
      },

      completeTopic: (id) => {
        if (typeof id !== 'string' || !id) return
        const { progress } = get()
        if (progress.topicsCompleted.includes(id)) return
        set({ progress: { ...progress, topicsCompleted: [...progress.topicsCompleted, id] } })
      },

      /** Quiz answer bookkeeping. Returns the new streak. */
      recordAnswer: (correct) => {
        const { progress } = get()
        const streak = correct ? progress.streak + 1 : 0
        const bestStreak = Math.max(progress.bestStreak, streak)
        set({ progress: { ...progress, streak, bestStreak } })
        return streak
      },

      toggleMute: () => set({ mute: !get().mute }),

      incrementChatCount: () => {
        const chatMessageCount = get().chatMessageCount + 1
        set({ chatMessageCount })
        return chatMessageCount
      },

      /** Full reset — wipes the save back to a brand-new game. */
      resetSave: () => set({ ...structuredClone(defaultSave), ...sessionOnly }),
    }),
    {
      name: SAVE_KEY,
      version: SAVE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ xp, level, progress, achievements, mute }) => ({
        xp, level, progress, achievements, mute,
      }),
      merge: (persisted, current) => ({ ...current, ...sanitizeSave(persisted) }),
      // v1 is the baseline schema; future versions add cases here.
      migrate: (persisted) => persisted,
    }
  )
)
