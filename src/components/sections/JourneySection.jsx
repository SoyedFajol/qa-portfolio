import { motion } from 'framer-motion'
import { PROFILE } from '../../data/profile'

/** The 6-milestone story arc + real experience details. */
export default function JourneySection() {
  return (
    <div className="space-y-6 font-body text-sm">
      <ol className="relative space-y-4 border-l-4 border-panel-2 pl-5">
        {PROFILE.story.map((m, i) => (
          <motion.li
            key={m.title}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.09 }}
          >
            <span
              aria-hidden="true"
              className="absolute -left-[15px] flex h-6 w-6 items-center justify-center border-2 border-panel-2 bg-panel text-xs"
            >
              {m.icon}
            </span>
            <p className="font-pixel text-[10px] text-neon">
              CHAPTER {i + 1} — {m.title}
            </p>
            <p className="mt-1 text-ink-dim">{m.desc}</p>
          </motion.li>
        ))}
      </ol>

      <div className="space-y-4">
        {PROFILE.experience.map((job) => (
          <div key={job.company} className="pixel-panel !border-pix-purple">
            <p className="font-pixel text-[10px] text-pix-yellow">{job.role}</p>
            <p className="mt-1 text-xs text-ink-dim">
              {job.company} · {job.period}
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-ink-dim">
              {job.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        ))}
        <div className="pixel-panel">
          <p className="font-pixel text-[10px] text-pix-yellow">🎓 {PROFILE.education.degree}</p>
          <p className="mt-1 text-xs text-ink-dim">
            {PROFILE.education.school} · CGPA {PROFILE.education.cgpa}
          </p>
          <ul className="mt-3 space-y-2 border-t-2 border-panel-2 pt-3">
            {PROFILE.schooling.map((s) => (
              <li key={s.school} className="text-xs text-ink-dim">
                <span className="font-pixel text-[9px] text-neon">🏫 {s.school}</span>
                <span className="mt-0.5 block">{s.note}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t-2 border-panel-2 pt-3 text-xs text-ink-dim">
            🏡 Hometown: {PROFILE.hometown}
          </p>
        </div>
      </div>
    </div>
  )
}
