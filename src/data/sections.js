// Registry of the world's "levels". One entry drives everything: the 3D
// checkpoint along the path, the nav menu fallback, and the overlay routing.
// `at` is the checkpoint's progress position along the scroll journey (0..1).
// Order: story → proof → play → opportunities → what's next → contact.

export const SECTIONS = [
  { id: 'journey', icon: '🗺️', label: 'My Journey', blurb: 'The story so far', at: 0.07 },
  { id: 'skills', icon: '🎒', label: 'Skills Inventory', blurb: 'Honest level bars', at: 0.16 },
  { id: 'projects', icon: '🕹️', label: 'Projects Arcade', blurb: 'Real builds & repos', at: 0.25 },
  { id: 'dungeon', icon: '🏰', label: 'Question Dungeon', blurb: 'Interview flip-cards', at: 0.34 },
  { id: 'game', icon: '⚔️', label: 'Learning Game', blurb: 'Earn XP, level up', at: 0.45 },
  { id: 'jobs', icon: '📜', label: 'Job Quest Board', blurb: 'Live QA quests (BD)', at: 0.56 },
  { id: 'sidequests', icon: '🏆', label: 'Side-Quest Board', blurb: 'CP trophies', at: 0.65 },
  { id: 'ask', icon: '🤝', label: 'Ask Me / Party Up', blurb: 'Raven or a session', at: 0.74 },
  { id: 'roadmap', icon: '🧭', label: 'Roadmap', blurb: 'The skill tree ahead', at: 0.84 },
  { id: 'contact', icon: '💌', label: 'Join My Party', blurb: 'Contact Soyed', at: 0.93 },
]

export function sectionById(id) {
  return SECTIONS.find((s) => s.id === id) ?? null
}
