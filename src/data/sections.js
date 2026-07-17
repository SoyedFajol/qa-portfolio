// Registry of the world's "levels". One entry drives everything: the 3D
// checkpoint along the loop road, the nav menu, the world map, and overlay
// routing. `at` is the stop's progress position around the loop (0..1).
//
// V3 layout (Soyed's sketch): a circular road around a mini city.
// ROUND 1 — THE PORTFOLIO ends at the gap; JUMP into ROUND 2 — THE
// PLAYGROUND; after the last stop comes the victory-lap garden stretch,
// then the cliff… and the loop starts again.

export const ROUNDS = [
  { id: 1, title: 'ROUND 1 — THE PORTFOLIO', desc: 'The story, the skills, the proof.', at: 0.02 },
  { id: 2, title: 'ROUND 2 — THE PLAYGROUND', desc: 'Play, learn, find your next quest.', at: 0.435 },
]

export const SECTIONS = [
  // ── ROUND 1 · THE PORTFOLIO ─────────────────────────────────────────
  { id: 'journey', round: 1, icon: '🗺️', label: 'My Journey', blurb: 'Level 1 — the story so far', at: 0.06 },
  { id: 'skills', round: 1, icon: '🎒', label: 'Skills Inventory', blurb: 'Honest level bars', at: 0.12 },
  { id: 'projects', round: 1, icon: '🕹️', label: 'Projects Arcade', blurb: 'Real builds & repos', at: 0.18 },
  { id: 'sidequests', round: 1, icon: '🏆', label: 'Achievements & Extracurricular', blurb: 'CP trophies, sports, campus life', at: 0.24 },
  { id: 'roadmap', round: 1, icon: '🧭', label: 'Career Roadmaps', blurb: 'QA, AI, frontend, backend, CP — with resources', at: 0.30 },
  { id: 'contact', round: 1, icon: '💌', label: 'Resume & Contact', blurb: 'Join my party', at: 0.36 },

  // ── the GAP: jump to Round 2 ── (walkway hole at 0.405–0.425)

  // ── ROUND 2 · THE PLAYGROUND ────────────────────────────────────────
  { id: 'dungeon', round: 2, icon: '🏰', label: 'Question Dungeon', blurb: 'Interview flip-cards', at: 0.47 },
  { id: 'game', round: 2, icon: '⚔️', label: 'Learning Game', blurb: '15+ questions per topic', at: 0.55 },
  { id: 'jobs', round: 2, icon: '📜', label: 'Job Quest Board', blurb: 'Live QA quests (BD)', at: 0.63 },
  { id: 'companies', round: 2, icon: '🏢', label: 'Company Codex', blurb: 'Top BD software guilds', at: 0.71 },
  { id: 'ask', round: 2, icon: '🤝', label: 'Ask Me / Party Up', blurb: 'Raven or a session', at: 0.79 },

  // ── 0.79 → 0.98: the garden victory lap… then the cliff. See you at the start.
]

export function sectionById(id) {
  return SECTIONS.find((s) => s.id === id) ?? null
}

export function sectionsInRound(roundId) {
  return SECTIONS.filter((s) => s.round === roundId)
}
