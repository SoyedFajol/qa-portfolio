import { ROADMAP } from '../../data/projects'

const STATUS = {
  done: { badge: '✅ CLEARED', color: 'var(--neon)' },
  active: { badge: '🔵 CURRENT QUEST', color: 'var(--pix-yellow)' },
  locked: { badge: '🔒 LOCKED', color: 'var(--ink-dim)' },
}

/** Skill-tree roadmap with real, honest states. */
export default function RoadmapSection() {
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
            <span aria-hidden="true" className="text-2xl">
              {step.icon}
            </span>
            <div className="flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-[10px]" style={{ color: st.color }}>
                  {i + 1}. {step.title}
                </h3>
                <span className="font-pixel text-[8px]" style={{ color: st.color }}>
                  {st.badge}
                </span>
              </div>
              <p className="mt-1 font-body text-xs text-ink-dim">{step.desc}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
