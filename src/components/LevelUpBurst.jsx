import { motion, AnimatePresence } from 'framer-motion'
import { useUiStore } from '../store/useUiStore'
import { rankForLevel } from '../game/progression'

/** Full-screen LEVEL UP! celebration burst. */
export default function LevelUpBurst() {
  const level = useUiStore((s) => s.levelUpTo)
  return (
    <AnimatePresence>
      {level !== null && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-live="assertive"
        >
          <motion.div
            className="text-center"
            initial={{ scale: 0.4 }}
            animate={{ scale: [0.4, 1.15, 1] }}
            transition={{ duration: 0.5, times: [0, 0.7, 1] }}
          >
            <p className="font-pixel text-2xl text-pix-yellow drop-shadow-[4px_4px_0_rgba(0,0,0,0.8)] sm:text-4xl">
              ★ LEVEL UP! ★
            </p>
            <p className="mt-4 font-pixel text-sm text-neon drop-shadow-[3px_3px_0_rgba(0,0,0,0.8)]">
              Lv.{level} — {rankForLevel(level).title}
            </p>
          </motion.div>
          {[...Array(14)].map((_, i) => (
            <motion.span
              key={i}
              aria-hidden="true"
              className="absolute font-pixel text-pix-yellow"
              style={{ left: `${8 + (i * 6.3) % 84}%`, top: '50%' }}
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: -180 - (i % 5) * 40, opacity: 0, rotate: i % 2 ? 180 : -180 }}
              transition={{ duration: 1.4, delay: i * 0.04 }}
            >
              {i % 3 === 0 ? '★' : i % 3 === 1 ? '✦' : '+'}
            </motion.span>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
