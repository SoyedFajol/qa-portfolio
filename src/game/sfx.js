// Tiny retro sound effects synthesized with the Web Audio API — no audio
// assets to download, nothing to license. Every call checks the store's mute
// flag, and everything is wrapped so audio problems can never crash the game.

import { useGameStore } from '../store/useGameStore'

let ctx = null

function audioCtx() {
  if (typeof window === 'undefined') return null
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  } catch {
    return null
  }
}

/** One square-wave blip. freq in Hz, dur in seconds. */
function tone(freq, dur = 0.08, type = 'square', gain = 0.04, when = 0) {
  const ac = audioCtx()
  if (!ac) return
  try {
    const osc = ac.createOscillator()
    const g = ac.createGain()
    const t = ac.currentTime + when
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    g.gain.setValueAtTime(gain, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(g).connect(ac.destination)
    osc.start(t)
    osc.stop(t + dur + 0.02)
  } catch {
    /* audio blocked — stay silent */
  }
}

const muted = () => useGameStore.getState().mute

export const sfx = {
  /** UI click / menu move */
  blip() {
    if (muted()) return
    tone(520, 0.06)
  },
  /** Message received / typewriter tick */
  chat() {
    if (muted()) return
    tone(760, 0.05, 'triangle', 0.03)
  },
  /** Correct answer */
  success() {
    if (muted()) return
    tone(523, 0.08)
    tone(784, 0.1, 'square', 0.04, 0.09)
  },
  /** Wrong answer */
  error() {
    if (muted()) return
    tone(196, 0.16, 'sawtooth', 0.035)
  },
  /** Coin / XP pickup */
  coin() {
    if (muted()) return
    tone(988, 0.05)
    tone(1319, 0.12, 'square', 0.035, 0.06)
  },
  /** LEVEL UP! fanfare */
  levelUp() {
    if (muted()) return
    ;[523, 659, 784, 1047].forEach((f, i) => tone(f, 0.12, 'square', 0.045, i * 0.1))
  },
  /** Achievement unlocked */
  achievement() {
    if (muted()) return
    ;[784, 988, 1175].forEach((f, i) => tone(f, 0.1, 'triangle', 0.045, i * 0.08))
  },
}
