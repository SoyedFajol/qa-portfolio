import { useEffect } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Traps Tab focus inside `ref` while active, focuses the first focusable on
 * mount, calls onClose on Escape, and restores focus on unmount.
 */
export function useFocusTrap(ref, active, onClose) {
  useEffect(() => {
    if (!active || !ref.current) return
    const node = ref.current
    const previous = document.activeElement

    const first = node.querySelector(FOCUSABLE)
    ;(first ?? node).focus()

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose?.()
        return
      }
      if (e.key !== 'Tab') return
      const items = [...node.querySelectorAll(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null
      )
      if (items.length === 0) return
      const firstEl = items[0]
      const lastEl = items[items.length - 1]
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }

    node.addEventListener('keydown', onKeyDown)
    return () => {
      node.removeEventListener('keydown', onKeyDown)
      if (previous instanceof HTMLElement) previous.focus()
    }
  }, [ref, active, onClose])
}
