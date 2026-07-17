import { PROFILE, RESUME_URL } from '../../data/profile'
import { useUiStore } from '../../store/useUiStore'
import { sfx } from '../../game/sfx'

/** "Join my party!" — email, GitHub, LinkedIn, resume. No phone, ever. */
export default function ContactSection() {
  const openSection = useUiStore((s) => s.openSection)
  return (
    <div className="space-y-4 text-center">
      <p aria-hidden="true" className="text-5xl">🎉</p>
      <h3 className="text-xs text-pix-yellow">YOUR PARTY NEEDS A QA ENGINEER?</h3>
      <p className="mx-auto max-w-md font-body text-sm text-ink-dim">
        Open to QA/SQA opportunities, collaborations, and helping fellow juniors.
        Pick a communication spell:
      </p>

      <div className="mx-auto grid max-w-md gap-3">
        <a className="pixel-btn !text-[10px]" href={`mailto:${PROFILE.email}`} onClick={() => sfx.blip()}>
          📧 {PROFILE.email}
        </a>
        <a className="pixel-btn !border-pix-purple !text-[10px]" href={PROFILE.github} target="_blank" rel="noreferrer" onClick={() => sfx.blip()}>
          🐙 GitHub — SoyedFajol
        </a>
        <a className="pixel-btn !border-pix-purple !text-[10px]" href={PROFILE.linkedin} target="_blank" rel="noreferrer" onClick={() => sfx.blip()}>
          💼 LinkedIn
        </a>
        {RESUME_URL ? (
          <a className="pixel-btn pixel-btn--warn !text-[10px]" href={RESUME_URL} onClick={() => sfx.blip()}>
            📄 View Resume (print-ready)
          </a>
        ) : (
          <button className="pixel-btn pixel-btn--warn !text-[10px]" onClick={() => { sfx.blip(); openSection('ask') }}>
            📄 Resume — send a raven to request it
          </button>
        )}
      </div>

      <p className="font-body text-xs text-ink-dim">
        Based in {PROFILE.location} · Want a live chat? Try{' '}
        <button className="underline" onClick={() => { sfx.blip(); openSection('ask') }}>
          Party Up
        </button>{' '}
        to book a session.
      </p>
    </div>
  )
}
