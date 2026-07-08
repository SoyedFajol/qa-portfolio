// Projects Arcade + Roadmap data. Real projects only — GitHub slots point at
// the real profile instead of inventing repos.

import { PROFILE } from './profile'

export const PROJECTS = [
  {
    id: 'portfolio',
    icon: '🎮',
    title: 'This Portfolio',
    subtitle: 'Gamified 3D QA world',
    desc: 'The site you are playing right now: React + Three.js pixel RPG with an AI quiz generator, Bugsy the sidekick, a live job board — and a vitest + CI pipeline behind it, because an SQA engineer ships tested code.',
    tags: ['React', 'Three.js', 'Vercel', 'Gemini', 'Vitest'],
    url: PROFILE.github,
    cta: 'View source',
  },
  {
    id: 'cmed',
    icon: '🏥',
    title: 'Hospital Appointment System',
    subtitle: 'CMED Health internship',
    desc: 'Spring Boot microservice backend for hospital appointment management: clean Java services, relational database integration, and QA duty on my own endpoints — API testing and business-logic validation before handoff.',
    tags: ['Java', 'Spring Boot', 'Microservices', 'MySQL', 'Postman'],
    url: null,
    cta: null,
  },
  {
    id: 'github',
    icon: '⚗️',
    title: 'The Lab',
    subtitle: 'More experiments on GitHub',
    desc: 'Competitive programming solutions, automation practice with Playwright and Selenium, and whatever is currently being built. New cabinets get wheeled into this arcade as they ship.',
    tags: ['Playwright', 'Selenium', 'C++', 'Python'],
    url: PROFILE.github,
    cta: 'Open GitHub',
  },
]

// status: done | active | locked
export const ROADMAP = [
  { id: 'manual', icon: '📝', title: 'Manual Testing', status: 'done', desc: 'Test design, bug reporting, regression — daily craft at BRAC IT.' },
  { id: 'api', icon: '🔌', title: 'API Testing', status: 'done', desc: 'Postman & Swagger workflows on enterprise microservices.' },
  { id: 'automation', icon: '🤖', title: 'Automation Mastery', status: 'active', desc: 'Playwright & Selenium frameworks, CI pipelines — the current quest.' },
  { id: 'ai-qa', icon: '✨', title: 'AI in QA', status: 'locked', desc: 'AI-assisted test generation, LLM output validation — unlocking now (this site is the first artifact).' },
  { id: 'senior', icon: '👑', title: 'Senior SQA / SDET', status: 'locked', desc: 'Owning quality strategy end-to-end. The final boss of this ladder.' },
]
