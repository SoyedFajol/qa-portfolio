import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PROFILE } from '../../data/profile'
import { sfx } from '../../game/sfx'

const LEVEL_LABELS = { 3: 'STRONG', 2: 'WORKING', 1: 'LEARNING' }
const LEVEL_COLORS = { 3: 'var(--neon)', 2: 'var(--pix-yellow)', 1: 'var(--pix-orange)' }

// RPG "item inspect" flavor for each piece of equipment (UI copy, not facts).
const FLAVOR = {
  'Manual Testing': { emoji: '🗡️', flavor: 'Trusty main-hand blade. Test cases, exploratory charters, bug reports — swung daily at BRAC IT against enterprise microservices.' },
  'API Testing': { emoji: '🏹', flavor: 'Precision longbow. Postman quivers, Swagger scopes, status-code arrows: 200s confirmed, 400s provoked on purpose, 500s reported with stack-trace evidence.' },
  'Automation Testing': { emoji: '🛡️', flavor: 'Enchanted shield, still being forged. Contributes automation at work while grinding the Playwright/Selenium skill tree.' },
  'Database Testing': { emoji: '🗄️', flavor: 'Truth-seeking lantern. SELECTs behind every UI claim: duplicates, orphans, silent truncation — the database never lies to a tester who asks.' },
  'Security Testing': { emoji: '🗝️', flavor: 'Mysterious key found in a dungeon. Just started turning it: input validation, auth edge cases, OWASP scrolls on the reading list.' },
  Playwright: { emoji: '🎭', flavor: 'Modern spellbook. Auto-waiting incantations, web-first assertions, trace-viewer scrying — the current main quest.' },
  Selenium: { emoji: '⚗️', flavor: 'Classic alchemy set. WebDriverWaits, page objects, and the patience of a thousand explicit waits.' },
  Java: { emoji: '☕', flavor: 'Legendary brew, +3 to backend comprehension. Spring Boot microservices shipped at CMED Health; reads production stack traces without flinching.' },
  Python: { emoji: '🐍', flavor: 'Faithful familiar. Scripts, Playwright bindings, ML notebooks — summoned whenever a task needs quick automation.' },
  'C++ (competitive programming)': { emoji: '⚡', flavor: 'Tournament rapier. 200+ Codeforces duels won, ICPC Dhaka regional survived. Grants passive skill: edge-case sense.' },
  JavaScript: { emoji: '🟨', flavor: 'City-building toolkit. The world you are standing in right now runs on it — React, Three.js, and a lot of glowing boxes.' },
  TypeScript: { emoji: '🟦', flavor: 'JavaScript with armor equipped. NestJS and Next.js side quests (HouseRentBD) cleared with types on.' },
  'n8n (workflow automation)': { emoji: '🔗', flavor: 'Automation loom. Wires APIs and workflows together so machines do the boring quests.' },
}

const CHIP_COLORS = ['var(--neon)', 'var(--pix-purple)', 'var(--pix-yellow)', 'var(--pix-orange)']

function SkillCard({ name, level, index }) {
  const [open, setOpen] = useState(false)
  const meta = FLAVOR[name] ?? { emoji: '✨', flavor: '' }
  const color = LEVEL_COLORS[level]
  return (
    <motion.li
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <motion.button
        className="w-full border-2 bg-night/60 p-3 text-left"
        style={{ borderColor: color }}
        whileHover={{ scale: 1.02, boxShadow: `0 0 14px 0 ${color === 'var(--neon)' ? 'rgba(57,255,136,0.45)' : color === 'var(--pix-yellow)' ? 'rgba(255,217,61,0.45)' : 'rgba(255,138,61,0.45)'}` }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          sfx.blip()
          setOpen(!open)
        }}
        aria-expanded={open}
      >
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-body text-sm">
            <span aria-hidden="true">{meta.emoji} </span>
            {name}
          </span>
          <span className="font-pixel text-[8px]" style={{ color }}>
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
          <motion.div
            className="skill-fill skill-shimmer"
            style={{ background: color }}
            initial={{ width: 0 }}
            animate={{ width: `${(level / 3) * 100}%` }}
            transition={{ duration: 0.7, delay: 0.15 + index * 0.05, ease: 'easeOut' }}
          />
        </div>
        <AnimatePresence>
          {open && meta.flavor && (
            <motion.p
              className="mt-2 border-t border-panel-2 pt-2 font-body text-xs italic text-ink-dim"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {meta.flavor}
            </motion.p>
          )}
        </AnimatePresence>
        {!open && <p className="mt-1.5 text-right font-pixel text-[7px] text-ink-dim">tap to inspect ▸</p>}
      </motion.button>
    </motion.li>
  )
}

