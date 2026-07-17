import { useState } from 'react'
import { motion } from 'framer-motion'
import { ROADMAP } from '../../data/projects'
import { ROADMAPS } from '../../data/roadmaps'
import { sfx } from '../../game/sfx'

const STATUS = {
  done: { badge: '✅ CLEARED', color: 'var(--neon)' },
  active: { badge: '🔵 CURRENT QUEST', color: 'var(--pix-yellow)' },
  locked: { badge: '🔒 LOCKED', color: 'var(--ink-dim)' },
}

/** Soyed's own path, with his real honest states. */
function MyPath() {
  return (
    <ol className="space-y-3">
      {ROADMAP.map((step, i) => {
        const st = STATUS[step.status]
        return (
          <li
            key={step.id}
            className="pixel-panel flex items-start gap-3"
            style={{ borderColor: st.color, opacity: step.status === 'locked' ? 0.75 : 1 }}
          >
            <span aria-hidden="true" className="text-2xl">{step.icon}</span>
            <div className="flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-[10px]" style={{ color: st.color }}>
                  {i + 1}. {step.title}
                </h3>
                <span className="font-pixel text-[8px]" style={{ color: st.color }}>{st.badge}</span>
              </div>
              <p className="mt-1 font-body text-xs text-ink-dim">{step.desc}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/** One career skill tree with linked resources per step. */
function CareerPath({ map }) {
  return (
    <div className="space-y-3">
      <p className="font-body text-sm text-ink-dim">{map.tagline}</p>
      <ol className="space-y-3">
        {map.steps.map((step, i) => (
          <motion.li
            key={step.title}
            className="pixel-panel !border-pix-purple"
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <h3 className="text-[10px] text-pix-yellow">
              LV.{i + 1} — {step.title}
            </h3>
            <p className="mt-1.5 font-body text-xs text-ink-dim">{step.desc}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {step.links.map((l) => (
                <a
                  key={l.url}
                  className="border-2 border-neon bg-night px-2 py-1 font-pixel text-[8px] text-neon transition-colors hover:bg-panel-2"
                  href={l.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={() => sfx.coin()}
                >
                  📜 {l.label}
                </a>
              ))}
            </div>
          </motion.li>
        ))}
      </ol>
      <p className="font-body text-[11px] text-ink-dim">
        All resources are reputable and mostly free. Order matters less than
        momentum — start anywhere, keep walking. 🐞
      </p>
    </div>
  )
}

/** The roadmaps hub: pick a class → its skill tree appears, with resources. */
export default function RoadmapSection() {
  const [selected, setSelected] = useState(null) // null | 'me' | roadmap id

  if (selected) {
    const map = selected === 'me' ? null : ROADMAPS.find((r) => r.id === selected)
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-[10px] text-neon">
            {selected === 'me' ? '🐞 SOYED’S OWN PATH' : `${map.icon} ${map.title.toUpperCase()} ROADMAP`}
          </h3>
          <button
            className="pixel-btn !px-3 !py-2 !text-[9px]"
            onClick={() => {
              sfx.blip()
              setSelected(null)
            }}
          >
            ← ALL ROADMAPS
          </button>
        </div>
        {selected === 'me' ? <MyPath /> : <CareerPath map={map} />}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="font-body text-sm text-ink-dim">
        Pick a class to open its skill tree — step-by-step paths with curated
        free resources. Whatever you want to become, the first level starts today.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        <motion.button
          className="pixel-btn !border-pix-yellow !text-left !text-[10px]"
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            sfx.blip()
            setSelected('me')
          }}
        >
          🐞 Soyed’s Own Path
          <span className="mt-1 block font-body text-xs normal-case text-ink-dim">
            The real one — with honest CLEARED / CURRENT / LOCKED states
          </span>
        </motion.button>
        {ROADMAPS.map((r) => (
          <motion.button
            key={r.id}
            className="pixel-btn !text-left !text-[10px]"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              sfx.blip()
              setSelected(r.id)
            }}
          >
            {r.icon} {r.title}
            <span className="mt-1 block font-body text-xs normal-case text-ink-dim">{r.tagline}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
