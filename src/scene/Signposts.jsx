import { Html } from '@react-three/drei'
import { PROFILE } from '../data/profile'
import { pathPoint } from './constants'
import { useNearCamera } from './useNearCamera'

function Signpost({ milestone, at, side, onOpen, mobile }) {
  const p = pathPoint(at)
  const x = p.x + p.nx * side * 1.95
  const z = p.z + p.nz * side * 1.95
  // labels scale with distance and unmount when far — no more step cards
  // stacking onto the checkpoint cards
  const labelVisible = useNearCamera(x, z, 24, 29)
  return (
    <group position={[x, 0, z]} rotation={[0, Math.atan2(p.nx, p.nz), 0]}>
      {/* post */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.12, 1.1, 0.12]} />
        <meshStandardMaterial color="#6b4f2a" />
      </mesh>
      {/* board */}
      <mesh
        position={[0, 1.05, 0]}
        castShadow
        onClick={(e) => {
          e.stopPropagation()
          onOpen('journey')
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <boxGeometry args={[1.3, 0.55, 0.08]} />
        <meshStandardMaterial color="#8a6a3b" />
      </mesh>
      {!mobile && labelVisible && (
        <Html center position={[0, 1.05, 0.08]} distanceFactor={6} style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
          <span className="block w-32 whitespace-normal text-center font-pixel text-[8px] leading-relaxed text-[#2a1c08]">
            {milestone.icon} {milestone.title}
          </span>
        </Html>
      )}
    </group>
  )
}

/** The 6 story-arc milestone signposts, planted along Round 1 of the loop.
 * Labels are skipped on mobile (fewer live DOM overlays = smoother). */
export default function Signposts({ onOpen, mobile = false }) {
  return (
    <group>
      {PROFILE.story.map((m, i) => (
        <Signpost
          key={m.title}
          milestone={m}
          // spread across Round 1 (the portfolio half), opposite the checkpoints
          at={0.035 + (i / (PROFILE.story.length - 1)) * 0.31}
          side={i % 2 === 0 ? 1 : -1}
          onOpen={onOpen}
          mobile={mobile}
        />
      ))}
    </group>
  )
}
