import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { COMPANIES } from '../../data/companies'
import { sfx } from '../../game/sfx'

/** Company Codex: top BD software guilds with careers-page fast travel. */
export default function CompanyDirectory() {
  const [query, setQuery] = useState('')

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return COMPANIES
    return COMPANIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.focus.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
    )
  }, [query])

  return (
    <div className="space-y-4">
      <p className="font-body text-sm text-ink-dim">
        {COMPANIES.length} well-known software guilds in Bangladesh that hire
        QA/SQA and software engineers. The careers page is always the reliable
        channel — details change, so verify on the official site.
      </p>

      <div>
        <label className="sr-only" htmlFor="codex-search">Search companies</label>
        <input
          id="codex-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search guilds… (fintech, QA, Banani, product…)"
          className="w-full border-4 border-panel-2 bg-night p-2 font-body text-sm text-ink placeholder:text-ink-dim focus:border-neon focus:outline-none"
        />
      </div>

      {list.length === 0 ? (
        <p className="pixel-panel text-center font-body text-sm text-ink-dim">
          🕸️ No guild matches “{query}”.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {list.map((c, i) => (
            <motion.li
              key={c.id}
              className={`pixel-panel flex flex-col !p-3 ${c.highlight ? '!border-neon' : '!border-pix-purple'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.5) }}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-body text-sm font-semibold text-ink">🏢 {c.name}</h3>
                {c.highlight && (
                  <span className="whitespace-nowrap font-pixel text-[7px] text-neon">{c.highlight}</span>
                )}
              </div>
              <p className="mt-1 font-body text-xs text-ink-dim">📍 {c.city}</p>
              <p className="mt-1 flex-1 font-body text-xs text-ink-dim">{c.focus}</p>
              <ul className="mt-2 flex flex-wrap gap-1">
                {c.tags.map((t) => (
                  <li key={t} className="border border-panel-2 bg-night/60 px-1.5 py-0.5 font-body text-[10px] text-ink-dim">
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  className="pixel-btn !px-2 !py-1.5 !text-[8px]"
                  href={c.careers}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={() => sfx.coin()}
                >
                  💼 CAREERS
                </a>
                <a
                  className="pixel-btn !border-panel-2 !px-2 !py-1.5 !text-[8px]"
                  href={c.website}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={() => sfx.blip()}
                >
                  🌐 WEBSITE
                </a>
                {c.email && (
                  <a className="pixel-btn !border-panel-2 !px-2 !py-1.5 !text-[8px]" href={`mailto:${c.email}`}>
                    📧 EMAIL
                  </a>
                )}
              </div>
            </motion.li>
          ))}
        </ul>
      )}

      <p className="font-body text-[11px] text-ink-dim">
        Unofficial directory for job hunters — not affiliated with any listed
        company. Missing a great guild? 🐞 Report it like a bug via Ask Me.
      </p>
    </div>
  )
}
