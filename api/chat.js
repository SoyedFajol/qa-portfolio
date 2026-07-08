// POST /api/chat — Bugsy the AI sidekick. Stateless: the client sends its
// recent message history; the system prompt (personality + real profile +
// safety rules) is built server-side and cannot be overridden by clients.

import { callAI } from '../lib/ai.js'
import { buildSystemPrompt, validateChatBody, BUGSY_FALLBACK_REPLY } from '../lib/bugsy.js'
import { rateLimit, clientIp } from '../lib/rateLimit.js'

const MAX_REPLY_CHARS = 1200

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!rateLimit(`chat:${clientIp(req)}`, { limit: 8, windowMs: 60_000 })) {
    return res.status(429).json({ error: 'Bugsy needs a breather — try again in a minute.' })
  }

  const check = validateChatBody(req.body)
  if (!check.ok) {
    return res.status(400).json({ error: check.error })
  }

  try {
    const text = await callAI({
      system: buildSystemPrompt(),
      messages: check.messages,
      temperature: 0.6,
      maxOutputTokens: 512,
    })
    return res.status(200).json({ reply: text.trim().slice(0, MAX_REPLY_CHARS), source: 'ai' })
  } catch {
    // The site must never break because the AI is down (non-negotiable):
    // return a friendly in-character fallback instead of a 5xx.
    return res.status(200).json({ reply: BUGSY_FALLBACK_REPLY, source: 'fallback' })
  }
}
