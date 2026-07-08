import { motion } from 'framer-motion'
import { PROJECTS } from '../../data/projects'
import { sfx } from '../../game/sfx'

/** Arcade cabinets — one per project. */
export default function ProjectsSection() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {PROJECTS.map((p, i) => (
        <motion.article
          key={p.id}
          className="pixel-panel flex flex-col !border-pix-purple"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
        >
          <div
            aria-hidden="true"
            className="mb-3 flex h-20 items-center justify-center border-4 border-panel-2 bg-night text-4xl"
          >
            {p.icon}
          </div>
          <h3 className="text-[10px] text-pix-yellow">{p.title}</h3>
          <p className="mt-1 font-pixel text-[8px] text-neon">{p.subtitle}</p>
          <p className="mt-2 flex-1 font-body text-xs text-ink-dim">{p.desc}</p>
          <ul className="mt-3 flex flex-wrap gap-1">
            {p.tags.map((t) => (
              <li key={t} className="border border-panel-2 bg-night/60 px-1.5 py-0.5 font-body text-[10px] text-ink-dim">
                {t}
              </li>
            ))}
          </ul>
          {p.url && (
            <a
              className="pixel-btn mt-3 text-center !text-[9px]"
              href={p.url}
              target="_blank"
              rel="noreferrer"
              onClick={() => sfx.blip()}
            >
              ▶ {p.cta}
            </a>
          )}
        </motion.article>
      ))}
    </div>
  )
}
