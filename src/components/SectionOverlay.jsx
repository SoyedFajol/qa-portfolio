import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { sfx } from '../game/sfx'

/**
 * Pixel dialog overlay for a world section. Focus-trapped, Esc/backdrop
 * closes, content scrolls inside the frame.
 */
export default function SectionOverlay({ open, icon, title, onClose, children, wide = false }) {
  const ref = useRef(null)
  useFocusTrap(ref, open, onClose)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-2 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className={`pixel-panel flex max-h-[92vh] w-full flex-col ${wide ? 'max-w-4xl' : 'max-w-2xl'}`}
            initial={{ scale: 0.92, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          >
            <header className="mb-3 flex items-center justify-between gap-3 border-b-4 border-panel-2 pb-3">
              <h2 className="text-xs text-pix-yellow sm:text-sm">
                <span aria-hidden="true">{icon} </span>
                {title}
              </h2>
              <button
                className="pixel-btn pixel-btn--danger !px-3 !py-2"
                onClick={() => {
                  sfx.blip()
                  onClose()
                }}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
