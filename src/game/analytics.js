// Thin wrapper over Vercel Analytics custom events. Analytics must never
// break the game — every call is fire-and-forget and swallowed on error.

import { track } from '@vercel/analytics'

export function trackEvent(name, data) {
  try {
    track(name, data)
  } catch {
    /* analytics blocked or offline — fine */
  }
}
