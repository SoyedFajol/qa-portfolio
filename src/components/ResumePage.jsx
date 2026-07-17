import { useEffect } from 'react'
import { PROFILE } from '../data/profile'
import { trackEvent } from '../game/analytics'

/**
 * /resume — a clean, print-optimized resume built from the shared profile.
 * "PRINT / SAVE AS PDF" uses the browser's print dialog; print styles strip
 * the game chrome and switch to paper-friendly colors.
 *
 * Privacy rule (site-wide, non-negotiable): no phone number or street
 * address on the web — recruiters reach Soyed via email/LinkedIn, and the
 * full-detail PDF travels by email.
 */
export default function ResumePage() {
  // recruiters opening the resume is THE conversion signal
  useEffect(() => {
    trackEvent('resume_viewed')
  }, [])
  return (
    <main className="resume-page mx-auto max-w-3xl px-4 py-10">
      <div className="print-hide mb-6 flex flex-wrap items-center justify-between gap-3">
        <a className="pixel-btn !text-[10px]" href="/">← BACK TO THE GAME</a>
        <button className="pixel-btn !border-pix-yellow !text-[10px]" onClick={() => window.print()}>
          🖨️ PRINT / SAVE AS PDF
        </button>
      </div>

      <article className="resume-sheet space-y-5 border-4 border-panel-2 bg-panel p-6 font-body text-sm leading-relaxed sm:p-10">
        <header className="border-b-2 border-panel-2 pb-4 text-center">
          <h1 className="font-pixel text-base text-pix-yellow sm:text-lg">{PROFILE.name.toUpperCase()}</h1>
          <p className="mt-2 text-ink-dim">
            {PROFILE.location} ·{' '}
            <a className="text-neon underline" href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a> ·{' '}
            <a className="text-neon underline" href={PROFILE.github} target="_blank" rel="noreferrer">GitHub</a> ·{' '}
            <a className="text-neon underline" href={PROFILE.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          </p>
        </header>

        <section aria-label="Career summary">
          <h2 className="resume-h">CAREER SUMMARY</h2>
          <p className="text-ink-dim">{PROFILE.careerSummary}</p>
        </section>

        <section aria-label="Experience">
          <h2 className="resume-h">EXPERIENCE</h2>
          {PROFILE.experience.map((job) => (
            <div key={job.company} className="mb-4">
              <p className="font-semibold text-ink">{job.role}</p>
              <p className="text-xs text-ink-dim">{job.company} · {job.period}</p>
              <ul className="mt-1.5 list-inside list-disc space-y-1 text-ink-dim">
                {job.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section aria-label="Education">
          <h2 className="resume-h">EDUCATION</h2>
          <p className="font-semibold text-ink">{PROFILE.education.school}</p>
          <p className="text-ink-dim">{PROFILE.education.degree} · CGPA {PROFILE.education.cgpa} · Dhaka, Bangladesh</p>
        </section>

        <section aria-label="Problem solving">
          <h2 className="resume-h">PROBLEM SOLVING</h2>
          <ul className="list-inside list-disc space-y-1 text-ink-dim">
            {PROFILE.competitive.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>

        <section aria-label="Skills">
          <h2 className="resume-h">SKILLS</h2>
          <ul className="list-inside list-disc space-y-1 text-ink-dim">
            <li><strong className="text-ink">Programming:</strong> C++, JavaScript, TypeScript, Python, Java (also C, C#, PHP, Dart, Flutter)</li>
            <li><strong className="text-ink">Testing:</strong> Manual, API, Automation, Database Testing, Security Testing, UAT</li>
            <li><strong className="text-ink">Test Automation:</strong> Playwright, Selenium, n8n</li>
            <li><strong className="text-ink">Frontend:</strong> HTML, CSS, React, Next.js</li>
            <li><strong className="text-ink">Frameworks:</strong> NestJS, Django, Spring Boot</li>
            <li><strong className="text-ink">Database:</strong> MySQL, SQL, PostgreSQL</li>
            <li><strong className="text-ink">Software Tools:</strong> Postman, Swagger, Jira · <strong className="text-ink">Version Control:</strong> Git · <strong className="text-ink">AI:</strong> Claude Code</li>
            <li><strong className="text-ink">API Integration:</strong> RESTful API, Third-party API</li>
            <li><strong className="text-ink">Languages:</strong> Bangla (Fluent), English (Fluent)</li>
          </ul>
        </section>

        <section aria-label="Extracurricular">
          <h2 className="resume-h">EXTRACURRICULAR & SPORTS</h2>
          <ul className="list-inside list-disc space-y-1 text-ink-dim">
            {PROFILE.extras.map((e) => (
              <li key={e}>{e}</li>
            ))}
            <li>Semi-professional cricket and football player; U-14 national cricket team captain; marathon runner and multi-sport athlete</li>
          </ul>
        </section>

        <section aria-label="References">
          <h2 className="resume-h">REFERENCES</h2>
          <p className="text-ink-dim">Available on request — email {PROFILE.email}.</p>
        </section>
      </article>

      <p className="print-hide mt-4 text-center font-body text-xs text-ink-dim">
        Phone number is shared by email for privacy. 🐞 This page prints clean — try it.
      </p>
    </main>
  )
}
