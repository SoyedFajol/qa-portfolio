import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { SECTIONS } from '../data/sections'
import { pathPoint } from './constants'
import { sfx } from '../game/sfx'

function Checkpoint({ section, side, visited, onOpen }) {
  const crystal = useRef()
  const orbit = useRef()
  const disc = useRef()
  const [hover, setHover] = useState(false)
  const p = pathPoint(section.at)
  const x = p.x + p.nx * side * 2.7
  const z = p.z + p.nz * side * 2.7

  useFrame((state) => {
    if (!crystal.current) return
    const t = state.clock.elapsedTime + section.at * 20
    crystal.current.rotation.y = t * 0.8
    crystal.current.position.y = 1.35 + Math.sin(t * 1.8) * 0.12
    if (orbit.current) {
      orbit.current.rotation.z = t * 1.4
      orbit.current.position.y = crystal.current.position.y
    }
    if (disc.current) {
      disc.current.material.emissiveIntensity = 0.35 + (Math.sin(t * 2.2) + 1) * 0.2
    }
  })

  const color = visited ? '#39ff88' : '#a06bff'

  return (
    <group position={[x, 0, z]} rotation={[0, p.yaw, 0]}>
      {/* pulsing floor marker — spot the level from far away */}
      <mesh ref={disc} position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.0, 1.55, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} transparent opacity={0.85} side={2} />
      </mesh>
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
        <octahedronGeometry args={[0.72, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hover ? 1.2 : 0.6}
          transparent
          opacity={0.94}
        />
      </mesh>
      {/* orbiting ring drawing the eye */}
      <mesh ref={orbit} position={[0, 1.35, 0]} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[1.0, 0.035, 6, 28]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} transparent opacity={0.8} />
      </mesh>

      {/* label — the portfolio is the point; make it unmissable */}
      <Html center position={[0, 2.85, 0]} style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
        <div
          aria-hidden="true"
          className="checkpoint-glow whitespace-nowrap border-[3px] bg-[#0b1026] px-3 py-2 text-center"
          style={{
            borderColor: hover ? '#ffd93d' : color,
            boxShadow: `0 0 14px 2px ${hover ? 'rgba(255,217,61,0.5)' : 'rgba(57,255,136,0.35)'}, 4px 4px 0 rgba(0,0,0,0.6)`,
            transform: hover ? 'scale(1.1)' : 'scale(1)',
            transition: 'transform 120ms',
          }}
        >
          <p className="font-pixel text-[12px]" style={{ color: hover ? '#ffd93d' : '#ffffff' }}>
            {section.icon} {section.label} {visited ? '✓' : ''}
          </p>
          <p className="mt-1 font-pixel text-[9px]" style={{ color }}>
            {hover ? '▶ OPEN' : 'CLICK TO OPEN'}
          </p>
        </div>
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
