// Registry of the world's "levels". One entry drives everything: the 3D
// checkpoint along the path, the nav menu, the world map, and overlay routing.
// `at` is the checkpoint's progress position along the scroll journey (0..1).
//
// Version 2 structure (per Soyed's sketch): the world is split into rounds.
// ROUND 1 — THE PORTFOLIO: who Soyed is, one stop at a time.
// ROUND 2 — THE PLAYGROUND: the game, the jobs, the learning, the fun.

export const ROUNDS = [
  { id: 1, title: 'ROUND 1 — THE PORTFOLIO', desc: 'The story, the skills, the proof.', at: 0.015 },
  { id: 2, title: 'ROUND 2 — THE PLAYGROUND', desc: 'Play, learn, find your next quest.', at: 0.40 },
]

export const SECTIONS = [
  // ── ROUND 1 · THE PORTFOLIO ─────────────────────────────────────────
  { id: 'journey', round: 1, icon: '🗺️', label: 'My Journey', blurb: 'Level 1 — the story so far', at: 0.06 },
  { id: 'skills', round: 1, icon: '🎒', label: 'Skills Inventory', blurb: 'Honest level bars', at: 0.13 },
  { id: 'projects', round: 1, icon: '🕹️', label: 'Projects Arcade', blurb: 'Real builds & repos', at: 0.21 },
  { id: 'roadmap', round: 1, icon: '🧭', label: 'Roadmap', blurb: 'The skill tree ahead', at: 0.28 },
  { id: 'contact', round: 1, icon: '💌', label: 'Resume & Contact', blurb: 'Join my party', at: 0.35 },

  // ── ROUND 2 · THE PLAYGROUND ────────────────────────────────────────
  { id: 'dungeon', round: 2, icon: '🏰', label: 'Question Dungeon', blurb: 'Interview flip-cards', at: 0.47 },
  { id: 'game', round: 2, icon: '⚔️', label: 'Learning Game', blurb: '15+ questions per topic', at: 0.56 },
  { id: 'jobs', round: 2, icon: '📜', label: 'Job Quest Board', blurb: 'Live QA quests (BD)', at: 0.65 },
  { id: 'companies', round: 2, icon: '🏢', label: 'Company Codex', blurb: 'Top BD software guilds', at: 0.74 },
  { id: 'sidequests', round: 2, icon: '🏆', label: 'Side-Quest Board', blurb: 'CP trophies', at: 0.83 },
  { id: 'ask', round: 2, icon: '🤝', label: 'Ask Me / Party Up', blurb: 'Raven or a session', at: 0.92 },
]

export function sectionById(id) {
  return SECTIONS.find((s) => s.id === id) ?? null
}

export function sectionsInRound(roundId) {
  return SECTIONS.filter((s) => s.round === roundId)
}
