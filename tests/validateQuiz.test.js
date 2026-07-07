import { describe, expect, it } from 'vitest'
import { extractJson, validateQuiz } from '../lib/validateQuiz.js'

const validQuiz = {
  lesson: 'Boundary value analysis focuses tests on the edges of input ranges.',
  questions: [
    {
      question: 'A field accepts 1-100. Which set is the best BVA pick?',
      options: ['0, 1, 100, 101', '50, 60, 70, 80', '2, 3, 4, 5', '-5, -10, 200, 300'],
      correctIndex: 0,
      explanation: 'BVA tests just inside and just outside each boundary.',
    },
  ],
}

describe('extractJson', () => {
  it('parses raw JSON and fenced ```json blocks', () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 })
    expect(extractJson('```json\n{"a":1}\n```')).toEqual({ a: 1 })
    expect(extractJson('Sure! Here is the quiz:\n{"a":1}\nEnjoy!')).toEqual({ a: 1 })
  })

  it('returns null for garbage', () => {
    expect(extractJson('no json here')).toBeNull()
    expect(extractJson('{broken')).toBeNull()
    expect(extractJson(null)).toBeNull()
    expect(extractJson(12)).toBeNull()
  })
})

describe('validateQuiz — strict AI output contract (gate A1)', () => {
  it('accepts and normalizes a valid quiz', () => {
    const result = validateQuiz(validQuiz)
    expect(result).not.toBeNull()
    expect(result.questions).toHaveLength(1)
    expect(result.questions[0].correctIndex).toBe(0)
  })

  it('rejects structural violations', () => {
    expect(validateQuiz(null)).toBeNull()
    expect(validateQuiz({})).toBeNull()
    expect(validateQuiz({ ...validQuiz, lesson: 'too short' })).toBeNull()
    expect(validateQuiz({ ...validQuiz, questions: [] })).toBeNull()
  })

  it('rejects malformed questions', () => {
    const q = validQuiz.questions[0]
    const withQuestion = (patch) => ({ ...validQuiz, questions: [{ ...q, ...patch }] })
    expect(validateQuiz(withQuestion({ options: q.options.slice(0, 3) }))).toBeNull()
    expect(validateQuiz(withQuestion({ correctIndex: 4 }))).toBeNull()
    expect(validateQuiz(withQuestion({ correctIndex: 1.5 }))).toBeNull()
    expect(validateQuiz(withQuestion({ correctIndex: '0' }))).toBeNull()
    expect(validateQuiz(withQuestion({ explanation: '' }))).toBeNull()
    expect(validateQuiz(withQuestion({ options: ['a', 'b', 'c', ''] }))).toBeNull()
  })
})
