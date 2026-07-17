import { useState } from 'react'
import { motion } from 'framer-motion'
import { PROFILE } from '../data/profile'
import { useUiStore } from '../store/useUiStore'
import { sfx } from '../game/sfx'
import { trackEvent } from '../game/analytics'
import Typewriter from './Typewriter'

/** PRESS START title screen. */
export default function IntroScreen() {
  const start = useUiStore((s) => s.start)
  const [nameDone, setNameDone] = useState(false)

  function pressStart() {
    sfx.coin() // first user gesture also unlocks the AudioContext
    sfx.startMusic() // ambient chiptune loop (respects the mute toggle)
    trackEvent('press_start')
    start()
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-night p-6 text-center"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* drifting pixel sprites */}
      {['⭐', '👾', '🍄', '🗡️', '💎', '⭐', '🏆', '🎮'].map((e, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="pointer-events-none absolute text-2xl opacity-40"
          style={{ left: `${8 + i * 11.5}%`, top: `${12 + ((i * 29) % 70)}%` }}
          animate={{ y: [0, i % 2 ? -18 : 14, 0], rotate: [0, i % 2 ? 12 : -12, 0] }}
          transition={{ repeat: Infinity, duration: 3.5 + (i % 3), ease: 'easeInOut' }}
        >
          {e}
        </motion.span>
      ))}
      <motion.p
        aria-hidden="true"
        className="text-5xl"
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
      >
        🐞
      </motion.p>
      <div>
        <h1 className="text-base leading-relaxed text-pix-yellow sm:text-2xl">
          <Typewriter text={PROFILE.displayName.toUpperCase()} speed={55} onDone={() => setNameDone(true)} />
        </h1>
        {nameDone && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="mt-4 font-pixel text-[10px] leading-relaxed text-neon sm:text-xs">
              {PROFILE.headline}
            </p>
            <p className="mt-2 font-body text-xs text-ink-dim">
              {PROFILE.name} · Builder of fun things
            </p>
          </motion.div>
        )}
      </div>

      <motion.button
        className="pixel-btn press-start-blink !border-pix-yellow !px-8 !py-4 !text-sm"
        onClick={pressStart}
        autoFocus
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        ▶ PRESS START
      </motion.button>

      <p className="max-w-sm font-body text-xs text-ink-dim">
        Scroll to walk through my world. Open the glowing checkpoints. Talk to
        Bugsy. Earn XP. Find bugs (please report them 🐞).
      </p>
    </motion.div>
  )
}
