// POST /api/generate-quiz — AI lesson + quiz for the Learning Game.
// Contract: validate strictly → retry once → hardcoded fallback (gate A1).

import { callAI } from '../lib/ai.js'
import { extractJson, validateQuiz } from '../lib/validateQuiz.js'
import { FALLBACK_QUIZZES, TOPICS, TOPIC_IDS, DIFFICULTIES } from '../lib/fallbackQuizzes.js'
import { rateLimit, clientIp } from '../lib/rateLimit.js'

function buildPrompt(topicId, difficulty, count) {
  const topic = TOPICS.find((t) => t.id === topicId)
  return `You are a senior QA engineer writing a micro-lesson and quiz for a junior QA learning game.

Topic: ${topic.label}
Difficulty: ${difficulty} (easy = fundamentals, medium = practical application, hard = tricky edge cases and senior reasoning)
Number of questions: ${count}

Return ONLY a JSON object, no markdown fences, exactly this shape:
{
  "lesson": "a focused 80-140 word lesson teaching ONE practical concept from the topic",
  "questions": [
    {
      "question": "clear single-answer question about the lesson or topic",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "1-3 sentences teaching WHY the correct answer is right"
    }
  ]
}

Rules: exactly 4 options per question; correctIndex is the 0-based index of the right option; vary correctIndex across questions; questions must be answerable from general QA knowledge (no trick trivia); explanations teach, never just restate.`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!rateLimit(`quiz:${clientIp(req)}`, { limit: 6, windowMs: 60_000 })) {
    return res.status(429).json({ error: 'Too many quests summoned — try again in a minute.' })
  }

  const body = req.body ?? {}
  const topic = typeof body.topic === 'string' ? body.topic : ''
  const difficulty = typeof body.difficulty === 'string' ? body.difficulty : 'easy'
  const count = Number.isInteger(body.count) ? body.count : 4

  if (!TOPIC_IDS.includes(topic)) return res.status(400).json({ error: 'Unknown topic' })
  if (!DIFFICULTIES.includes(difficulty)) return res.status(400).json({ error: 'Unknown difficulty' })
  if (count < 3 || count > 5) return res.status(400).json({ error: 'count must be 3-5' })

  const prompt = buildPrompt(topic, difficulty, count)

  // validate → retry once → fallback
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const text = await callAI({
        system: 'You output strict JSON only. No prose, no markdown fences.',
        messages: [{ role: 'user', content: prompt }],
        json: true,
        temperature: attempt === 0 ? 0.8 : 0.4, // retry more conservatively
        maxOutputTokens: 2048,
      })
      const quiz = validateQuiz(extractJson(text))
      if (quiz) {
        return res.status(200).json({ quiz, source: 'ai' })
      }
    } catch {
      // fall through to retry / fallback
    }
  }

  return res.status(200).json({ quiz: FALLBACK_QUIZZES[topic], source: 'fallback' })
}
