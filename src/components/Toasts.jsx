import { motion, AnimatePresence } from 'framer-motion'
import { useUiStore } from '../store/useUiStore'

/** Achievement / info toasts, bottom-left, announced politely to SRs. */
export default function Toasts() {
  const toasts = useUiStore((s) => s.toasts)
  return (
    <div
      className="pointer-events-none fixed bottom-3 left-3 z-50 flex w-72 flex-col gap-2"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            className="pixel-panel !border-pix-yellow !p-3"
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -80, opacity: 0 }}
          >
            <p className="font-pixel text-[9px] text-pix-yellow">
              <span aria-hidden="true">{t.icon} </span>
              {t.title}
            </p>
            {t.desc && <p className="mt-1 font-body text-xs text-ink-dim">{t.desc}</p>}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
