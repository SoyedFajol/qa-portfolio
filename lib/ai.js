// Shared AI helper — the ONE place that talks to a model provider, used by
// api/generate-quiz.js. Currently Google Gemini (free tier); swap providers
// by editing only this file.

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
const DEFAULT_MODEL = 'gemini-2.5-flash'

/**
 * callAI({ system, messages, json, maxOutputTokens, temperature }) → string
 * messages: [{ role: 'user' | 'assistant', content: string }]
 * Throws on missing key, HTTP error, or empty completion — callers own
 * retry/fallback policy.
 */
export async function callAI({ system, messages, json = false, maxOutputTokens = 2048, temperature = 0.7 }) {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY is not configured')
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL

  const body = {
    systemInstruction: system ? { parts: [{ text: system }] } : undefined,
    contents: messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    generationConfig: {
      temperature,
      maxOutputTokens,
      ...(json ? { responseMimeType: 'application/json' } : {}),
    },
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20000)
  try {
    const res = await fetch(`${GEMINI_URL}/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    if (!res.ok) {
      throw new Error(`Gemini HTTP ${res.status}`)
    }
    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? ''
    if (!text.trim()) throw new Error('Gemini returned an empty completion')
    return text
  } finally {
    clearTimeout(timer)
  }
}
