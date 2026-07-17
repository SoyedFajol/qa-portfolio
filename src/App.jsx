// App shell: routes the static pages, gates the game behind PRESS START,
// renders the 3D world (or the flat fallback), and mounts every overlay.

import { lazy, Suspense, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Analytics } from '@vercel/analytics/react'

import { SECTIONS, sectionById } from './data/sections'
import { look } from './scene/lookState'
import { sfx } from './game/sfx'
import { useGameStore } from './store/useGameStore'
import { useUiStore } from './store/useUiStore'
import { visitSection } from './game/rewards'
import { trackEvent } from './game/analytics'
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion'

import IntroScreen from './components/IntroScreen'
import LoadingScreen from './components/LoadingScreen'
import FlatWorld from './components/FlatWorld'
import Hud from './components/Hud'
import NavMenu from './components/NavMenu'
import WorldMap from './components/WorldMap'
import Toasts from './components/Toasts'
import LevelUpBurst from './components/LevelUpBurst'
import SectionOverlay from './components/SectionOverlay'
import ResumePage from './components/ResumePage'
import { PrivacyPage, TermsPage, GameOverPage } from './components/StaticPages'

import JourneySection from './components/sections/JourneySection'
import SkillsSection from './components/sections/SkillsSection'
import ProjectsSection from './components/sections/ProjectsSection'
import QuestionDungeon from './components/sections/QuestionDungeon'
import RoadmapSection from './components/sections/RoadmapSection'
import LearningGame from './components/sections/LearningGame'
import JobQuestBoard from './components/sections/JobQuestBoard'
import CompanyDirectory from './components/sections/CompanyDirectory'
import AskMeSection from './components/sections/AskMeSection'
import SideQuestsSection from './components/sections/SideQuestsSection'
import ContactSection from './components/sections/ContactSection'

const World = lazy(() => import('./scene/World'))

const SECTION_COMPONENTS = {
  journey: JourneySection,
  skills: SkillsSection,
  projects: ProjectsSection,
  dungeon: QuestionDungeon,
  roadmap: RoadmapSection,
  game: LearningGame,
  jobs: JobQuestBoard,
  companies: CompanyDirectory,
  ask: AskMeSection,
  sidequests: SideQuestsSection,
  contact: ContactSection,
}
const WIDE_SECTIONS = new Set(['dungeon', 'game', 'jobs', 'companies', 'ask', 'projects'])

const SCROLL_PAGES = 7 // how many viewport-heights the journey spans

function webglAvailable() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    return false
  }
}

