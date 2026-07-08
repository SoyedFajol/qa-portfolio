import { PROFILE } from '../data/profile'
import { SECTIONS } from '../data/sections'
import { useGameStore } from '../store/useGameStore'
import { useUiStore } from '../store/useUiStore'
import { sfx } from '../game/sfx'

/**
 * The no-3D world (gate H4): used when WebGL is unavailable, when the user
 * prefers reduced motion, or when they toggle 2D mode. Everything the 3D
 * world offers is reachable here as a plain scrollable page.
 */
export default function FlatWorld() {
  const openSection = useUiStore((s) => s.openSection)
  const flatModeReason = useUiStore((s) => s.flatModeReason)
  const visited = useGameStore((s) => s.progress.sectionsVisited)

  return (
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-28">
      <header className="mb-8 text-center">
        <p aria-hidden="true" className="text-4xl">🐞</p>
        <h1 className="mt-3 text-sm leading-relaxed text-pix-yellow sm:text-base">{PROFILE.name}</h1>
        <p className="mt-3 font-body text-sm text-ink-dim">{PROFILE.title}</p>
        {flatModeReason === 'webgl' && (
          <p className="mt-3 font-body text-xs text-pix-orange">
            Your browser couldn&apos;t start the 3D world — running the map view instead. Same loot, fewer polygons.
          </p>
        )}
      </header>

      <section aria-label="The journey" className="mb-8">
        <h2 className="mb-3 text-[10px] text-neon">— THE STORY SO FAR —</h2>
        <ol className="space-y-2">
          {PROFILE.story.map((m, i) => (
            <li key={m.title} className="pixel-panel !p-3 font-body text-sm">
              <span aria-hidden="true">{m.icon} </span>
              <span className="font-pixel text-[9px] text-pix-yellow">CH.{i + 1} </span>
              {m.title} — <span className="text-ink-dim">{m.desc}</span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-label="World levels">
        <h2 className="mb-3 text-[10px] text-neon">— SELECT A LEVEL —</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              className="pixel-btn !text-left !text-[10px]"
              onClick={() => {
                sfx.blip()
                openSection(s.id)
              }}
            >
              {s.icon} {s.label}
              {visited.includes(s.id) && <span className="text-neon"> ✓</span>}
              <span className="mt-1 block font-body text-xs normal-case text-ink-dim">{s.blurb}</span>
            </button>
          ))}
        </div>
      </section>

      <footer className="mt-10 text-center font-body text-xs text-ink-dim">
        <a className="underline hover:text-ink" href="/privacy">Privacy</a>
        {' · '}
        <a className="underline hover:text-ink" href="/terms">Terms</a>
        {' · '}
        <a className="underline hover:text-ink" href={`mailto:${PROFILE.email}?subject=🐞 Bug report — qa-portfolio`}>
          🐞 Report a bug
        </a>
      </footer>
    </main>
  )
}
