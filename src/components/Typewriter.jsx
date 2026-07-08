import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { sfx } from '../game/sfx'

/**
 * Retro typewriter text. Instantly complete under prefers-reduced-motion.
 * Screen readers get the full text immediately via aria-label.
 */
export default function Typewriter({ text, speed = 28, sound = false, className = '', onDone }) {
  const reduced = usePrefersReducedMotion()
  const [count, setCount] = useState(reduced ? text.length : 0)
  const doneRef = useRef(false)

  useEffect(() => {
    doneRef.current = false
    if (reduced) {
      setCount(text.length)
      return
    }
    setCount(0)
    let i = 0
    const timer = setInterval(() => {
      i += 1
      setCount(i)
      if (sound && i % 3 === 0) sfx.chat()
      if (i >= text.length) clearInterval(timer)
    }, speed)
    return () => clearInterval(timer)
  }, [text, speed, sound, reduced])

  useEffect(() => {
    if (count >= text.length && !doneRef.current) {
      doneRef.current = true
      onDone?.()
    }
  }, [count, text, onDone])

  return (
    <span className={className} aria-label={text} role="text">
      <span aria-hidden="true">{text.slice(0, count)}</span>
      {count < text.length && <span aria-hidden="true" className="tw-caret">▌</span>}
    </span>
  )
}
