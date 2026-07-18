import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useUiStore } from '../store/useUiStore'
import { sfx } from '../game/sfx'
import { trackEvent } from '../game/analytics'

/** THE END screen: a centered panel that appears once the whole party —
 * hero, Bugsy and the cat — has taken the final leap off the cliff. The lap
 * only restarts when the player presses the button (no more auto-respawn). */
export default function EndScreen() {
  const endOpen = useUiStore((s) => s.endOpen)
  const setEndOpen = useUiStore((s) => s.setEndOpen)

  // lock the page while open so a stray swipe can't scroll the world behind
  // the panel (and accidentally dismiss the ending mid-read)
  useEffect(() => {
    if (!endOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [endOpen])

  function startAgain() {
    sfx.coin()
    trackEvent('loop_restarted')
    // unlock BEFORE scrolling, and use the classic two-arg form — older
    // mobile Safari throws on `behavior: 'instant'`, which made this button
    // look dead on some phones
    document.body.style.overflow = ''
    window.scrollTo(0, 0)
    setEndOpen(false)
  }

  return (
    <AnimatePresence>
      {endOpen && (
        <motion.div
          data-ui=""
          className="fixed inset-0 z-40 flex items-center justify-center bg-night/80 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <motion.div
            role="dialog"
            aria-label="The end — start again"
            className="pixel-panel w-full max-w-md !border-pix-yellow text-center"
            initial={{ scale: 0.85, y: 28 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 16 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          >
            {/* the falling party, replayed as tiny sprites */}
            <div aria-hidden="true" className="flex items-end justify-center gap-3 text-3xl">
              <motion.span
                animate={{ y: [0, -8, 0], rotate: [0, -14, 0] }}
                transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
              >
                🐞
              </motion.span>
              <motion.span
                className="text-4xl"
                animate={{ y: [0, -12, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              >
                🏃
              </motion.span>
              <motion.span
                animate={{ y: [0, -7, 0], rotate: [0, 12, 0] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut', delay: 0.3 }}
              >
                🐱
              </motion.span>
            </div>

            <p className="mt-4 font-pixel text-sm text-pix-yellow sm:text-base">🏁 THE END</p>
            <p className="mt-2 font-pixel text-[9px] leading-relaxed text-neon">LOOP COMPLETE — +25 XP LAP BONUS</p>
            <p className="mx-auto mt-3 max-w-xs font-body text-xs leading-relaxed text-ink-dim">
              The whole party took the leap — you, Bugsy and the cat. The road is
              a circle: everything you unlocked stays yours.
            </p>

            <motion.button
              className="pixel-btn press-start-blink mt-5 !border-pix-yellow !px-8 !py-4 !text-xs sm:!text-sm"
              onClick={startAgain}
              autoFocus
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              ▶ START FROM THE BEGINNING
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
