import { PROFILE } from '../../data/profile'

const LEVEL_LABELS = { 3: 'STRONG', 2: 'WORKING', 1: 'LEARNING' }
const LEVEL_COLORS = { 3: 'var(--neon)', 2: 'var(--pix-yellow)', 1: 'var(--pix-orange)' }

function SkillBar({ name, level }) {
  return (
    <li className="border-2 border-panel-2 bg-night/50 p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-body text-sm">{name}</span>
        <span className="font-pixel text-[8px]" style={{ color: LEVEL_COLORS[level] }}>
          {LEVEL_LABELS[level]}
        </span>
      </div>
      <div
        className="skill-track mt-2"
        role="meter"
        aria-label={`${name}: ${LEVEL_LABELS[level].toLowerCase()}`}
        aria-valuenow={level}
        aria-valuemin={0}
        aria-valuemax={3}
      >
        <div
          className="skill-fill"
          style={{ width: `${(level / 3) * 100}%`, background: LEVEL_COLORS[level] }}
        />
      </div>
    </li>
  )
}

function Badges({ items, color = 'var(--pix-purple)' }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((t) => (
        <li
          key={t}
          className="border-2 bg-night/50 px-2 py-1 font-body text-xs"
          style={{ borderColor: color }}
        >
          {t}
        </li>
      ))}
    </ul>
  )
}

/** RPG inventory: honest level bars + tool badges + the secret dev class. */
export default function SkillsSection() {
  const s = PROFILE.skills
  return (
    <div className="space-y-5 text-sm">
      <p className="font-body text-ink-dim">
        Honest bars — no maxed-out everything. STRONG is daily craft, WORKING is
        real projects, LEARNING is an active quest.
      </p>

      {[
        ['⚔️ Testing', s.testing],
        ['🛡️ Automation Frameworks', s.frameworks],
        ['🧪 Programming', s.programming],
      ].map(([title, list]) => (
        <section key={title} aria-label={title}>
          <h3 className="mb-2 text-[10px] text-neon">{title}</h3>
          <ul className="grid gap-2 sm:grid-cols-2">
            {list.map((sk) => (
              <SkillBar key={sk.name} {...sk} />
            ))}
          </ul>
        </section>
      ))}

      <section aria-label="Databases and tools">
        <h3 className="mb-2 text-[10px] text-neon">🗄️ Databases</h3>
        <Badges items={s.databases} />
        <h3 className="mb-2 mt-4 text-[10px] text-neon">🧰 Tools</h3>
        <Badges items={s.tools} />
        <h3 className="mb-2 mt-4 text-[10px] text-neon">🔌 APIs</h3>
        <Badges items={s.apis} />
      </section>

      <section className="pixel-panel !border-pix-yellow" aria-label="Secret class: developer">
        <h3 className="text-[10px] text-pix-yellow">✨ SECRET CLASS UNLOCKED: DEVELOPER</h3>
        <p className="mt-2 font-body text-xs text-ink-dim">
          Former Java intern — reads stack traces, writes Spring Boot, and speaks
          fluent developer. A QA who can code is a boss-level teammate.
        </p>
        <div className="mt-3">
          <Badges items={s.secretClass} color="var(--pix-yellow)" />
        </div>
      </section>
    </div>
  )
}
