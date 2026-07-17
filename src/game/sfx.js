// Retro sound engine synthesized with the Web Audio API — no audio assets,
// nothing to license. Inspired by bruno-simon.com: the world itself makes
// playful noises (footsteps, coins, chimes) over a quiet chiptune loop.
// Every call checks the store's mute flag; everything is wrapped so audio
// problems can never crash the game.

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

/** One note. freq in Hz, dur in seconds, when = seconds from now (or absolute if abs). */
function tone(freq, dur = 0.08, type = 'square', gain = 0.04, when = 0, abs = false) {
  const ac = audioCtx()
  if (!ac) return
  try {
    const osc = ac.createOscillator()
    const g = ac.createGain()
    const t = abs ? when : ac.currentTime + when
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

/** Short filtered noise burst (steps, hats). */
function noise(dur = 0.04, gain = 0.02, freq = 3000, when = 0, abs = false) {
  const ac = audioCtx()
  if (!ac) return
  try {
    const t = abs ? when : ac.currentTime + when
    const len = Math.max(1, Math.floor(ac.sampleRate * dur))
    const buf = ac.createBuffer(1, len, ac.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
    const src = ac.createBufferSource()
    src.buffer = buf
    const filter = ac.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = freq
    const g = ac.createGain()
    g.gain.setValueAtTime(gain, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    src.connect(filter).connect(g).connect(ac.destination)
    src.start(t)
  } catch {
    /* silent */
  }
}

const muted = () => useGameStore.getState().mute

// ── Ambient chiptune loop ─────────────────────────────────────────────
// A-minor pentatonic arpeggio over a slow bass, scheduled ahead of time.
// Very quiet on purpose: ambience, not a ringtone.

const TEMPO = 108
const STEP = 60 / TEMPO / 4 // one 16th note
const BARS = 4
const STEPS = BARS * 16

// lead pattern (16ths, 0 = rest), A-minor pentatonic around A4
const LEAD = [
  440, 0, 523.25, 0, 659.25, 0, 783.99, 0, 659.25, 0, 523.25, 0, 440, 0, 0, 0,
  392, 0, 440, 0, 523.25, 0, 659.25, 0, 523.25, 0, 440, 0, 392, 0, 0, 0,
  329.63, 0, 392, 0, 440, 0, 523.25, 0, 587.33, 0, 523.25, 0, 440, 0, 0, 0,
  392, 0, 440, 0, 523.25, 0, 440, 0, 392, 0, 329.63, 0, 293.66, 0, 0, 0,
]
// one bass note per bar (A2, F2, C3, G2)
const BASS = [110, 87.31, 130.81, 98]

let musicTimer = null
let nextNoteTime = 0
let step = 0

function scheduleStep(s, t) {
  const lead = LEAD[s % STEPS]
  if (lead) tone(lead, STEP * 1.8, 'square', 0.012, t, true)
  if (s % 16 === 0) tone(BASS[Math.floor(s / 16) % BASS.length], STEP * 14, 'triangle', 0.022, t, true)
  if (s % 8 === 4) noise(0.03, 0.006, 5000, t, true) // off-beat hat
}

function scheduler() {
  const ac = audioCtx()
  if (!ac) return
  while (nextNoteTime < ac.currentTime + 0.15) {
    if (!muted() && typeof document !== 'undefined' && !document.hidden) {
      scheduleStep(step, nextNoteTime)
    }
    nextNoteTime += STEP
    step = (step + 1) % STEPS
  }
}

export const sfx = {
  /** Start the ambient loop (call from a user gesture, e.g. PRESS START). */
  startMusic() {
    const ac = audioCtx()
    if (!ac || musicTimer) return
    nextNoteTime = ac.currentTime + 0.1
    step = 0
    musicTimer = setInterval(scheduler, 50)
  },
  stopMusic() {
    if (musicTimer) clearInterval(musicTimer)
    musicTimer = null
  },

  /** UI click / menu move */
  blip() {
    if (muted()) return
    tone(520, 0.06)
  },
  /** Soft hover tick (checkpoints, Bugsy) */
  hover() {
    if (muted()) return
    tone(880, 0.03, 'triangle', 0.015)
  },
  /** Typewriter tick */
  chat() {
    if (muted()) return
    tone(760, 0.05, 'triangle', 0.03)
  },
  /** Footstep while walking the path */
  step() {
    if (muted()) return
    noise(0.035, 0.015, 1200)
    tone(140 + Math.random() * 30, 0.04, 'triangle', 0.02)
  },
  /** Passing a checkpoint on foot */
  ding() {
    if (muted()) return
    tone(1046.5, 0.14, 'triangle', 0.03)
    tone(1568, 0.18, 'triangle', 0.02, 0.08)
  },
  /** Hero jump */
  jump() {
    if (muted()) return
    tone(320, 0.09, 'square', 0.035)
    tone(560, 0.12, 'square', 0.03, 0.07)
  },
  /** Bugsy chirp when poked */
  bugsy() {
    if (muted()) return
    tone(900, 0.06, 'triangle', 0.04)
    tone(1250, 0.08, 'triangle', 0.04, 0.07)
    tone(1500, 0.1, 'triangle', 0.03, 0.15)
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
