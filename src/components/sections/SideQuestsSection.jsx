import { PROFILE } from '../../data/profile'

const TROPHIES = ['🥇', '🏆', '🎖️']

/** Competitive programming trophies + extra flavor achievements. */
export default function SideQuestsSection() {
  return (
    <div className="space-y-5">
      <section aria-label="Competitive programming trophies">
        <h3 className="mb-2 text-[10px] text-pix-yellow">⚔️ COMPETITIVE PROGRAMMING</h3>
        <ul className="space-y-2">
          {PROFILE.competitive.map((c, i) => (
            <li key={c} className="pixel-panel flex items-center gap-3 !border-pix-yellow !p-3">
              <span aria-hidden="true" className="text-2xl">
                {TROPHIES[i % TROPHIES.length]}
              </span>
              <p className="font-body text-sm">{c}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Athlete class">
        <h3 className="mb-2 text-[10px] text-pix-orange">🏏 ATHLETE CLASS — SPORTSPERSON</h3>
        <ul className="space-y-2">
          {PROFILE.sports.map((sp) => (
            <li key={sp} className="pixel-panel flex items-center gap-2 !border-pix-orange !p-3 font-body text-sm">
              {sp}
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Extracurricular">
        <h3 className="mb-2 text-[10px] text-neon">🌟 EXTRACURRICULAR QUESTS</h3>
        <ul className="space-y-2">
          {PROFILE.extras.map((e) => (
            <li key={e} className="border-2 border-panel-2 bg-night/50 p-3 font-body text-sm text-ink-dim">
              {e}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
