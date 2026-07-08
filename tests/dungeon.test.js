import { describe, expect, it } from 'vitest'
import { DUNGEON_TOPICS, DUNGEON_QUESTIONS } from '../src/data/dungeonQuestions.js'

describe('Question Dungeon content', () => {
  it('has 5 questions for every topic tab', () => {
    for (const topic of DUNGEON_TOPICS) {
      const count = DUNGEON_QUESTIONS.filter((q) => q.topic === topic.id).length
      expect(count, `topic "${topic.id}" should have 5 questions`).toBe(5)
    }
  })

  it('every question maps to a real topic and has unique ids', () => {
    const topicIds = new Set(DUNGEON_TOPICS.map((t) => t.id))
    const ids = new Set()
    for (const q of DUNGEON_QUESTIONS) {
      expect(topicIds.has(q.topic), `unknown topic "${q.topic}" on ${q.id}`).toBe(true)
      expect(ids.has(q.id), `duplicate id ${q.id}`).toBe(false)
      ids.add(q.id)
    }
  })

  it('answers are substantial model answers, not one-liners', () => {
    for (const q of DUNGEON_QUESTIONS) {
      expect(q.q.length).toBeGreaterThan(15)
      expect(q.a.length, `answer for ${q.id} too thin`).toBeGreaterThan(120)
    }
  })

  it('leaks no phone-number-like data (gate B7)', () => {
    const all = JSON.stringify(DUNGEON_QUESTIONS)
    expect(all).not.toMatch(/\+?880\s?1[0-9\s-]{7,}/)
  })
})
