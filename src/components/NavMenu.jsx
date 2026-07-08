import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SECTIONS } from '../data/sections'
import { useGameStore } from '../store/useGameStore'
import { useUiStore } from '../store/useUiStore'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { sfx } from '../game/sfx'

/**
 * Level-select menu. Doubles as the accessibility fallback: every section is
 * reachable here without 3D, scrolling, or a pointer (gate H4).
 */
export default function NavMenu() {
  const ref = useRef(null)
  const { navOpen, setNavOpen, openSection } = useUiStore()
  const visited = useGameStore((s) => s.progress.sectionsVisited)
  const resetSave = useGameStore((s) => s.resetSave)
  useFocusTrap(ref, navOpen, () => setNavOpen(false))

  return (
    <AnimatePresence>
      {navOpen && (
        <motion.div
          className="fixed inset-0 z-40 overflow-y-auto bg-black/80 p-3 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label="Level select"
            tabIndex={-1}
            className="pixel-panel mx-auto max-w-2xl"
          >
            <header className="mb-4 flex items-center justify-between border-b-4 border-panel-2 pb-3">
              <h2 className="text-xs text-pix-yellow sm:text-sm">🗺️ LEVEL SELECT</h2>
              <button
                className="pixel-btn pixel-btn--danger !px-3 !py-2"
                onClick={() => {
                  sfx.blip()
                  setNavOpen(false)
                }}
                aria-label="Close menu"
              >
                ✕
              </button>
            </header>

            <ul className="grid gap-2 sm:grid-cols-2">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <button
                    className="pixel-btn w-full !text-left !text-[10px]"
                    onClick={() => {
                      sfx.blip()
                      openSection(s.id)
                    }}
                  >
                    <span aria-hidden="true">{s.icon} </span>
                    {s.label}
                    {visited.includes(s.id) && (
                      <span className="text-neon" aria-label="visited">
                        {' '}✓
                      </span>
                    )}
                    <span className="mt-1 block font-body text-xs normal-case text-ink-dim">
                      {s.blurb}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t-4 border-panel-2 pt-3">
              <div className="font-body text-xs text-ink-dim">
                <a className="underline hover:text-ink" href="/privacy">Privacy</a>
                {' · '}
                <a className="underline hover:text-ink" href="/terms">Terms</a>
              </div>
              <button
                className="pixel-btn pixel-btn--danger !px-3 !py-2 !text-[9px]"
                onClick={() => {
                  if (window.confirm('Reset your save file? XP, achievements and progress will be wiped.')) {
                    resetSave()
                    sfx.error()
                  }
                }}
              >
                RESET SAVE
              </button>
            </footer>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
