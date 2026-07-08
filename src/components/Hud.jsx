import { useGameStore } from '../store/useGameStore'
import { useUiStore } from '../store/useUiStore'
import { rankForLevel, progressToNext } from '../game/progression'
import { sfx } from '../game/sfx'

/** Persistent game HUD: rank, XP bar, sound, render mode, level select. */
export default function Hud() {
  const { xp, level, mute, toggleMute } = useGameStore()
  const { flatMode, setFlatMode, flatModeReason, setNavOpen } = useUiStore()
  const rank = rankForLevel(level)
  const { pct, next } = progressToNext(xp)

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-start justify-between gap-2 p-2 sm:p-3">
      <div className="pixel-panel pointer-events-auto !p-2 sm:!p-3" aria-label="Player status">
        <p className="font-pixel text-[9px] text-pix-yellow sm:text-[10px]">
          Lv.{level} {rank.title}
        </p>
        <div
          className="xp-track mt-1.5 !h-3 w-32 sm:w-44"
          role="progressbar"
          aria-label="XP progress to next level"
          aria-valuenow={Math.round(pct * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="xp-fill" style={{ width: `${pct * 100}%` }} />
        </div>
        <p className="mt-1 font-pixel text-[8px] text-ink-dim">
          {next === null ? `${xp} XP · MAX` : `${xp} / ${next} XP`}
        </p>
      </div>

      <div className="pointer-events-auto flex gap-2">
        <button
          className="pixel-btn !px-3 !py-2 !text-[10px]"
          onClick={() => {
            sfx.blip()
            setNavOpen(true)
          }}
          aria-label="Open level select menu"
        >
          ☰ MENU
        </button>
        {flatModeReason !== 'webgl' && (
          <button
            className="pixel-btn pixel-btn--warn hidden !px-3 !py-2 !text-[10px] sm:inline-block"
            onClick={() => {
              sfx.blip()
              setFlatMode(!flatMode)
            }}
            aria-pressed={flatMode}
            aria-label={flatMode ? 'Switch to 3D world' : 'Switch to simple 2D mode'}
          >
            {flatMode ? '3D' : '2D'}
          </button>
        )}
        <button
          className="pixel-btn !px-3 !py-2 !text-[10px]"
          onClick={() => {
            toggleMute()
            sfx.blip()
          }}
          aria-pressed={mute}
          aria-label={mute ? 'Unmute sounds' : 'Mute sounds'}
        >
          {mute ? '🔇' : '🔊'}
        </button>
      </div>
    </div>
  )
}
