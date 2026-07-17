// Per-visit UI state (never persisted): which overlay is open, chat window,
// intro state, render mode, and the transient toast / level-up queues.

import { create } from 'zustand'

let toastSeq = 0

export const useUiStore = create((set, get) => ({
  started: false,          // PRESS START pressed
  activeSection: null,     // section id or null (world view)
  navOpen: false,
  mapOpen: false,          // world-map popup (auto-opens once after start)
  flatMode: false,         // true = no-3D fallback (WebGL missing, reduced motion, or user choice)
  flatModeReason: null,    // 'webgl' | 'motion' | 'user' | null
  zoom: 1,                 // camera zoom factor (0.55 close … 2.4 bird's-eye)
  toasts: [],              // { id, icon, title, desc }
  levelUpTo: null,         // level number while the LEVEL UP! burst is showing

  start: () => set({ started: true }),

  openSection: (id) => set({ activeSection: id, navOpen: false }),
  closeSection: () => set({ activeSection: null }),

  setNavOpen: (navOpen) => set({ navOpen }),
  setMapOpen: (mapOpen) => set({ mapOpen }),

  zoomBy: (delta) =>
    set({ zoom: Math.min(2.4, Math.max(0.55, get().zoom + delta)) }),

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
