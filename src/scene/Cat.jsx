import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { pathPoint } from './constants'
import { sfx } from '../game/sfx'

const FUR = '#e8913a' // orange tabby
const FUR_DARK = '#c9742a'
const CHEST = '#fff3e0'

/**
 * The hero's cat: trots along the inner side of the road (opposite Bugsy),
 * bobbing while the hero walks and sitting down when he stops. Tail always
 * has opinions. Poke it for a meow and a happy hop.
 */
export default function Cat({ tRef, speedRef }) {
  const group = useRef()
  const tail = useRef()
  const body = useRef()
  const head = useRef()
  const legs = useRef([])
  const hopVel = useRef(0)
  const hopY = useRef(0)
  const [hover, setHover] = useState(false)

  function poke(e) {
    e.stopPropagation()
    sfx.meow()
    if (hopY.current < 0.01) hopVel.current = 3.2
  }

  useFrame((state, delta) => {
    if (!group.current) return
    const time = state.clock.elapsedTime
    const speed = Math.min(1, Math.abs(speedRef.current))
    const walking = speed > 0.02

    // trot slightly behind the hero, on the inner side of the road
    const p = pathPoint(Math.max(0, tRef.current - 0.0045))
    const side = -1.35 - Math.sin(time * 0.7) * 0.15
    // happy hop physics
    if (hopVel.current !== 0 || hopY.current > 0) {
      hopY.current = Math.max(0, hopY.current + hopVel.current * delta)
      hopVel.current -= 14 * delta
      if (hopY.current === 0 && hopVel.current < 0) hopVel.current = 0
    }
    group.current.position.set(p.x + p.nx * side, hopY.current, p.z + p.nz * side)
    group.current.rotation.y = p.yaw

    if (walking) {
      // trot: leg scurry + body bounce, tail streams behind
      legs.current.forEach((l, i) => {
        if (l) l.rotation.x = Math.sin(time * 14 + (i % 2) * Math.PI) * 0.6
      })
      body.current.position.y = 0.32 + Math.abs(Math.sin(time * 14)) * 0.035
      body.current.rotation.x = 0
      tail.current.rotation.x = -0.5 + Math.sin(time * 8) * 0.25
      if (head.current) head.current.rotation.x = 0
    } else {
      // sit: rear down, tail curls and swishes slowly, ears listen
      legs.current.forEach((l) => {
        if (l) l.rotation.x *= 0.8
      })
      body.current.position.y = 0.3
      body.current.rotation.x = -0.22
      tail.current.rotation.x = -1.0 + Math.sin(time * 1.8) * 0.35
      if (head.current) head.current.rotation.x = 0.12 + Math.sin(time * 1.1) * 0.04
    }
  })

  return (
    <group
      ref={group}
      onClick={poke}
      onPointerOver={() => {
        setHover(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHover(false)
        document.body.style.cursor = 'auto'
      }}
    >
      {/* legs */}
      {[[-0.11, 0.17], [0.11, 0.17], [-0.11, -0.15], [0.11, -0.15]].map(([x, z], i) => (
        <group key={i} position={[x, 0.2, z]} ref={(el) => (legs.current[i] = el)}>
          <mesh position={[0, -0.1, 0]}>
            <boxGeometry args={[0.08, 0.2, 0.08]} />
            <meshStandardMaterial color={FUR_DARK} />
          </mesh>
        </group>
      ))}

      {/* body */}
      <group ref={body} position={[0, 0.32, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.3, 0.24, 0.52]} />
          <meshStandardMaterial color={FUR} />
        </mesh>
        {/* chest patch */}
        <mesh position={[0, -0.02, 0.24]}>
          <boxGeometry args={[0.18, 0.16, 0.05]} />
          <meshStandardMaterial color={CHEST} />
        </mesh>
        {/* tabby stripes */}
        {[-0.08, 0.06].map((z) => (
          <mesh key={z} position={[0, 0.11, z]}>
            <boxGeometry args={[0.31, 0.03, 0.07]} />
            <meshStandardMaterial color={FUR_DARK} />
          </mesh>
        ))}

        {/* head */}
        <group ref={head} position={[0, 0.16, 0.3]}>
          <mesh castShadow>
            <boxGeometry args={[0.26, 0.22, 0.22]} />
            <meshStandardMaterial color={FUR} />
          </mesh>
          {/* ears */}
          <mesh position={[-0.09, 0.15, 0]} rotation={[0, 0, 0.2]}>
            <coneGeometry args={[0.06, 0.12, 4]} />
            <meshStandardMaterial color={FUR_DARK} />
          </mesh>
          <mesh position={[0.09, 0.15, 0]} rotation={[0, 0, -0.2]}>
            <coneGeometry args={[0.06, 0.12, 4]} />
            <meshStandardMaterial color={FUR_DARK} />
          </mesh>
          {/* eyes */}
          <mesh position={[-0.06, 0.02, 0.115]}>
            <boxGeometry args={[0.045, 0.045, 0.01]} />
            <meshStandardMaterial color="#39ff88" emissive="#39ff88" emissiveIntensity={hover ? 1 : 0.6} />
          </mesh>
          <mesh position={[0.06, 0.02, 0.115]}>
            <boxGeometry args={[0.045, 0.045, 0.01]} />
            <meshStandardMaterial color="#39ff88" emissive="#39ff88" emissiveIntensity={hover ? 1 : 0.6} />
          </mesh>
          {/* nose */}
          <mesh position={[0, -0.05, 0.115]}>
            <boxGeometry args={[0.05, 0.035, 0.01]} />
            <meshStandardMaterial color="#ff8fb0" />
          </mesh>
        </group>

        {/* tail */}
        <group ref={tail} position={[0, 0.08, -0.26]}>
          <mesh position={[0, 0.14, -0.06]} rotation={[0.5, 0, 0]}>
            <boxGeometry args={[0.06, 0.34, 0.06]} />
            <meshStandardMaterial color={FUR} />
          </mesh>
          <mesh position={[0, 0.3, -0.14]} rotation={[0.5, 0, 0]}>
            <boxGeometry args={[0.055, 0.1, 0.055]} />
            <meshStandardMaterial color={FUR_DARK} />
          </mesh>
        </group>
      </group>

      {hover && (
        <Html center position={[0, 0.9, 0]} style={{ pointerEvents: 'none' }}>
          <span className="whitespace-nowrap border-2 border-pix-orange bg-night px-2 py-1 font-pixel text-[8px] text-pix-orange">
            meow! 🐱
          </span>
        </Html>
      )}
    </group>
  )
}
