import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { ROUNDS } from '../data/sections'
import { pathPoint } from './constants'

const COLORS = { 1: '#39ff88', 2: '#a06bff' }

function Gate({ round }) {
  const p = pathPoint(round.at)
  const c = COLORS[round.id]
  const trim = useRef()
  const beams = useRef([])

  useFrame((state) => {
    const t = state.clock.elapsedTime + round.id * 2
    if (trim.current) trim.current.material.emissiveIntensity = 0.7 + (Math.sin(t * 2) + 1) * 0.3
    beams.current.forEach((b, i) => {
      if (b) b.material.opacity = 0.1 + (Math.sin(t * 1.6 + i * Math.PI) + 1) * 0.05
    })
  })

  return (
    <group position={[p.x, 0, p.z]} rotation={[0, p.yaw, 0]}>
      {/* massive pillars */}
      {[-2.6, 2.6].map((x) => (
        <group key={x}>
          <mesh position={[x, 2.6, 0]} castShadow>
            <boxGeometry args={[0.7, 5.2, 0.7]} />
            <meshStandardMaterial color="#1d2650" emissive={c} emissiveIntensity={0.18} />
          </mesh>
          {/* glowing pillar caps */}
          <mesh position={[x, 5.35, 0]}>
            <boxGeometry args={[0.9, 0.35, 0.9]} />
            <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.9} />
          </mesh>
          {/* light beams rising from the caps */}
          <mesh
            ref={(el) => (beams.current[x > 0 ? 1 : 0] = el)}
            position={[x, 9.5, 0]}
          >
            <cylinderGeometry args={[0.3, 0.5, 8, 8, 1, true]} />
            <meshBasicMaterial color={c} transparent opacity={0.12} depthWrite={false} />
          </mesh>
        </group>
      ))}

      {/* crossbar + pulsing trim */}
      <mesh position={[0, 5.5, 0]} castShadow>
        <boxGeometry args={[6.6, 0.7, 0.7]} />
        <meshStandardMaterial color="#1d2650" emissive={c} emissiveIntensity={0.25} />
      </mesh>
      <mesh ref={trim} position={[0, 5.1, 0]}>
        <boxGeometry args={[6.6, 0.1, 0.78]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.9} />
      </mesh>

      {/* glowing start line across the road */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.2, 0.5]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.5} transparent opacity={0.9} />
      </mesh>

      {/* THE banner — big, two lines, glowing frame */}
      <Html center position={[0, 5.5, 0.5]} style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
        <div
          className="whitespace-nowrap border-[3px] bg-[#0b1026] px-4 py-2 text-center"
          style={{
            borderColor: c,
            boxShadow: `0 0 18px 3px ${round.id === 1 ? 'rgba(57,255,136,0.45)' : 'rgba(160,107,255,0.45)'}, 5px 5px 0 rgba(0,0,0,0.6)`,
          }}
        >
          <p className="font-pixel text-[15px]" style={{ color: c }}>
            {round.title.split(' — ')[0]}
          </p>
          <p className="mt-1 font-pixel text-[9px] text-white">{round.title.split(' — ')[1]}</p>
          <p className="mt-1 font-body text-[10px]" style={{ color: '#9aa3d1' }}>{round.desc}</p>
        </div>
      </Html>
    </group>
  )
}

/** Monumental arches spanning the loop road where each round begins. */
export default function RoundGates() {
  return (
    <group>
      {ROUNDS.map((round) => (
        <Gate key={round.id} round={round} />
      ))}
    </group>
  )
}
