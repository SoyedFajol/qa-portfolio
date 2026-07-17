import { Html } from '@react-three/drei'
import { PROFILE } from '../data/profile'
import { pathPoint } from './constants'

/** The 6 story-arc milestone signposts, planted along Round 1 of the loop.
 * Labels are skipped on mobile (fewer live DOM overlays = smoother). */
export default function Signposts({ onOpen, mobile = false }) {
  return (
    <group>
      {PROFILE.story.map((m, i) => {
        // spread across Round 1 (the portfolio half), opposite the checkpoints
        const at = 0.035 + (i / (PROFILE.story.length - 1)) * 0.31
        const p = pathPoint(at)
        const side = i % 2 === 0 ? 1 : -1
        const x = p.x + p.nx * side * 1.95
        const z = p.z + p.nz * side * 1.95
        return (
          <group key={m.title} position={[x, 0, z]} rotation={[0, Math.atan2(p.nx, p.nz), 0]}>
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
            {!mobile && (
              <Html center position={[0, 1.05, 0.08]} style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
                <span className="block w-32 whitespace-normal text-center font-pixel text-[7px] leading-relaxed text-[#2a1c08]">
                  {m.icon} {m.title}
                </span>
              </Html>
            )}
          </group>
        )
      })}
    </group>
  )
}