function GameWorld() {
  const progressRef = useRef(0)
  const { flatMode, openSection } = useUiStore()
  const visited = useGameStore((s) => s.progress.sectionsVisited)

  useEffect(() => {
    if (flatMode) return
    function onScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight
      progressRef.current = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [flatMode])

  // Ctrl/Cmd + scroll = camera zoom (plain scroll keeps walking the hero)
  useEffect(() => {
    if (flatMode) return
    function onWheel(e) {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      useUiStore.getState().zoomBy(e.deltaY > 0 ? 0.12 : -0.12)
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [flatMode])

  // Touch gestures: two-finger pinch zooms; a HORIZONTAL one-finger drag
  // looks left/right around the hero (vertical drags still scroll/walk).
  useEffect(() => {
    if (flatMode) return
    let lastDist = 0
    let start = null
    let mode = null // null | 'look'
    let yaw0 = 0
    let pitch0 = 0

    function onTouchStart(e) {
      if (e.touches.length === 1) {
        start = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        mode = null
        yaw0 = look.yaw
        pitch0 = look.pitch
      }
    }
    function onTouchMove(e) {
      if (e.touches.length === 2) {
        e.preventDefault()
        const d = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
        if (lastDist) useUiStore.getState().zoomBy((lastDist - d) * 0.006)
        lastDist = d
        return
      }
      if (e.touches.length !== 1 || !start) return
      const dx = e.touches[0].clientX - start.x
      const dy = e.touches[0].clientY - start.y
      // decide the gesture once: sideways = look, upright = scroll
      if (mode === null && (Math.abs(dx) > 12 || Math.abs(dy) > 12)) {
        mode = Math.abs(dx) > Math.abs(dy) ? 'look' : 'scroll'
      }
      if (mode === 'look') {
        e.preventDefault()
        look.active = true
        look.yaw = Math.max(-2.8, Math.min(2.8, yaw0 + dx * 0.008))
        look.pitch = Math.max(-0.5, Math.min(0.5, pitch0 + dy * 0.003))
      }
    }
    function onTouchEnd(e) {
      if (e.touches.length < 2) lastDist = 0
      if (e.touches.length === 0) {
        start = null
        mode = null
        look.active = false // rig eases the view back behind the hero
      }
    }
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [flatMode])

  // Mouse: click-hold and drag to look around (release to snap back)
  useEffect(() => {
    if (flatMode) return
    let start = null
    let yaw0 = 0
    let pitch0 = 0
    function onDown(e) {
      if (e.button !== 0) return
      // ignore drags starting on UI (buttons, overlays, links)
      if (e.target.closest('button, a, input, textarea, [role="dialog"]')) return
      start = { x: e.clientX, y: e.clientY }
      yaw0 = look.yaw
      pitch0 = look.pitch
    }
    function onMove(e) {
      if (!start) return
      const dx = e.clientX - start.x
      const dy = e.clientY - start.y
      if (!look.active && Math.abs(dx) < 5 && Math.abs(dy) < 5) return // still a click
      look.active = true
      look.yaw = Math.max(-2.8, Math.min(2.8, yaw0 + dx * 0.006))
      look.pitch = Math.max(-0.5, Math.min(0.5, pitch0 + dy * 0.0025))
    }
    function onUp() {
      start = null
      look.active = false
    }
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [flatMode])

  if (flatMode) return <FlatWorld />

  return (
    <>
      <Suspense fallback={<LoadingScreen />}>
        <World
          progressRef={progressRef}
          visitedIds={visited}
          onOpenSection={openSection}
        />
      </Suspense>

      {/* The track the player scrolls along. pointer-events-none is what lets
          clicks reach the 3D canvas underneath — only the footer opts back in. */}
      <div className="pointer-events-none relative" style={{ height: `${SCROLL_PAGES * 100}vh` }}>
        <footer className="pointer-events-auto absolute inset-x-0 bottom-12 z-10 px-4 text-center font-body text-xs text-ink-dim">
          <p className="font-pixel text-[9px] text-neon">— END OF PATH · THANKS FOR PLAYING —</p>
          <p className="mt-3">
            <a className="underline hover:text-ink" href="/resume">Resume</a>
            {' · '}
            <a className="underline hover:text-ink" href="https://github.com/SoyedFajol/qa-portfolio" target="_blank" rel="noreferrer">
              Source ⭐
            </a>
            {' · '}
            <a className="underline hover:text-ink" href="/privacy">Privacy</a>
            {' · '}
            <a className="underline hover:text-ink" href="/terms">Terms</a>
            {' · '}
            <a className="underline hover:text-ink" href="mailto:soyedmdsolemanfajul@gmail.com?subject=🐞 Bug report — qa-portfolio">
              🐞 Report a bug
            </a>
          </p>
          <p className="mt-2 font-pixel text-[8px] text-ink-dim">
            built & QA-tested by Soyed Solaman · React + Three.js · 55 unit tests, CI, and one cliff
          </p>
        </footer>
      </div>

      <ScrollHint progressRef={progressRef} />
      <TouchControls />
      <JourneyMap />
    </>
  )
}

/** Touch controls for phone players (most visitors): zoom the city in/out
 * and a thumb-sized JUMP — stacked in the right-thumb zone. */
function TouchControls() {
  const isTouch =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0)
  if (!isTouch) return null
  return (
    <div className="fixed bottom-24 right-3 z-20 flex flex-col items-end gap-2">
      <button
        className="flex h-11 w-11 items-center justify-center border-4 border-neon bg-panel/90 font-pixel text-[11px] text-neon shadow-[3px_3px_0_0_rgba(0,0,0,0.45)] active:translate-y-0.5"
        onClick={() => {
          sfx.blip()
          useUiStore.getState().zoomBy(-0.3)
        }}
        aria-label="Zoom in"
      >
        🔍+
      </button>
      <button
        className="flex h-11 w-11 items-center justify-center border-4 border-neon bg-panel/90 font-pixel text-[11px] text-neon shadow-[3px_3px_0_0_rgba(0,0,0,0.45)] active:translate-y-0.5"
        onClick={() => {
          sfx.blip()
          useUiStore.getState().zoomBy(0.3)
        }}
        aria-label="Zoom out — see the whole city"
      >
        🔍−
      </button>
      <button
        className="flex h-16 w-16 items-center justify-center border-4 border-pix-yellow bg-panel/90 font-pixel text-[10px] leading-tight text-pix-yellow shadow-[4px_4px_0_0_rgba(0,0,0,0.45)] active:translate-y-1"
        onTouchStart={(e) => {
          e.preventDefault()
          window.dispatchEvent(new Event('hero-jump'))
        }}
        onClick={() => window.dispatchEvent(new Event('hero-jump'))}
        aria-label="Jump"
      >
        ⤒ JUMP
      </button>
    </div>
  )
}

/** "SCROLL TO WALK" nudge, hidden once the player starts moving. */
function ScrollHint({ progressRef }) {
  const hintRef = useRef(null)
  useEffect(() => {
    const id = setInterval(() => {
      if (hintRef.current) {
        hintRef.current.style.opacity = progressRef.current < 0.01 ? '1' : '0'
      }
    }, 300)
    return () => clearInterval(id)
  }, [progressRef])
  return (
    <p
      ref={hintRef}
      className="pointer-events-none fixed bottom-10 left-1/2 z-10 -translate-x-1/2 animate-bounce font-pixel text-[10px] text-pix-yellow transition-opacity duration-500"
    >
      SCROLL TO WALK ▼
    </p>
  )
}

/** Mini-map of the journey: progress fill + one clickable dot per level.
 * Clicking a dot walks (smooth-scrolls) the hero to that checkpoint. */
function JourneyMap() {
  const fillRef = useRef(null)
  const visited = useGameStore((s) => s.progress.sectionsVisited)

  useEffect(() => {
    function onScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      if (fillRef.current) fillRef.current.style.width = `${p * 100}%`
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function travelTo(at) {
    sfx.blip()
    const max = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo({ top: at * max, behavior: 'smooth' })
  }

  return (
    <motion.nav
      aria-label="Journey map — jump to a level"
      className="fixed inset-x-0 bottom-0 z-20 px-3 pb-2"
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.2 }}
    >
      <div className="relative mx-auto h-6 max-w-3xl">
        {/* track + fill */}
        <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 border-2 border-panel-2 bg-night/80">
          <div ref={fillRef} className="h-full bg-neon/60" style={{ width: 0, background: 'rgba(57,255,136,0.5)' }} />
        </div>
        {/* checkpoint dots */}
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            title={`${s.icon} ${s.label}`}
            aria-label={`Walk to ${s.label}`}
            onClick={() => travelTo(s.at)}
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 border-2 transition-transform hover:scale-150 sm:h-3.5 sm:w-3.5"
            style={{
              left: `${s.at * 100}%`,
              background: visited.includes(s.id) ? 'var(--neon)' : 'var(--night)',
              borderColor: visited.includes(s.id)
                ? 'var(--neon)'
                : s.round === 1
                  ? 'var(--pix-yellow)'
                  : 'var(--pix-purple)',
            }}
          />
        ))}
      </div>
    </motion.nav>
  )
}

function Game() {
  const { started, activeSection, closeSection, navOpen } = useUiStore()
  const reducedMotion = usePrefersReducedMotion()
  const setFlatMode = useUiStore((s) => s.setFlatMode)
  const setMapOpen = useUiStore((s) => s.setMapOpen)

  // The world greets you with the map — but only ONCE per tab session, so
  // hopping to /resume and back doesn't re-pop it.
  useEffect(() => {
    if (!started) return
    try {
      if (window.sessionStorage.getItem('qa-map-seen') === '1') return
      window.sessionStorage.setItem('qa-map-seen', '1')
    } catch {
      /* private mode: fall through, still show it */
    }
    const t = setTimeout(() => setMapOpen(true), 700)
    return () => clearTimeout(t)
  }, [started, setMapOpen])

  // Pick the right render mode before the game starts (gates H3, H4).
  useEffect(() => {
    if (!webglAvailable()) setFlatMode(true, 'webgl')
    else if (reducedMotion) setFlatMode(true, 'motion')
  }, [reducedMotion, setFlatMode])

  // Reward + analytics whenever a section opens; lock body scroll under overlays.
  useEffect(() => {
    if (activeSection) {
      visitSection(activeSection)
      trackEvent('section_opened', { id: activeSection })
    }
  }, [activeSection])

  useEffect(() => {
    document.body.style.overflow = activeSection || navOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [activeSection, navOpen])

  const meta = activeSection ? sectionById(activeSection) : null
  const Body = activeSection ? SECTION_COMPONENTS[activeSection] : null

  return (
    <>
      <AnimatePresence>{!started && <IntroScreen key="intro" />}</AnimatePresence>

      {started && (
        <>
          <GameWorld />
          <Hud />
          <NavMenu />
          <WorldMap />
        </>
      )}

      <SectionOverlay
        open={!!(meta && Body)}
        icon={meta?.icon}
        title={meta?.label ?? ''}
        onClose={closeSection}
        wide={meta ? WIDE_SECTIONS.has(meta.id) : false}
      >
        {Body && <Body />}
      </SectionOverlay>

      <Toasts />
      <LevelUpBurst />
    </>
  )
}

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  let page
  if (path === '/') page = <Game />
  else if (path === '/resume') page = <ResumePage />
  else if (path === '/privacy') page = <PrivacyPage />
  else if (path === '/terms') page = <TermsPage />
  else page = <GameOverPage />

  return (
    <>
      {page}
      <Analytics />
    </>
  )
}
