import { AnimatePresence, motion } from 'framer-motion'
import { useUiStore } from '../store/useUiStore'
import { sfx } from '../game/sfx'
import { trackEvent } from '../game/analytics'

/** End-of-road bar: slides up after the cliff fall finishes. The lap only
 * restarts when the player presses START NOW (no more auto-respawn). */
export default function EndScreen() {
  const endOpen = useUiStore((s) => s.endOpen)
  const setEndOpen = useUiStore((s) => s.setEndOpen)

  function startNow() {
    sfx.coin()
    trackEvent('loop_restarted')
    setEndOpen(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  return (
    <AnimatePresence>
      {endOpen && (
        <motion.div
          role="dialog"
          aria-label="End of the road"
          className="fixed inset-x-0 bottom-0 z-40 border-t-4 border-pix-yellow bg-night/95 px-4 pb-6 pt-5 text-center"
          initial={{ y: 140 }}
          animate={{ y: 0 }}
          exit={{ y: 140 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        >
          <p className="font-pixel text-xs text-pix-yellow sm:text-sm">
            🏁 THE END — LOOP COMPLETE!
          </p>
          <p className="mx-auto mt-2 max-w-md font-body text-xs text-ink-dim">
            You walked the whole road and took the final leap. +25 XP lap bonus 🌀
          </p>
          <motion.button
            className="pixel-btn press-start-blink mt-4 !border-pix-yellow !px-8 !py-3 !text-xs"
            onClick={startNow}
            autoFocus
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            ▶ START NOW
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
