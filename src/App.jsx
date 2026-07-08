// App shell: routes the static pages, gates the game behind PRESS START,
// renders the 3D world (or the flat fallback), and mounts every overlay.

import { lazy, Suspense, useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Analytics } from '@vercel/analytics/react'

import { sectionById } from './data/sections'
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
import Toasts from './components/Toasts'
import LevelUpBurst from './components/LevelUpBurst'
import SectionOverlay from './components/SectionOverlay'
import { PrivacyPage, TermsPage, GameOverPage } from './components/StaticPages'

import JourneySection from './components/sections/JourneySection'
import SkillsSection from './components/sections/SkillsSection'
import ProjectsSection from './components/sections/ProjectsSection'
import QuestionDungeon from './components/sections/QuestionDungeon'
import RoadmapSection from './components/sections/RoadmapSection'
import LearningGame from './components/sections/LearningGame'
import JobQuestBoard from './components/sections/JobQuestBoard'
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
  ask: AskMeSection,
  sidequests: SideQuestsSection,
  contact: ContactSection,
}
const WIDE_SECTIONS = new Set(['dungeon', 'game', 'jobs', 'ask', 'projects'])

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

      {/* the track the player scrolls along; footer waits at the very end */}
      <div className="relative" style={{ height: `${SCROLL_PAGES * 100}vh` }}>
        <footer className="absolute inset-x-0 bottom-6 z-10 px-4 text-center font-body text-xs text-ink-dim">
          <p className="font-pixel text-[9px] text-neon">— END OF PATH · THANKS FOR PLAYING —</p>
          <p className="mt-3">
            <a className="underline hover:text-ink" href="/privacy">Privacy</a>
            {' · '}
            <a className="underline hover:text-ink" href="/terms">Terms</a>
            {' · '}
            <a className="underline hover:text-ink" href="mailto:soyedmdsolemanfajul@gmail.com?subject=🐞 Bug report — qa-portfolio">
              🐞 Report a bug
            </a>
          </p>
        </footer>
      </div>

      <ScrollHint progressRef={progressRef} />
    </>
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
      className="pointer-events-none fixed bottom-6 left-1/2 z-10 -translate-x-1/2 animate-bounce font-pixel text-[10px] text-pix-yellow transition-opacity duration-500"
    >
      SCROLL TO WALK ▼
    </p>
  )
}

function Game() {
  const { started, activeSection, closeSection, navOpen } = useUiStore()
  const reducedMotion = usePrefersReducedMotion()
  const setFlatMode = useUiStore((s) => s.setFlatMode)

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
