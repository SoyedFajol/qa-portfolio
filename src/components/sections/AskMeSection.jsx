import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { PROFILE, WEB3FORMS_ACCESS_KEY, CALENDLY_URL } from '../../data/profile'
import { grantAchievement } from '../../game/rewards'
import { sfx } from '../../game/sfx'

const SESSION_TYPES = ['🐞 QA Career Chat', '⚔️ Interview Prep Duel', '🛠 Project Collab']

// ── "Send a Raven" — Web3Forms contact form ──────────────────────────
function RavenForm() {
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [errors, setErrors] = useState({})

  if (!WEB3FORMS_ACCESS_KEY) {
    return (
      <div className="space-y-3 text-center">
        <p aria-hidden="true" className="text-3xl">🕊️</p>
        <p className="font-body text-sm text-ink-dim">
          The raven post is being set up. Meanwhile, classic mail works:
        </p>
        <a className="pixel-btn !text-[10px]" href={`mailto:${PROFILE.email}`}>
          📧 {PROFILE.email}
        </a>
      </div>
    )
  }

  async function onSubmit(e) {
    e.preventDefault()
    const form = e.target
    const name = form.name.value.trim()
    const email = form.email.value.trim()
    const message = form.message.value.trim()

    const errs = {}
    if (name.length < 2) errs.name = 'Every adventurer has a name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'The raven needs a valid return address.'
    if (message.length < 10) errs.message = 'Give the raven at least a sentence to carry.'
    setErrors(errs)
    if (Object.keys(errs).length > 0 || form.botcheck.checked) return

    setStatus('sending')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `🐦 Raven from ${name} — qa-portfolio`,
          name, email, message,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error('web3forms rejected')
      setStatus('sent')
      sfx.achievement()
      grantAchievement('raven-sent')
    } catch {
      setStatus('error')
      sfx.error()
    }
  }

  if (status === 'sent') {
    return (
      <div className="space-y-3 text-center" aria-live="polite">
        <motion.p
          aria-hidden="true"
          className="text-4xl"
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{ x: 160, y: -120, opacity: 0 }}
          transition={{ duration: 1.6, ease: 'easeIn' }}
        >
          🕊️
        </motion.p>
        <p className="font-pixel text-[10px] text-neon">MESSAGE DELIVERED TO SOYED&apos;S INBOX!</p>
        <p className="font-body text-xs text-ink-dim">He usually replies within a day or two.</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" noValidate>
      {/* honeypot — humans never see it, bots can't resist it */}
      <input type="checkbox" name="botcheck" tabIndex={-1} className="hidden" aria-hidden="true" />

      {[
        { id: 'name', label: 'Your name', type: 'text', ph: 'Ada the Recruiter' },
        { id: 'email', label: 'Your email', type: 'email', ph: 'you@guild.com' },
      ].map((f) => (
        <div key={f.id}>
          <label htmlFor={`raven-${f.id}`} className="mb-1 block font-pixel text-[9px] text-ink-dim">
            {f.label}
          </label>
          <input
            id={`raven-${f.id}`}
            name={f.id}
            type={f.type}
            placeholder={f.ph}
            className="w-full border-4 border-panel-2 bg-night p-2 font-body text-sm text-ink placeholder:text-ink-dim focus:border-neon focus:outline-none"
            aria-invalid={!!errors[f.id]}
          />
          {errors[f.id] && <p className="mt-1 font-body text-xs text-danger">{errors[f.id]}</p>}
        </div>
      ))}
      <div>
        <label htmlFor="raven-message" className="mb-1 block font-pixel text-[9px] text-ink-dim">
          Your message / question
        </label>
        <textarea
          id="raven-message"
          name="message"
          rows={4}
          placeholder="Interview prep? QA career question? Collab idea? Fire away…"
          className="w-full border-4 border-panel-2 bg-night p-2 font-body text-sm text-ink placeholder:text-ink-dim focus:border-neon focus:outline-none"
          aria-invalid={!!errors.message}
        />
        {errors.message && <p className="mt-1 font-body text-xs text-danger">{errors.message}</p>}
      </div>
      {status === 'error' && (
        <p className="font-body text-xs text-danger" aria-live="polite">
          The raven hit a storm. Try again, or email {PROFILE.email} directly.
        </p>
      )}
      <button className="pixel-btn !text-[10px]" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? '🕊️ RAVEN TAKING OFF…' : '🕊️ SEND THE RAVEN'}
      </button>
    </form>
  )
}

// ── "Party Up" — lazy-loaded Calendly embed ──────────────────────────
function PartyUp() {
  const [loadEmbed, setLoadEmbed] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!loadEmbed || !CALENDLY_URL) return
    const s = document.createElement('script')
    s.src = 'https://assets.calendly.com/assets/external/widget.js'
    s.async = true
    document.body.appendChild(s)
    return () => {
      document.body.removeChild(s)
    }
  }, [loadEmbed])

  return (
    <div className="space-y-3">
      <ul className="flex flex-wrap gap-2">
        {SESSION_TYPES.map((t) => (
          <li key={t} className="border-2 border-pix-purple bg-night/50 px-2 py-1 font-body text-xs">
            {t}
          </li>
        ))}
      </ul>

      {!CALENDLY_URL ? (
        <div className="pixel-panel !border-pix-orange text-center">
          <p aria-hidden="true" className="text-3xl">📅</p>
          <p className="mt-2 font-pixel text-[9px] text-pix-orange">
            SESSION SCROLLS COMING SOON
          </p>
          <p className="mt-2 font-body text-xs text-ink-dim">
            The booking calendar isn&apos;t live yet — send a raven instead and
            Soyed will propose a time by email.
          </p>
        </div>
      ) : !loadEmbed ? (
        <button
          className="pixel-btn w-full !text-[10px]"
          onClick={() => {
            sfx.blip()
            setLoadEmbed(true)
          }}
        >
          📅 OPEN THE BOOKING CALENDAR (loads Calendly)
        </button>
      ) : (
        <div
          ref={containerRef}
          className="calendly-inline-widget border-4 border-panel-2"
          data-url={CALENDLY_URL}
          style={{ minWidth: '280px', height: '600px' }}
          title="Book a session with Soyed"
        />
      )}
      <p className="font-body text-[11px] text-ink-dim">
        20–30 minutes, free, genuinely happy to help fellow juniors.
      </p>
    </div>
  )
}

/** Ask Me / Party Up: raven mail + session booking, RPG-styled. */
export default function AskMeSection() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <section className="pixel-panel !border-pix-purple" aria-label="Send a raven — ask me anything">
          <h3 className="mb-3 text-[10px] text-pix-purple">🕊️ SEND A RAVEN</h3>
          <RavenForm />
        </section>
        <section className="pixel-panel !border-pix-yellow" aria-label="Party up — book a session">
          <h3 className="mb-3 text-[10px] text-pix-yellow">🤝 PARTY UP — BOOK A SESSION</h3>
          <PartyUp />
        </section>
      </div>
    </div>
  )
}
