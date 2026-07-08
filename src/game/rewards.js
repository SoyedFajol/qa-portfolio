// Reward orchestration: one place where XP, achievements, toasts, sounds and
// the LEVEL UP! burst are combined, so every feature awards things the same
// way. Plain functions (zustand getState) — callable from any handler.

import { useGameStore } from '../store/useGameStore'
import { useUiStore } from '../store/useUiStore'
import { ACHIEVEMENTS, achievementById, EXPLORABLE_SECTIONS } from './achievements'
import { sfx } from './sfx'

/** Adds XP and handles level-up presentation + level achievements. */
export function gainXp(amount, { silent = false } = {}) {
  const { addXp } = useGameStore.getState()
  const { showLevelUp } = useUiStore.getState()
  const { level, leveledUp } = addXp(amount)
  if (leveledUp) {
    sfx.levelUp()
    showLevelUp(level)
    if (level >= 5) grantAchievement('level-5')
    if (level >= 10) grantAchievement('level-10')
  } else if (!silent) {
    sfx.coin()
  }
  return leveledUp
}

/** Unlocks an achievement once: toast + sound + its XP bonus. */
export function grantAchievement(id) {
  const def = achievementById(id)
  if (!def) return false
  const fresh = useGameStore.getState().unlockAchievement(id)
  if (!fresh) return false
  sfx.achievement()
  useUiStore.getState().pushToast({
    icon: def.icon,
    title: `Achievement: ${def.title}`,
    desc: def.desc,
  })
  if (def.xp > 0) gainXp(def.xp, { silent: true })
  return true
}

/** First visit of a section: small XP + World Explorer check. */
export function visitSection(id) {
  const store = useGameStore.getState()
  const already = store.progress.sectionsVisited.includes(id)
  store.markSectionVisited(id)
  if (already) return
  gainXp(15, { silent: true })
  const visited = useGameStore.getState().progress.sectionsVisited
  if (EXPLORABLE_SECTIONS.every((s) => visited.includes(s))) {
    grantAchievement('world-explorer')
  }
}

/** Quiz answer: streak bookkeeping + streak achievements. Returns new streak. */
export function recordQuizAnswer(correct) {
  const streak = useGameStore.getState().recordAnswer(correct)
  if (correct) {
    grantAchievement('first-blood')
    if (streak >= 10) grantAchievement('bug-exterminator')
  }
  return streak
}

/** Topic finished: XP, completion achievements, Full Regression check. */
export function completeTopic(topicId, allTopicIds) {
  const store = useGameStore.getState()
  const already = store.progress.topicsCompleted.includes(topicId)
  store.completeTopic(topicId)
  if (already) return
  grantAchievement('topic-cleared')
  gainXp(50, { silent: true })
  const done = useGameStore.getState().progress.topicsCompleted
  if (allTopicIds.every((t) => done.includes(t))) {
    grantAchievement('full-regression')
  }
}

export { ACHIEVEMENTS }
