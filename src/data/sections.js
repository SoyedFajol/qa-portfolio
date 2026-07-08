// Registry of the world's "levels". One entry drives everything: the 3D
// checkpoint along the path, the nav menu fallback, and the overlay routing.
// `at` is the checkpoint's progress position along the scroll journey (0..1).

export const SECTIONS = [
  { id: 'journey', icon: '🗺️', label: 'My Journey', blurb: 'The story so far', at: 0.08 },
  { id: 'skills', icon: '🎒', label: 'Skills Inventory', blurb: 'Honest level bars', at: 0.17 },
  { id: 'projects', icon: '🕹️', label: 'Projects Arcade', blurb: 'Playable builds', at: 0.26 },
  { id: 'dungeon', icon: '🏰', label: 'Question Dungeon', blurb: 'Interview flip-cards', at: 0.35 },
  { id: 'roadmap', icon: '🧭', label: 'Roadmap', blurb: 'The skill tree ahead', at: 0.44 },
  { id: 'game', icon: '⚔️', label: 'Learning Game', blurb: 'Earn XP, level up', at: 0.55 },
  { id: 'jobs', icon: '📜', label: 'Job Quest Board', blurb: 'Live QA quests (BD)', at: 0.66 },
  { id: 'ask', icon: '🤝', label: 'Ask Me / Party Up', blurb: 'Raven or a session', at: 0.76 },
  { id: 'sidequests', icon: '🏆', label: 'Side-Quest Board', blurb: 'CP trophies', at: 0.85 },
  { id: 'contact', icon: '💌', label: 'Join My Party', blurb: 'Contact Soyed', at: 0.94 },
]

export function sectionById(id) {
  return SECTIONS.find((s) => s.id === id) ?? null
}
