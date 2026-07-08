import { useMemo, useRef, useState } from 'react'
import { DUNGEON_TOPICS, DUNGEON_QUESTIONS } from '../../data/dungeonQuestions'
import { grantAchievement } from '../../game/rewards'
import { sfx } from '../../game/sfx'

function FlipCard({ item, flipped, onFlip, highlight }) {
  return (
    <div className={`flip-card ${flipped ? 'flipped' : ''}`}>
      <div className="flip-inner min-h-[7.5rem]">
        <button
          className={`flip-face pixel-panel w-full text-left ${highlight ? '!border-pix-yellow' : ''}`}
          onClick={onFlip}
          aria-expanded={flipped}
        >
          <p className="font-pixel text-[8px] text-neon">❓ QUESTION</p>
          <p className="mt-2 font-body text-sm">{item.q}</p>
          <p className="mt-2 font-pixel text-[8px] text-ink-dim">tap to reveal answer</p>
        </button>
        <div className="flip-back pixel-panel !border-neon" aria-hidden={!flipped}>
          <button className="w-full text-left" onClick={onFlip} aria-label="Hide answer">
            <p className="font-pixel text-[8px] text-pix-yellow">💡 MODEL ANSWER</p>
            <p className="mt-2 whitespace-pre-line font-body text-xs text-ink-dim">{item.a}</p>
          </button>
        </div>
      </div>
    </div>
  )
}

/** Interview flip-card dungeon: topic tabs, search, random dice. */
export default function QuestionDungeon() {
  const [topic, setTopic] = useState(DUNGEON_TOPICS[0].id)
  const [query, setQuery] = useState('')
  const [flipped, setFlipped] = useState(() => new Set())
  const [diceId, setDiceId] = useState(null)
  const flipCount = useRef(0)

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q) {
      return DUNGEON_QUESTIONS.filter(
        (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
      )
    }
    return DUNGEON_QUESTIONS.filter((item) => item.topic === topic)
  }, [topic, query])

  function toggleFlip(id) {
    sfx.blip()
    setFlipped((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
        flipCount.current += 1
        if (flipCount.current >= 10) grantAchievement('dungeon-crawler')
      }
      return next
    })
  }

  function rollDice() {
    sfx.coin()
    const pick = DUNGEON_QUESTIONS[Math.floor(Math.random() * DUNGEON_QUESTIONS.length)]
    setQuery('')
    setTopic(pick.topic)
    setDiceId(pick.id)
    setFlipped((prev) => new Set(prev).add(pick.id))
    flipCount.current += 1
    if (flipCount.current >= 10) grantAchievement('dungeon-crawler')
  }

  return (
    <div className="space-y-4">
      <p className="font-body text-sm text-ink-dim">
        Real junior-to-mid QA interview questions with model answers from actual
        practice. Flip cards, or roll the dice for a random encounter.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="dungeon-search">Search questions</label>
        <input
          id="dungeon-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the dungeon…"
          className="min-w-0 flex-1 border-4 border-panel-2 bg-night p-2 font-body text-sm text-ink placeholder:text-ink-dim focus:border-neon focus:outline-none"
        />
        <button className="pixel-btn pixel-btn--warn !px-3 !py-2 !text-[10px]" onClick={rollDice}>
          🎲 RANDOM
        </button>
      </div>

      {!query && (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Question topics">
          {DUNGEON_TOPICS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={topic === t.id}
              className={`pixel-btn !px-2 !py-2 !text-[9px] ${topic === t.id ? '!border-pix-yellow' : '!border-panel-2'}`}
              onClick={() => {
                sfx.blip()
                setTopic(t.id)
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      )}

      {list.length === 0 ? (
        <p className="pixel-panel text-center font-body text-sm text-ink-dim">
          🕸️ Empty chamber — no questions match “{query}”.
        </p>
      ) : (
        <div className="grid gap-3">
          {list.map((item) => (
            <FlipCard
              key={item.id}
              item={item}
              flipped={flipped.has(item.id)}
              onFlip={() => toggleFlip(item.id)}
              highlight={diceId === item.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
