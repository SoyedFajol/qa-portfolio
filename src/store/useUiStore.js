// Per-visit UI state (never persisted): which overlay is open, chat window,
// intro state, render mode, and the transient toast / level-up queues.

import { create } from 'zustand'

let toastSeq = 0

// Session flags survive same-tab navigation (e.g. /resume → back) so the
// visitor isn't thrown back to PRESS START after every internal page hop.
const session = {
  get: (k) => {
    try {
      return window.sessionStorage.getItem(k)
    } catch {
      return null
    }
  },
  set: (k, v) => {
    try {
      window.sessionStorage.setItem(k, v)
    } catch {
      /* private mode — in-memory behavior still works */
    }
  },
  del: (k) => {
    try {
      window.sessionStorage.removeItem(k)
    } catch {
      /* ignore */
    }
  },
}

export const useUiStore = create((set, get) => ({
  started: session.get('qa-started') === '1', // PRESS START pressed (per tab)
  activeSection: null,     // section id or null (world view)
  navOpen: false,
  mapOpen: false,          // world-map popup (auto-opens once after start)
  flatMode: false,         // true = no-3D fallback (WebGL missing, reduced motion, or user choice)
  flatModeReason: null,    // 'webgl' | 'motion' | 'user' | null
  zoom: 1,                 // camera zoom factor (0.55 close … 2.4 bird's-eye)
  // day between 06:00–18:00 local time, night otherwise; HUD ☀️/🌙 toggles
  theme:
    typeof window !== 'undefined' && new Date().getHours() >= 6 && new Date().getHours() < 18
      ? 'day'
      : 'night',
  toasts: [],              // { id, icon, title, desc }
  levelUpTo: null,         // level number while the LEVEL UP! burst is showing

  start: () => {
    session.set('qa-started', '1')
    set({ started: true })
  },

  openSection: (id) => set({ activeSection: id, navOpen: false }),
  closeSection: () => set({ activeSection: null }),

  setNavOpen: (navOpen) => set({ navOpen }),
  setMapOpen: (mapOpen) => set({ mapOpen }),

  zoomBy: (delta) =>
    set({ zoom: Math.min(3.2, Math.max(0.5, get().zoom + delta)) }),

  toggleTheme: () => set({ theme: get().theme === 'day' ? 'night' : 'day' }),

  /** Full restart: back to the PRESS START screen (used by RESET SAVE). */
  restart: () => {
    session.del('qa-started')
    session.del('qa-map-seen')
    set({ started: false, activeSection: null, navOpen: false, mapOpen: false })
  },

  setFlatMode: (flatMode, reason = 'user') =>
    set({ flatMode, flatModeReason: flatMode ? reason : null }),

  pushToast: (toast) => {
    const id = ++toastSeq
    set({ toasts: [...get().toasts, { id, ...toast }] })
    setTimeout(() => {
      set({ toasts: get().toasts.filter((t) => t.id !== id) })
    }, 4200)
  },

  showLevelUp: (level) => {
    set({ levelUpTo: level })
    setTimeout(() => {
      if (get().levelUpTo === level) set({ levelUpTo: null })
    }, 2600)
  },
}))
