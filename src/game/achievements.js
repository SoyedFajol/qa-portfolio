// Achievement catalog. Ids are stored in the save file — never rename one
// without a save migration.

export const ACHIEVEMENTS = [
  { id: 'first-blood', icon: '🩸', title: 'First Blood', desc: 'Answer your first quiz question correctly.', xp: 20 },
  { id: 'bug-exterminator', icon: '🐞', title: 'Bug Exterminator', desc: 'Hit a 10-answer correct streak.', xp: 100 },
  { id: 'full-regression', icon: '✅', title: 'Full Regression', desc: 'Complete every Learning Game topic.', xp: 250 },
  { id: 'topic-cleared', icon: '📗', title: 'Topic Cleared', desc: 'Finish your first Learning Game topic.', xp: 50 },
  { id: 'world-explorer', icon: '🗺️', title: 'World Explorer', desc: 'Visit every level of the world.', xp: 80 },
  { id: 'dungeon-crawler', icon: '🏰', title: 'Dungeon Crawler', desc: 'Flip 10 cards in the Question Dungeon.', xp: 40 },
  { id: 'party-chat', icon: '🐞', title: 'NPC Whisperer', desc: 'Poke Bugsy the sidekick and make him barrel-roll.', xp: 25 },
  { id: 'quest-accepted', icon: '📜', title: 'Quest Accepted', desc: 'Open a real job quest from the board.', xp: 30 },
  { id: 'raven-sent', icon: '🕊️', title: 'Raven Master', desc: 'Send Soyed a message.', xp: 30 },
  { id: 'level-5', icon: '⭐', title: 'Regression Ranger', desc: 'Reach level 5.', xp: 0 },
  { id: 'level-10', icon: '👑', title: 'QA Legend', desc: 'Reach the maximum level.', xp: 0 },
]

export function achievementById(id) {
  return ACHIEVEMENTS.find((a) => a.id === id) ?? null
}

/** Section ids that count toward World Explorer (chat is a companion, not a level). */
export const EXPLORABLE_SECTIONS = [
  'journey', 'skills', 'projects', 'dungeon', 'roadmap',
  'game', 'jobs', 'ask', 'sidequests', 'contact',
]
