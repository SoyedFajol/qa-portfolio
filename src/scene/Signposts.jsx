import { Html } from '@react-three/drei'
import { PROFILE } from '../data/profile'
import { PATH_LENGTH } from './constants'

/** The 6 story-arc milestone signposts planted along the journey. */
export default function Signposts({ onOpen }) {
  return (
    <group>
      {PROFILE.story.map((m, i) => {
        // spread between the start and ~90% of the path, opposite the checkpoints
        const at = 0.05 + (i / (PROFILE.story.length - 1)) * 0.85
        const z = -at * PATH_LENGTH
        const x = i % 2 === 0 ? 1.9 : -1.9
        return (
          <group key={m.title} position={[x, 0, z]} rotation={[0, i % 2 === 0 ? -0.4 : 0.4, 0]}>
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
            <Html center position={[0, 1.05, 0.08]} style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
              <span className="block w-32 whitespace-normal text-center font-pixel text-[7px] leading-relaxed text-[#2a1c08]">
                {m.icon} {m.title}
              </span>
            </Html>
          </group>
        )
      })}
    </group>
  )
}
