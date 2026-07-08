import { describe, expect, it } from 'vitest'
import { FALLBACK_QUIZZES, TOPICS, TOPIC_IDS, DIFFICULTIES } from '../lib/fallbackQuizzes.js'
import { validateQuiz } from '../lib/validateQuiz.js'

describe('fallback quiz bank — the AI safety net (gate A1)', () => {
  it('covers every Learning Game topic', () => {
    expect(TOPICS.length).toBe(7)
    for (const id of TOPIC_IDS) {
      expect(FALLBACK_QUIZZES[id], `missing fallback for topic "${id}"`).toBeDefined()
    }
  })

  it('every fallback passes the same strict schema enforced on AI output', () => {
    for (const id of TOPIC_IDS) {
      const validated = validateQuiz(FALLBACK_QUIZZES[id])
      expect(validated, `fallback for "${id}" failed validateQuiz`).not.toBeNull()
      expect(validated.questions.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('does not put every correct answer in the same slot', () => {
    for (const id of TOPIC_IDS) {
      const indexes = new Set(FALLBACK_QUIZZES[id].questions.map((q) => q.correctIndex))
      expect(indexes.size, `topic "${id}" has predictable correctIndex`).toBeGreaterThan(1)
    }
  })

  it('exports the difficulty enum the API validates against', () => {
    expect(DIFFICULTIES).toEqual(['easy', 'medium', 'hard'])
  })
})
