import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { JOB_CATEGORIES, difficultyStars, CURATED_LINKS } from '../../../lib/jobs'
import { grantAchievement } from '../../game/rewards'
import { sfx } from '../../game/sfx'

const TABS = [
  { id: 'qa', label: '🐞 QA / SQA' },
  { id: 'software', label: '💻 Software' },
  { id: 'ai', label: '🤖 AI / ML' },
]

const cache = new Map() // category -> jobs[] for this visit

function Stars({ n }) {
  return (
    <span className="font-pixel text-[9px] text-pix-yellow" aria-label={`difficulty ${n} of 3`}>
      {'★'.repeat(n)}
      <span className="text-panel-2">{'★'.repeat(3 - n)}</span>
    </span>
  )
}

function timeAgo(iso) {
  if (!iso) return ''
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (Number.isNaN(days) || days < 0) return ''
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  return `${days}d ago`
}

function CourierResting() {
  return (
    <div className="pixel-panel space-y-3 !border-pix-orange text-center">
      <p aria-hidden="true" className="text-4xl">🛌</p>
      <p className="font-pixel text-[10px] text-pix-orange">
        THE QUEST BOARD COURIER IS RESTING…
      </p>
      <p className="font-body text-sm text-ink-dim">
        Live quests could not be fetched right now. Meanwhile, these guild halls
        always have postings:
      </p>
      <ul className="space-y-2">
        {CURATED_LINKS.map((l) => (
          <li key={l.url}>
            <a className="pixel-btn block !text-[9px]" href={l.url} target="_blank" rel="noreferrer">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Live QA/Software/AI job openings in Bangladesh, as pinned quest scrolls. */
export default function JobQuestBoard() {
  const [category, setCategory] = useState('qa')
  const [query, setQuery] = useState('')
  const [state, setState] = useState({ status: 'loading', jobs: [] })

  useEffect(() => {
    let alive = true
    async function load() {
      if (cache.has(category)) {
        setState({ status: 'ok', jobs: cache.get(category) })
        return
      }
      setState({ status: 'loading', jobs: [] })
      try {
        const res = await fetch(`/api/jobs?category=${encodeURIComponent(category)}`)
        if (!res.ok) throw new Error(`jobs api ${res.status}`)
        const data = await res.json()
        const jobs = Array.isArray(data.jobs) ? data.jobs : []
        if (!alive) return
        if (jobs.length === 0) {
          setState({ status: 'fallback', jobs: [] })
        } else {
          cache.set(category, jobs)
          setState({ status: 'ok', jobs })
        }
      } catch {
        if (alive) setState({ status: 'fallback', jobs: [] })
      }
    }
    if (JOB_CATEGORIES.includes(category)) load()
    return () => {
      alive = false
    }
  }, [category])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return state.jobs
    return state.jobs.filter(
      (j) => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q)
    )
  }, [state.jobs, query])

  return (
    <div className="space-y-4">
      <p className="font-body text-sm text-ink-dim">
        Live openings in Bangladesh, refreshed every ~6 hours from public job
        aggregators. Freshness may vary — always check the original posting.
      </p>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Job categories">
        {TABS.map((t) => (
          <motion.button
            key={t.id}
            role="tab"
            aria-selected={category === t.id}
            className={`pixel-btn !px-3 !py-2 !text-[9px] ${category === t.id ? '!border-pix-yellow' : '!border-panel-2'}`}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              sfx.blip()
              setCategory(t.id)
            }}
          >
            {t.label}
          </motion.button>
        ))}
        <label className="sr-only" htmlFor="job-search">Filter quests</label>
        <input
          id="job-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter quests…"
          className="min-w-0 flex-1 border-4 border-panel-2 bg-night p-2 font-body text-sm text-ink placeholder:text-ink-dim focus:border-neon focus:outline-none"
        />
      </div>

      {state.status === 'loading' && (
        <div className="grid gap-3" aria-label="Loading quests">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="pixel-panel h-24 animate-pulse !bg-panel-2/50" aria-hidden="true" />
          ))}
        </div>
      )}

      {state.status === 'fallback' && <CourierResting />}

      {state.status === 'ok' && (
        visible.length === 0 ? (
          <p className="pixel-panel text-center font-body text-sm text-ink-dim">
            No quests match “{query}”. The board updates every few hours.
          </p>
        ) : (
          <ul className="grid gap-3">
            {visible.map((j, i) => (
              <motion.li
                key={j.id}
                className="pixel-panel !border-[#8a6a3b]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.4) }}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="break-words font-body text-sm font-semibold text-ink">📜 {j.title}</h3>
                    <p className="mt-1 font-body text-xs text-ink-dim">
                      {j.company} · {j.location}
                      {j.employmentType && ` · ${j.employmentType.toLowerCase()}`}
                      {timeAgo(j.postedDate) && ` · ${timeAgo(j.postedDate)}`}
                    </p>
                  </div>
                  <Stars n={difficultyStars(j.title)} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="font-pixel text-[8px] text-ink-dim">via {j.source}</span>
                  <a
                    className="pixel-btn !px-3 !py-2 !text-[9px]"
                    href={j.applyUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    onClick={() => {
                      sfx.coin()
                      grantAchievement('quest-accepted')
                    }}
                  >
                    ACCEPT QUEST →
                  </a>
                </div>
              </motion.li>
            ))}
          </ul>
        )
      )}

      <p className="font-body text-[11px] text-ink-dim">
        Quests fetched from public job aggregators (Google for Jobs via JSearch).
        Listings belong to their original publishers.
      </p>
    </div>
  )
}
