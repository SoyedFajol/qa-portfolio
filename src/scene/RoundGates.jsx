import { Html } from '@react-three/drei'
import { ROUNDS } from '../data/sections'
import { PATH_LENGTH } from './constants'

const COLORS = { 1: '#39ff88', 2: '#a06bff' }

/** Pixel arches spanning the walkway where each round begins. */
export default function RoundGates() {
  return (
    <group>
      {ROUNDS.map((round) => {
        const z = -round.at * PATH_LENGTH
        const c = COLORS[round.id]
        return (
          <group key={round.id} position={[0, 0, z]}>
            {/* pillars */}
            {[-2.2, 2.2].map((x) => (
              <mesh key={x} position={[x, 1.6, 0]} castShadow>
                <boxGeometry args={[0.45, 3.2, 0.45]} />
                <meshStandardMaterial color="#1d2650" emissive={c} emissiveIntensity={0.12} />
              </mesh>
            ))}
            {/* crossbar */}
            <mesh position={[0, 3.35, 0]} castShadow>
              <boxGeometry args={[5.3, 0.5, 0.5]} />
              <meshStandardMaterial color="#1d2650" emissive={c} emissiveIntensity={0.25} />
            </mesh>
            {/* glowing trim */}
            <mesh position={[0, 3.07, 0]}>
              <boxGeometry args={[5.3, 0.06, 0.55]} />
              <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.9} />
            </mesh>
            <Html center position={[0, 3.35, 0.4]} style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
              <span
                className="whitespace-nowrap border-2 bg-night/90 px-2 py-1 font-pixel text-[8px]"
                style={{ borderColor: c, color: c }}
              >
                {round.title}
              </span>
            </Html>
          </group>
        )
      })}
    </group>
  )
}
