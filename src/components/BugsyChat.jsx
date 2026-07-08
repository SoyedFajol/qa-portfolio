import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PROFILE } from '../data/profile'
import { useGameStore } from '../store/useGameStore'
import { useUiStore } from '../store/useUiStore'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { grantAchievement } from '../game/rewards'
import { sfx } from '../game/sfx'
import Typewriter from './Typewriter'

export const CHAT_LIMITS = { maxLength: 500, maxMessages: 20, historySent: 10 }

const STARTERS = [
  'What does Soyed do?',
  'What are his automation skills?',
  'Is he open to opportunities?',
]

const GREETING =
  "Bzzt! I'm Bugsy 🐞 — Soyed's sidekick. Ask me about his QA skills, projects, or whether he's open to new quests!"

const POTION_BREAK =
  `I need a potion break! 🧪 That's my message limit for this visit — for anything else, email Soyed directly at ${PROFILE.email} 📧`

const ERROR_REPLY =
  `Bzzt… my crystal ball fogged up! 🌫️ Try again in a moment, or reach Soyed the classic way: ${PROFILE.email}`

function Bubble({ msg, animate }) {
  const isBot = msg.role === 'assistant'
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[85%] border-2 p-2 font-body text-sm ${
          isBot ? 'border-neon bg-night text-ink' : 'border-pix-purple bg-panel-2 text-ink'
        }`}
      >
        {isBot && <span aria-hidden="true">🐞 </span>}
        {isBot && animate ? <Typewriter text={msg.content} speed={12} sound /> : msg.content}
      </div>
    </div>
  )
}

/** Bugsy chat window + the floating companion button that opens it. */
export default function BugsyChat() {
  const { chatOpen, setChatOpen } = useUiStore()
  const { chatMessageCount, incrementChatCount } = useGameStore()
  const [messages, setMessages] = useState([{ role: 'assistant', content: GREETING }])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const panelRef = useRef(null)
  const logRef = useRef(null)
  useFocusTrap(panelRef, chatOpen, () => setChatOpen(false))

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight })
  }, [messages, busy])

  const capped = chatMessageCount >= CHAT_LIMITS.maxMessages

  async function send(text) {
    const content = text.trim().slice(0, CHAT_LIMITS.maxLength)
    if (!content || busy) return
    if (capped) {
      setMessages((m) => [...m, { role: 'assistant', content: POTION_BREAK }])
      return
    }
    sfx.blip()
    incrementChatCount()
    grantAchievement('party-chat')
    const nextMessages = [...messages, { role: 'user', content }]
    setMessages(nextMessages)
    setInput('')
    setBusy(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // API is stateless: send the recent turns only (greeting excluded).
          messages: nextMessages.slice(1).slice(-CHAT_LIMITS.historySent),
        }),
      })
      if (!res.ok) throw new Error(`chat api ${res.status}`)
      const data = await res.json()
      const reply = typeof data.reply === 'string' && data.reply.trim() ? data.reply.trim() : ERROR_REPLY
      setMessages((m) => [...m, { role: 'assistant', content: reply }])
      sfx.chat()
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: ERROR_REPLY }])
      sfx.error()
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {/* Floating companion button */}
      <motion.button
        className="fixed bottom-4 right-4 z-30 flex h-14 w-14 items-center justify-center border-4 border-neon bg-panel text-2xl shadow-[4px_4px_0_0_rgba(0,0,0,0.45)]"
        aria-label="Chat with Bugsy, the AI sidekick"
        onClick={() => {
          sfx.blip()
          setChatOpen(!chatOpen)
        }}
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
      >
        🐞
      </motion.button>

      <AnimatePresence>
        {chatOpen && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Chat with Bugsy"
            tabIndex={-1}
            className="pixel-panel fixed bottom-20 right-2 z-40 flex h-[70vh] max-h-[560px] w-[min(24rem,calc(100vw-1rem))] flex-col !p-3"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
          >
            <header className="mb-2 flex items-center justify-between border-b-4 border-panel-2 pb-2">
              <p className="font-pixel text-[10px] text-neon">🐞 BUGSY — AI SIDEKICK</p>
              <button
                className="pixel-btn pixel-btn--danger !px-2 !py-1 !text-[10px]"
                onClick={() => {
                  sfx.blip()
                  setChatOpen(false)
                }}
                aria-label="Close chat"
              >
                ✕
              </button>
            </header>

            <div
              ref={logRef}
              className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1"
              aria-live="polite"
              aria-label="Chat messages"
            >
              {messages.map((m, i) => (
                <Bubble key={i} msg={m} animate={i === messages.length - 1 && m.role === 'assistant' && i > 0} />
              ))}
              {busy && (
                <p className="font-pixel text-[9px] text-ink-dim" aria-label="Bugsy is typing">
                  🐞 bzzt<span className="tw-caret">…</span>
                </p>
              )}
            </div>

            {messages.length <= 1 && (
              <div className="my-2 flex flex-col gap-1">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    className="border-2 border-panel-2 bg-night px-2 py-1.5 text-left font-body text-xs text-ink-dim hover:border-neon hover:text-ink"
                    onClick={() => send(s)}
                  >
                    💬 {s}
                  </button>
                ))}
              </div>
            )}

            <form
              className="mt-2 flex gap-2 border-t-4 border-panel-2 pt-2"
              onSubmit={(e) => {
                e.preventDefault()
                send(input)
              }}
            >
              <label className="sr-only" htmlFor="bugsy-input">Message Bugsy</label>
              <input
                id="bugsy-input"
                value={input}
                maxLength={CHAT_LIMITS.maxLength}
                onChange={(e) => setInput(e.target.value)}
                placeholder={capped ? 'Bugsy is on a potion break 🧪' : 'Ask about Soyed…'}
                disabled={busy || capped}
                className="min-w-0 flex-1 border-4 border-panel-2 bg-night p-2 font-body text-sm text-ink placeholder:text-ink-dim focus:border-neon focus:outline-none"
              />
              <button className="pixel-btn !px-3 !py-2 !text-[10px]" type="submit" disabled={busy || capped || !input.trim()}>
                ▶
              </button>
            </form>
            <p className="mt-1 text-right font-body text-[10px] text-ink-dim">
              {Math.max(0, CHAT_LIMITS.maxMessages - chatMessageCount)} messages left this visit
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
