import { describe, expect, it } from 'vitest'
import { FALLBACK_QUIZZES, TOPICS, TOPIC_IDS, DIFFICULTIES, sampleFallbackQuiz } from '../lib/fallbackQuizzes.js'
import { validateQuiz } from '../lib/validateQuiz.js'

describe('fallback quiz bank — the AI safety net (gate A1)', () => {
  it('covers every Learning Game topic with at least 15 questions each', () => {
    expect(TOPICS.length).toBe(7)
    for (const id of TOPIC_IDS) {
      expect(FALLBACK_QUIZZES[id], `missing fallback for topic "${id}"`).toBeDefined()
      expect(
        FALLBACK_QUIZZES[id].questions.length,
        `topic "${id}" needs ≥15 questions`
      ).toBeGreaterThanOrEqual(15)
    }
  })

  it('every fallback passes the same strict schema enforced on AI output', () => {
    for (const id of TOPIC_IDS) {
      const validated = validateQuiz(FALLBACK_QUIZZES[id])
      expect(validated, `fallback for "${id}" failed validateQuiz`).not.toBeNull()
      expect(validated.questions.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('sampleFallbackQuiz returns a valid 5-question session with unique questions', () => {
    for (const id of TOPIC_IDS) {
      const session = sampleFallbackQuiz(id, 5)
      expect(validateQuiz(session), `sampled session for "${id}" invalid`).not.toBeNull()
      expect(session.questions.length).toBe(5)
      const texts = new Set(session.questions.map((q) => q.question))
      expect(texts.size).toBe(5)
    }
    expect(sampleFallbackQuiz('nope')).toBeNull()
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
