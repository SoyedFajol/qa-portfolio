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

      <section aria-label="Bonus side quests">
        <h3 className="mb-2 text-[10px] text-neon">🌟 BONUS QUESTS COMPLETED</h3>
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
