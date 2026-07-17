import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ROUNDS, sectionsInRound } from '../data/sections'
import { useGameStore } from '../store/useGameStore'
import { useUiStore } from '../store/useUiStore'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { sfx } from '../game/sfx'

const ROUND_COLORS = { 1: 'var(--neon)', 2: 'var(--pix-purple)' }

/**
 * The World Map — pops up right after PRESS START (and from the HUD MAP
 * button): both rounds with every stop and a one-line description, plus the
 * controls legend. Clicking a stop travels there.
 */
export default function WorldMap() {
  const ref = useRef(null)
  const { mapOpen, setMapOpen, openSection, flatMode } = useUiStore()
  const visited = useGameStore((s) => s.progress.sectionsVisited)
  useFocusTrap(ref, mapOpen, () => setMapOpen(false))

  function travelTo(section) {
    sfx.blip()
    setMapOpen(false)
    if (flatMode) {
      openSection(section.id)
      return
    }
    const max = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo({ top: section.at * max, behavior: 'smooth' })
  }

  return (
    <AnimatePresence>
      {mapOpen && (
        <motion.div
          className="fixed inset-0 z-40 overflow-y-auto bg-black/85 p-3 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label="World map"
            tabIndex={-1}
            className="pixel-panel mx-auto max-w-3xl !border-pix-yellow"
          >
            <header className="mb-4 flex items-center justify-between border-b-4 border-panel-2 pb-3">
              <h2 className="text-xs text-pix-yellow sm:text-sm">🗺️ WORLD MAP</h2>
              <button
                className="pixel-btn pixel-btn--danger !px-3 !py-2"
                onClick={() => {
                  sfx.blip()
                  setMapOpen(false)
                }}
                aria-label="Close map"
              >
                ✕
              </button>
            </header>

            <p className="mb-4 font-body text-sm text-ink-dim">
              One circular road around the city. Round 1 tells the story, then a
              gap — <span className="text-pix-yellow">jump it</span> — into Round 2.
              Past the last stop waits the cliff… and the loop begins again. Tap
              any stop to travel straight there.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {ROUNDS.map((round) => (
                <section key={round.id} aria-label={round.title}>
                  <h3 className="mb-1 text-[10px]" style={{ color: ROUND_COLORS[round.id] }}>
                    {round.title}
                  </h3>
                  <p className="mb-2 font-body text-xs text-ink-dim">{round.desc}</p>
                  <motion.ol
                    className="space-y-1.5"
                    initial="hidden"
                    animate="show"
                    variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.15 * round.id } } }}
                  >
                    {sectionsInRound(round.id).map((s, i) => (
                      <motion.li
                        key={s.id}
                        variants={{ hidden: { opacity: 0, x: -14 }, show: { opacity: 1, x: 0 } }}
                      >
                        <button
                          className="w-full border-2 border-panel-2 bg-night/70 p-2 text-left transition-colors hover:border-pix-yellow"
                          onClick={() => travelTo(s)}
                        >
                          <span className="font-pixel text-[9px]" style={{ color: ROUND_COLORS[round.id] }}>
                            {round.id}-{i + 1}
                          </span>{' '}
                          <span aria-hidden="true">{s.icon}</span>{' '}
                          <span className="font-body text-sm">{s.label}</span>
                          {visited.includes(s.id) && <span className="text-neon"> ✓</span>}
                          <span className="mt-0.5 block pl-6 font-body text-xs text-ink-dim">{s.blurb}</span>
                        </button>
                      </motion.li>
                    ))}
                  </motion.ol>
                </section>
              ))}
            </div>

            <footer className="mt-5 border-t-4 border-panel-2 pt-3">
              <p className="text-center font-body text-xs text-ink-dim">
                🖱️ Scroll to walk · 💎 Click crystals · <kbd className="border border-panel-2 px-1 font-pixel text-[9px]">SPACE</kbd> or tap hero to jump · 🪙 Collect coins · 🐞 Poke Bugsy · 🔍 Ctrl+scroll to zoom
              </p>
              <div className="mt-3 text-center">
                <motion.button
                  className="pixel-btn !border-pix-yellow !text-xs"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => {
                    sfx.coin()
                    setMapOpen(false)
                  }}
                >
                  ▶ ENTER THE WORLD
                </motion.button>
              </div>
            </footer>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
