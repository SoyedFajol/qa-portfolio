import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { SECTIONS } from '../data/sections'
import { pathPoint } from './constants'
import { sfx } from '../game/sfx'

function Checkpoint({ section, side, visited, onOpen }) {
  const crystal = useRef()
  const [hover, setHover] = useState(false)
  const p = pathPoint(section.at)
  const x = p.x + p.nx * side * 2.7
  const z = p.z + p.nz * side * 2.7

  useFrame((state) => {
    if (!crystal.current) return
    const t = state.clock.elapsedTime + section.at * 20
    crystal.current.rotation.y = t * 0.8
    crystal.current.position.y = 1.15 + Math.sin(t * 1.8) * 0.12
  })

  const color = visited ? '#39ff88' : '#a06bff'

  return (
    <group position={[x, 0, z]} rotation={[0, p.yaw, 0]}>
      {/* pedestal */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[1.15, 0.6, 1.15]} />
        <meshStandardMaterial color="#1d2650" />
      </mesh>
      {/* light beam rising into the sky */}
      <mesh position={[0, 6, 0]}>
        <cylinderGeometry args={[0.36, 0.55, 11, 8, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={hover ? 0.2 : 0.1} depthWrite={false} />
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
        <octahedronGeometry args={[0.62, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hover ? 1.1 : 0.45}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* label — the portfolio is the point; make it unmissable */}
      <Html center position={[0, 2.5, 0]} style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
        <button
          tabIndex={-1}
          aria-hidden="true"
          className={`checkpoint-glow whitespace-nowrap border-2 bg-night/95 px-2.5 py-1.5 font-pixel text-[10px] ${
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
