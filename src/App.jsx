// Phase 1 scaffold screen: proves palette, fonts, store, persistence and the
// shared profile module are wired. Replaced by the 3D world in Phase 2.

import { PROFILE } from './data/profile'
import { useGameStore } from './store/useGameStore'
import { rankForLevel, progressToNext } from './game/progression'

function StatusRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b-2 border-panel-2 py-2 text-sm">
      <span className="text-ink-dim">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  )
}

export default function App() {
  const { xp, level, achievements, mute, addXp, toggleMute, resetSave } = useGameStore()
  const rank = rankForLevel(level)
  const { pct, next } = progressToNext(xp)

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 p-4">
      <header className="text-center">
        <p className="font-pixel text-xs text-neon">— SYSTEMS CHECK · PHASE 1 —</p>
        <h1 className="mt-4 text-base text-pix-yellow sm:text-xl">{PROFILE.name}</h1>
        <p className="mt-3 text-sm text-ink-dim">{PROFILE.title}</p>
      </header>

      <section className="pixel-panel w-full" aria-label="Save file status">
        <h2 className="mb-3 text-xs text-neon">SAVE FILE: qa-portfolio-save-v1</h2>
        <StatusRow label="RANK" value={`Lv.${level} ${rank.title}`} />
        <StatusRow label="XP" value={next === null ? `${xp} (MAX)` : `${xp} / ${next}`} />
        <StatusRow label="ACHIEVEMENTS" value={achievements.length} />
        <StatusRow label="SOUND" value={mute ? 'MUTED' : 'ON'} />
        <div
          className="xp-track mt-4"
          role="progressbar"
          aria-label="XP progress to next level"
          aria-valuenow={Math.round(pct * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="xp-fill" style={{ width: `${pct * 100}%` }} />
        </div>
      </section>

      <div className="flex flex-wrap justify-center gap-3">
        <button className="pixel-btn" onClick={() => addXp(25)}>
          +25 XP (debug)
        </button>
        <button className="pixel-btn pixel-btn--warn" onClick={toggleMute}>
          {mute ? 'UNMUTE' : 'MUTE'}
        </button>
        <button className="pixel-btn pixel-btn--danger" onClick={resetSave}>
          RESET SAVE
        </button>
      </div>

      <footer className="text-center text-xs text-ink-dim">
        <p>
          Refresh the page — XP and settings persist. The 3D world arrives in Phase 2.
        </p>
        <p className="mt-2">
          <a className="text-neon underline" href={`mailto:${PROFILE.email}`}>
            {PROFILE.email}
          </a>{' '}
          ·{' '}
          <a className="text-neon underline" href={PROFILE.github} target="_blank" rel="noreferrer">
            GitHub
          </a>{' '}
          ·{' '}
          <a className="text-neon underline" href={PROFILE.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </p>
      </footer>
    </main>
  )
}
