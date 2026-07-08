import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { grantAchievement } from '../game/rewards'
import { sfx } from '../game/sfx'

/**
 * Bugsy — the pixel ladybug sidekick. Bobs alongside the hero; poking it
 * makes it chirp and barrel-roll (and unlocks NPC Whisperer). Kept
 * deliberately low-poly: a few boxes and wings.
 */
export default function BugsyNpc({ positionRef }) {
  const group = useRef()
  const wingL = useRef()
  const wingR = useRef()
  const spinStart = useRef(-1)
  const [hover, setHover] = useState(false)

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    // hover beside and slightly behind the hero, with a lazy figure-eight bob
    group.current.position.set(
      1.5 + Math.sin(t * 0.9) * 0.25,
      1.9 + Math.sin(t * 2.1) * 0.18,
      positionRef.current + 0.9 + Math.cos(t * 0.7) * 0.2
    )
    group.current.rotation.y = Math.PI + Math.sin(t * 0.9) * 0.2

    // barrel roll for 0.8s after being poked (-2 = poked, start this frame)
    if (spinStart.current === -2) spinStart.current = t
    if (spinStart.current >= 0) {
      const p = (t - spinStart.current) / 0.8
      if (p >= 1) {
        spinStart.current = -1
        group.current.rotation.z = 0
      } else {
        group.current.rotation.z = p * Math.PI * 2
      }
    }

    const flap = Math.sin(t * 18) * 0.6
    wingL.current.rotation.z = 0.5 + flap
    wingR.current.rotation.z = -0.5 - flap
  })

  function poke(e) {
    e.stopPropagation()
    sfx.bugsy()
    grantAchievement('party-chat')
    spinStart.current = -2
  }

  return (
    <group
      ref={group}
      onClick={(e) => {
        poke(e)
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
    >
      {/* body */}
      <mesh castShadow>
        <boxGeometry args={[0.34, 0.26, 0.4]} />
        <meshStandardMaterial color="#ff5d5d" emissive="#ff5d5d" emissiveIntensity={hover ? 0.5 : 0.2} />
      </mesh>
      {/* spots */}
      {[[-0.08, 0.14, 0.06], [0.1, 0.14, -0.08], [0, 0.14, 0.14]].map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.08, 0.02, 0.08]} />
          <meshStandardMaterial color="#181c33" />
        </mesh>
      ))}
      {/* face */}
      <mesh position={[0, 0.02, 0.22]}>
        <boxGeometry args={[0.22, 0.16, 0.06]} />
        <meshStandardMaterial color="#181c33" />
      </mesh>
      {/* eyes */}
      <mesh position={[-0.05, 0.05, 0.26]}>
        <boxGeometry args={[0.04, 0.04, 0.02]} />
        <meshStandardMaterial color="#39ff88" emissive="#39ff88" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0.05, 0.05, 0.26]}>
        <boxGeometry args={[0.04, 0.04, 0.02]} />
        <meshStandardMaterial color="#39ff88" emissive="#39ff88" emissiveIntensity={0.8} />
      </mesh>
      {/* antennae */}
      <mesh position={[-0.06, 0.2, 0.16]} rotation={[0.4, 0, 0.3]}>
        <cylinderGeometry args={[0.012, 0.012, 0.18, 4]} />
        <meshStandardMaterial color="#181c33" />
      </mesh>
      <mesh position={[0.06, 0.2, 0.16]} rotation={[0.4, 0, -0.3]}>
        <cylinderGeometry args={[0.012, 0.012, 0.18, 4]} />
        <meshStandardMaterial color="#181c33" />
      </mesh>
      {/* wings */}
      <mesh ref={wingL} position={[-0.18, 0.16, -0.05]}>
        <boxGeometry args={[0.3, 0.02, 0.2]} />
        <meshStandardMaterial color="#e6e9ff" transparent opacity={0.6} />
      </mesh>
      <mesh ref={wingR} position={[0.18, 0.16, -0.05]}>
        <boxGeometry args={[0.3, 0.02, 0.2]} />
        <meshStandardMaterial color="#e6e9ff" transparent opacity={0.6} />
      </mesh>

      {hover && (
        <Html center position={[0, 0.55, 0]} style={{ pointerEvents: 'none' }}>
          <span className="whitespace-nowrap border-2 border-neon bg-night px-2 py-1 font-pixel text-[8px] text-neon">
            bzzt! 🐞
          </span>
        </Html>
      )}
    </group>
  )
}
