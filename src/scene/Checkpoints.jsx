import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { SECTIONS } from '../data/sections'
import { PATH_LENGTH } from './constants'
import { sfx } from '../game/sfx'

function Checkpoint({ section, side, visited, onOpen }) {
  const crystal = useRef()
  const [hover, setHover] = useState(false)
  const z = -section.at * PATH_LENGTH
  const x = side * 2.6

  useFrame((state) => {
    if (!crystal.current) return
    const t = state.clock.elapsedTime + section.at * 20
    crystal.current.rotation.y = t * 0.8
    crystal.current.position.y = 1.15 + Math.sin(t * 1.8) * 0.12
  })

  const color = visited ? '#39ff88' : '#a06bff'

  return (
    <group position={[x, 0, z]}>
      {/* pedestal */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.9, 0.5, 0.9]} />
        <meshStandardMaterial color="#1d2650" />
      </mesh>
      {/* light beam rising into the sky */}
      <mesh position={[0, 5.5, 0]}>
        <cylinderGeometry args={[0.28, 0.42, 10, 8, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={hover ? 0.16 : 0.07} depthWrite={false} />
      </mesh>
      {/* floating crystal — the clickable "level" */}
      <mesh
        ref={crystal}
        position={[0, 1.15, 0]}
        onClick={(e) => {
          e.stopPropagation()
          onOpen(section.id)
        }}
        onPointerOver={() => {
          setHover(true)
          sfx.hover()
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHover(false)
          document.body.style.cursor = 'auto'
        }}
        castShadow
      >
        <octahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hover ? 1.1 : 0.45}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* label */}
      <Html center position={[0, 2.15, 0]} style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
        <button
          tabIndex={-1}
          aria-hidden="true"
          className={`checkpoint-glow whitespace-nowrap border-2 bg-night/90 px-2 py-1 font-pixel text-[8px] ${
            hover ? 'border-pix-yellow text-pix-yellow' : 'border-panel-2 text-ink'
          }`}
        >
          {section.icon} {section.label} {visited ? '✓' : ''}
        </button>
      </Html>
    </group>
  )
}

/** All glowing section checkpoints along the path. */
export default function Checkpoints({ visitedIds, onOpen }) {
  return (
    <group>
      {SECTIONS.map((s, i) => (
        <Checkpoint
          key={s.id}
          section={s}
          side={i % 2 === 0 ? -1 : 1}
          visited={visitedIds.includes(s.id)}
          onOpen={onOpen}
        />
      ))}
    </group>
  )
}
