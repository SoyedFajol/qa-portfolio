import { useState } from 'react'
import { motion } from 'framer-motion'
import { TOPICS, sampleFallbackQuiz } from '../../../lib/fallbackQuizzes'
import { validateQuiz } from '../../../lib/validateQuiz'
import { useGameStore } from '../../store/useGameStore'
import { gainXp, recordQuizAnswer, completeTopic } from '../../game/rewards'
import { sfx } from '../../game/sfx'
import Typewriter from '../Typewriter'

const XP_PER_CORRECT = { easy: 10, medium: 15, hard: 20 }
const PASS_RATIO = 0.7

function difficultyForLevel(level) {
  if (level >= 7) return 'hard'
  if (level >= 4) return 'medium'
  return 'easy'
}

async function fetchQuiz(topic, difficulty) {
  const res = await fetch('/api/generate-quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, difficulty, count: 15 }),
  })
  if (!res.ok) throw new Error(`quiz api ${res.status}`)
  const data = await res.json()
  // Defense in depth: never trust even our own API blindly.
  const quiz = validateQuiz(data.quiz ?? data)
  if (!quiz) throw new Error('quiz failed client-side validation')
  return { quiz, source: data.source ?? 'ai' }
}

/** Learning Game: pick a topic → lesson card → quiz → XP, streaks, ranks. */
export default function LearningGame() {
  const level = useGameStore((s) => s.level)
  const streak = useGameStore((s) => s.progress.streak)
  const topicsCompleted = useGameStore((s) => s.progress.topicsCompleted)

  const [phase, setPhase] = useState('pick') // pick | loading | lesson | quiz | result
  const [topic, setTopic] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [source, setSource] = useState('ai')
  const [qIndex, setQIndex] = useState(0)
  const [picked, setPicked] = useState(null) // selected option index for current question
  const [correctCount, setCorrectCount] = useState(0)
  const [earnedXp, setEarnedXp] = useState(0)

  const difficulty = difficultyForLevel(level)

  async function startTopic(t) {
    sfx.blip()
    setTopic(t)
    setPhase('loading')
    setQIndex(0)
    setPicked(null)
    setCorrectCount(0)
    setEarnedXp(0)
    try {
      const { quiz: q, source: src } = await fetchQuiz(t.id, difficulty)
      setQuiz(q)
      setSource(src)
    } catch {
      // Network or validation failure — the game must never break (gate A1).
      // The full 15-question bank, shuffled fresh for every run.
      setQuiz(sampleFallbackQuiz(t.id, 15))
      setSource('fallback')
    }
    setPhase('lesson')
  }

  function answer(optionIndex) {
    if (picked !== null) return
    const q = quiz.questions[qIndex]
    const correct = optionIndex === q.correctIndex
    setPicked(optionIndex)
    recordQuizAnswer(correct)
    if (correct) {
      sfx.success()
      const bonus = XP_PER_CORRECT[difficulty] ?? 10
      setCorrectCount((c) => c + 1)
      setEarnedXp((x) => x + bonus)
      gainXp(bonus, { silent: true })
    } else {
      sfx.error()
    }
  }

  function nextQuestion() {
    sfx.blip()
    if (qIndex + 1 < quiz.questions.length) {
      setQIndex(qIndex + 1)
      setPicked(null)
    } else {
      const passed = correctCount / quiz.questions.length >= PASS_RATIO
      if (passed) {
        completeTopic(topic.id, TOPICS.map((t) => t.id))
      }
      setPhase('result')
    }
  }

  // ── Topic picker ──────────────────────────────────────────────────
  if (phase === 'pick') {
    return (
      <div className="space-y-4">
        <p className="font-body text-sm text-ink-dim">
          Pick a training ground. A short lesson, then a quiz — right answers earn
          XP, streaks earn achievements. Difficulty scales with your level
          (current: <span className="text-pix-yellow">{difficulty.toUpperCase()}</span>
          {streak > 0 && <> · streak <span className="text-pix-orange">{streak}🔥</span></>}).
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {TOPICS.map((t) => {
            const done = topicsCompleted.includes(t.id)
            return (
              <button
                key={t.id}
                className={`pixel-btn !text-left !text-[10px] ${done ? '!border-neon' : ''}`}
                onClick={() => startTopic(t)}
              >
                {t.icon} {t.label}
                {done && <span className="text-neon"> ✓ CLEARED</span>}
                <span className="mt-1 block font-body text-xs normal-case text-ink-dim">
                  {done ? 'Replay for more XP' : 'New quest available'}
                </span>
              </button>
            )
          })}
        </div>
        <p className="font-body text-xs text-ink-dim">
          Quizzes are AI-generated (Gemini) and schema-validated; if the AI
          misbehaves, a hand-written fallback quest loads instead. Clear all{' '}
          {TOPICS.length} topics for the Full Regression achievement.
        </p>
      </div>
    )
  }

  // ── Loading ──────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="flex flex-col items-center gap-5 py-10">
        <p className="font-pixel text-xs text-neon">SUMMONING QUEST…</p>
        <div className="loading-bar" role="progressbar" aria-label="Generating quiz">
          <div className="loading-bar-fill" />
        </div>
        <p className="font-body text-xs text-ink-dim">{topic.icon} {topic.label} · {difficulty}</p>
      </div>
    )
  }

  // ── Lesson card ──────────────────────────────────────────────────
  if (phase === 'lesson') {
    return (
      <div className="space-y-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-[10px] text-pix-yellow">{topic.icon} {topic.label}</h3>
          {source === 'fallback' && (
            <span className="font-pixel text-[8px] text-pix-orange" title="AI unavailable — hand-written quest loaded">
              📜 OFFLINE QUEST
            </span>
          )}
        </div>
        <div className="pixel-panel !border-pix-purple">
          <p className="font-pixel text-[8px] text-neon">📖 LESSON SCROLL</p>
          <p className="mt-2 whitespace-pre-line font-body text-sm text-ink">{quiz.lesson}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="pixel-btn !text-[10px]" onClick={() => { sfx.blip(); setPhase('quiz') }}>
            ⚔️ START QUIZ ({quiz.questions.length} questions)
          </button>
          <button className="pixel-btn pixel-btn--danger !text-[10px]" onClick={() => { sfx.blip(); setPhase('pick') }}>
            ← RETREAT
          </button>
        </div>
      </div>
    )
  }

  // ── Quiz ─────────────────────────────────────────────────────────
  if (phase === 'quiz') {
    const q = quiz.questions[qIndex]
    return (
      <div className="space-y-4">
        <div className="flex items-baseline justify-between">
          <p className="font-pixel text-[9px] text-ink-dim">
            Q{qIndex + 1}/{quiz.questions.length} · {topic.label}
          </p>
          <p className="font-pixel text-[9px] text-pix-orange">
            {useGameStore.getState().progress.streak > 0 && `${useGameStore.getState().progress.streak}🔥`}
          </p>
        </div>

        <motion.div key={qIndex} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}>
          <p className="pixel-panel font-body text-sm">
            <Typewriter text={q.question} speed={12} />
          </p>

          <div className="mt-3 grid gap-2" role="group" aria-label="Answer options">
            {q.options.map((opt, i) => {
              let cls = ''
              if (picked !== null) {
                if (i === q.correctIndex) cls = '!border-neon'
                else if (i === picked) cls = '!border-danger opacity-70'
                else cls = 'opacity-50'
              }
              return (
                <button
                  key={i}
                  className={`pixel-btn !border-panel-2 !text-left !text-[10px] normal-case ${cls}`}
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }}
                  disabled={picked !== null}
                  onClick={() => answer(i)}
                >
                  <span className="font-pixel text-[9px] text-pix-yellow">{String.fromCharCode(65 + i)}.</span>{' '}
                  {opt}
                </button>
              )
            })}
          </div>

          {picked !== null && (
            <motion.div
              className={`pixel-panel mt-3 ${picked === q.correctIndex ? '!border-neon' : '!border-danger'}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              aria-live="polite"
            >
              <p className="font-pixel text-[9px]" style={{ color: picked === q.correctIndex ? 'var(--neon)' : 'var(--danger)' }}>
                {picked === q.correctIndex
                  ? `✅ CRITICAL HIT! +${XP_PER_CORRECT[difficulty]} XP`
                  : '❌ MISS! But every bug teaches…'}
              </p>
              <p className="mt-2 font-body text-xs text-ink-dim">{q.explanation}</p>
              <button className="pixel-btn mt-3 !text-[10px]" onClick={nextQuestion}>
                {qIndex + 1 < quiz.questions.length ? 'NEXT →' : 'FINISH QUEST →'}
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    )
  }

  // ── Result ───────────────────────────────────────────────────────
  const total = quiz.questions.length
  const passed = correctCount / total >= PASS_RATIO
  return (
    <div className="space-y-4 text-center">
      <p aria-hidden="true" className="text-5xl">{passed ? '🏆' : '💀'}</p>
      <h3 className="text-xs" style={{ color: passed ? 'var(--neon)' : 'var(--pix-orange)' }}>
        {passed ? 'QUEST CLEARED!' : 'QUEST FAILED — RESPAWN?'}
      </h3>
      <p className="font-body text-sm text-ink-dim">
        {topic.icon} {topic.label}: {correctCount}/{total} correct · +{earnedXp} XP
        {passed
          ? ' · topic marked as cleared.'
          : ` · score ${Math.round(PASS_RATIO * 100)}%+ to clear the topic.`}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <button className="pixel-btn !text-[10px]" onClick={() => startTopic(topic)}>
          🔁 {passed ? 'REPLAY TOPIC' : 'TRY AGAIN'}
        </button>
        <button className="pixel-btn pixel-btn--warn !text-[10px]" onClick={() => { sfx.blip(); setPhase('pick') }}>
          🗺️ TOPIC MAP
        </button>
      </div>
    </div>
  )
}