function ChipRow({ title, icon, items }) {
  return (
    <div>
      <h3 className="mb-2 text-[10px] text-pix-purple">{icon} {title}</h3>
      <ul className="flex flex-wrap gap-2">
        {items.map((t, i) => (
          <motion.li
            key={t}
            className="cursor-default border-2 bg-night/60 px-2 py-1 font-body text-xs"
            style={{ borderColor: CHIP_COLORS[i % CHIP_COLORS.length] }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.04 }}
            whileHover={{ scale: 1.12, rotate: i % 2 ? 2 : -2 }}
          >
            {t}
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

/** RPG equipment screen: animated honest bars, inspectable items, loot chips. */
export default function SkillsSection() {
  const s = PROFILE.skills
  return (
    <div className="space-y-6 text-sm">
      <p className="font-body text-ink-dim">
        Honest bars — no maxed-out everything. <span className="text-neon">STRONG</span> is
        daily craft, <span className="text-pix-yellow">WORKING</span> is real projects,{' '}
        <span className="text-pix-orange">LEARNING</span> is an active quest. Tap any item to inspect it.
      </p>

      {[
        ['⚔️ TESTING ARSENAL', s.testing],
        ['🛡️ AUTOMATION FRAMEWORKS', s.frameworks],
        ['🧪 PROGRAMMING SPELLS', s.programming],
      ].map(([title, list]) => (
        <section key={title} aria-label={title}>
          <h3 className="mb-2 text-[10px] text-neon">{title}</h3>
          <ul className="grid gap-2 sm:grid-cols-2">
            {list.map((sk, i) => (
              <SkillCard key={sk.name} {...sk} index={i} />
            ))}
          </ul>
        </section>
      ))}

      <section className="space-y-4" aria-label="Stacks, databases, tools and APIs">
        <ChipRow title="FRONTEND GEAR" icon="🎨" items={s.frontend} />
        <ChipRow title="BACKEND FORGE" icon="⚙️" items={s.backend} />
        <ChipRow title="SIDE SPELLBOOK" icon="📖" items={s.alsoCode} />
        <ChipRow title="DATABASE RUNES" icon="🗄️" items={s.databases} />
        <ChipRow title="TOOL BELT" icon="🧰" items={s.tools} />
        <ChipRow title="AI COMPANIONS" icon="🤖" items={s.aiStack} />
        <ChipRow title="API ARTIFACTS" icon="🔌" items={s.apis} />
        <ChipRow title="SPOKEN TONGUES" icon="🗣️" items={s.languages} />
      </section>

      <motion.section
        className="pixel-panel secret-glow !border-pix-yellow"
        aria-label="Secret class: developer"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-[10px] text-pix-yellow">✨ SECRET CLASS UNLOCKED: DEVELOPER</h3>
        <p className="mt-2 font-body text-xs text-ink-dim">
          Former Java intern — reads stack traces, writes Spring Boot, and speaks
          fluent developer. A QA who can code is a boss-level teammate.
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {s.secretClass.map((t) => (
            <motion.li
              key={t}
              className="border-2 border-pix-yellow bg-night/60 px-2 py-1 font-body text-xs text-pix-yellow"
              whileHover={{ scale: 1.12 }}
            >
              {t}
            </motion.li>
          ))}
        </ul>
      </motion.section>
    </div>
  )
}
