import { useCallback, useState } from 'react'

/**
 * JSON-serialized localStorage state. Safe in private mode / quota errors:
 * falls back to in-memory state instead of throwing.
 * (The main game save uses the zustand store — this hook is for small,
 * standalone bits of persistence like UI preferences.)
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key)
      return raw === null ? initialValue : JSON.parse(raw)
    } catch {
      return initialValue
    }
  })

  const set = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved))
        } catch {
          // storage full or blocked — keep the in-memory value
        }
        return resolved
      })
    },
    [key]
  )

  return [value, set]
}
