import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { ROUNDS } from '../data/sections'
import { pathPoint } from './constants'

const COLORS = { 1: '#39ff88', 2: '#a06bff' }

function Gate({ at, color: c, title, subtitle, phase = 0, hazard = false }) {
  const p = pathPoint(at)
  const trim = useRef()
  const beams = useRef([])
  const board = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime + phase
    if (trim.current) trim.current.material.emissiveIntensity = 0.7 + (Math.sin(t * 2) + 1) * 0.3
    beams.current.forEach((b, i) => {
      if (b) b.material.opacity = 0.1 + (Math.sin(t * 1.6 + i * Math.PI) + 1) * 0.05
    })
  })

  const glow = `0 0 6px ${c}, 0 0 14px ${c}, 0 0 26px ${c}`

  return (
    <group position={[p.x, 0, p.z]} rotation={[0, p.yaw, 0]}>
      {/* pillars */}
      {[-2.6, 2.6].map((x) => (
        <group key={x}>
          <mesh position={[x, 2.1, 0]} castShadow>
            <boxGeometry args={[0.7, 4.2, 0.7]} />
            <meshStandardMaterial color="#1d2650" emissive={c} emissiveIntensity={0.18} />
          </mesh>
          {/* hazard stripes on the finish gate — this bar means the drop */}
          {hazard &&
            [0.55, 1.35, 2.15].map((y, i) => (
              <mesh key={y} position={[x, y, 0]}>
                <boxGeometry args={[0.76, 0.42, 0.76]} />
                <meshStandardMaterial
                  color={i % 2 ? '#181c33' : '#ffd93d'}
                  emissive={i % 2 ? '#000000' : '#ffd93d'}
                  emissiveIntensity={i % 2 ? 0 : 0.3}
                />
              </mesh>
            ))}
          <mesh position={[x, 4.35, 0]}>
            <boxGeometry args={[0.9, 0.35, 0.9]} />
            <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.9} />
          </mesh>
          <mesh ref={(el) => (beams.current[x > 0 ? 1 : 0] = el)} position={[x, 7.8, 0]}>
            <cylinderGeometry args={[0.28, 0.45, 6.5, 8, 1, true]} />
            <meshBasicMaterial color={c} transparent opacity={0.12} depthWrite={false} />
          </mesh>
        </group>
      ))}

      {/* the sign board — the name is WRITTEN on it, letters lit like neon */}
      <mesh ref={board} position={[0, 4.1, 0]} castShadow>
        <boxGeometry args={[6.6, 1.5, 0.55]} />
        <meshStandardMaterial color="#131936" emissive={c} emissiveIntensity={0.08} />
      </mesh>
      <mesh ref={trim} position={[0, 3.28, 0]}>
        <boxGeometry args={[6.6, 0.09, 0.62]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.9} />
      </mesh>

      {/* lit letters on BOTH faces — each occluded by the board, so each
          side reads only from its own side (no ghosting through) */}
      {[
        { z: 0.3, rot: 0 },
        { z: -0.3, rot: Math.PI },
      ].map((face) => (
        <Html
          key={face.z}
          transform
          occlude={[board]}
          position={[0, 4.1, face.z]}
          rotation={[0, face.rot, 0]}
          distanceFactor={6}
          style={{ pointerEvents: 'none' }}
          zIndexRange={[9, 0]}
        >
          <div className="select-none text-center leading-tight">
            <p className="font-pixel text-[22px]" style={{ color: c, textShadow: glow }}>
              {title}
            </p>
            <p className="font-pixel text-[9px] text-white" style={{ textShadow: '0 0 5px rgba(255,255,255,0.8)' }}>
              {subtitle}
            </p>
          </div>
        </Html>
      ))}

      {/* glowing line across the road */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.2, 0.5]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.5} transparent opacity={0.9} />
      </mesh>
    </group>
  )
}

/** Arches spanning the loop road: one where each round begins — and THE END
 * gate, the bar across the road right before the cliff. */
export default function RoundGates() {
  return (
    <group>
      {ROUNDS.map((round) => {
        const [title, subtitle] = round.title.split(' — ')
        return (
          <Gate
            key={round.id}
            at={round.at}
            color={COLORS[round.id]}
            title={title}
            subtitle={subtitle}
            phase={round.id * 2}
          />
        )
      })}
      {/* 🏁 the finish bar — two steps later, the drop */}
      <Gate
        at={0.974}
        color="#ff5d5d"
        title="THE END"
        subtitle="🏁 the road is a circle — JUMP!"
        phase={5}
        hazard
      />
    </group>
  )
}
