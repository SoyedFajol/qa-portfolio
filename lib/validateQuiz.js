// Strict schema validation for AI-generated quizzes.
// Used server-side (api/generate-quiz.js) AND client-side (defense in depth).

export function extractJson(text) {
  if (typeof text !== 'string') return null
  const cleaned = text.replace(/```json/gi, '```').replace(/```/g, '')
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  try {
    return JSON.parse(cleaned.slice(start, end + 1))
  } catch {
    return null
  }
}

const str = (v, min = 1, max = 4000) =>
  typeof v === 'string' && v.trim().length >= min && v.length <= max

/**
 * Validates { lesson, questions: [{ question, options[4], correctIndex, explanation }] }.
 * Returns a normalized copy, or null if invalid.
 */
export function validateQuiz(obj) {
  if (!obj || typeof obj !== 'object') return null
  if (!str(obj.lesson, 20, 4000)) return null
  if (!Array.isArray(obj.questions) || obj.questions.length < 1 || obj.questions.length > 10) return null

  const questions = []
  for (const q of obj.questions) {
    if (!q || typeof q !== 'object') return null
    if (!str(q.question, 5, 600)) return null
    if (!Array.isArray(q.options) || q.options.length !== 4) return null
    if (!q.options.every((o) => str(o, 1, 300))) return null
    if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 3) return null
    if (!str(q.explanation, 5, 800)) return null
    questions.push({
      question: q.question.trim(),
      options: q.options.map((o) => o.trim()),
      correctIndex: q.correctIndex,
      explanation: q.explanation.trim(),
    })
  }
  return { lesson: obj.lesson.trim(), questions }
}
