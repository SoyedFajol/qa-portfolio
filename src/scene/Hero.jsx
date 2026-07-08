import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const SKIN = '#e8b17e'
const HOODIE = '#7a4fd0'
const PANTS = '#22306e'
const DARK = '#181c33'

/**
 * Soyed's voxel avatar: glasses, hoodie, laptop under one arm, bug-catching
 * net in the other hand. Pure box/cylinder geometry — no external models.
 * Walks when `speedRef.current` says the player is scrolling, idles otherwise.
 */
export default function Hero({ speedRef, positionRef }) {
  const group = useRef()
  const legL = useRef()
  const legR = useRef()
  const armL = useRef()
  const armR = useRef()
  const body = useRef()

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    const speed = Math.min(1, Math.abs(speedRef.current))
    const walking = speed > 0.02

    group.current.position.z = positionRef.current

    if (walking) {
      const swing = Math.sin(t * 10) * 0.65 * Math.min(1, speed * 3)
      legL.current.rotation.x = swing
      legR.current.rotation.x = -swing
      armL.current.rotation.x = -swing * 0.7
      armR.current.rotation.x = swing * 0.4
      body.current.position.y = 1.05 + Math.abs(Math.sin(t * 10)) * 0.06
    } else {
      // idle: soft breathing bob, limbs settle back
      legL.current.rotation.x *= 0.85
      legR.current.rotation.x *= 0.85
      armL.current.rotation.x *= 0.85
      armR.current.rotation.x = Math.sin(t * 1.6) * 0.06
      body.current.position.y = 1.05 + Math.sin(t * 1.6) * 0.03
    }
  })

  return (
    <group ref={group} rotation={[0, Math.PI, 0]}>
      {/* legs */}
      <group position={[-0.16, 0.55, 0]} ref={legL}>
        <mesh position={[0, -0.27, 0]} castShadow>
          <boxGeometry args={[0.22, 0.55, 0.24]} />
          <meshStandardMaterial color={PANTS} />
        </mesh>
      </group>
      <group position={[0.16, 0.55, 0]} ref={legR}>
        <mesh position={[0, -0.27, 0]} castShadow>
          <boxGeometry args={[0.22, 0.55, 0.24]} />
          <meshStandardMaterial color={PANTS} />
        </mesh>
      </group>

      {/* torso + head */}
      <group ref={body} position={[0, 1.05, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.72, 0.75, 0.42]} />
          <meshStandardMaterial color={HOODIE} />
        </mesh>
        {/* hood bump */}
        <mesh position={[0, 0.28, -0.26]}>
          <boxGeometry args={[0.5, 0.3, 0.14]} />
          <meshStandardMaterial color={HOODIE} />
        </mesh>
        {/* hoodie string dots */}
        <mesh position={[0.1, 0.15, 0.22]}>
          <boxGeometry args={[0.05, 0.2, 0.03]} />
          <meshStandardMaterial color="#d9d9ff" />
        </mesh>
        <mesh position={[-0.1, 0.15, 0.22]}>
          <boxGeometry args={[0.05, 0.2, 0.03]} />
          <meshStandardMaterial color="#d9d9ff" />
        </mesh>

        {/* head */}
        <group position={[0, 0.72, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.52, 0.5, 0.48]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>
          {/* hair */}
          <mesh position={[0, 0.24, -0.03]}>
            <boxGeometry args={[0.56, 0.14, 0.5]} />
            <meshStandardMaterial color={DARK} />
          </mesh>
          {/* glasses: two lenses + bridge */}
          <mesh position={[-0.13, 0.03, 0.25]}>
            <boxGeometry args={[0.16, 0.13, 0.03]} />
            <meshStandardMaterial color={DARK} emissive="#39ff88" emissiveIntensity={0.12} />
          </mesh>
          <mesh position={[0.13, 0.03, 0.25]}>
            <boxGeometry args={[0.16, 0.13, 0.03]} />
            <meshStandardMaterial color={DARK} emissive="#39ff88" emissiveIntensity={0.12} />
          </mesh>
          <mesh position={[0, 0.03, 0.25]}>
            <boxGeometry args={[0.1, 0.04, 0.03]} />
            <meshStandardMaterial color={DARK} />
          </mesh>
        </group>

        {/* left arm holding the laptop */}
        <group ref={armL} position={[-0.45, 0.25, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <boxGeometry args={[0.18, 0.6, 0.2]} />
            <meshStandardMaterial color={HOODIE} />
          </mesh>
          {/* laptop tucked under the arm */}
          <mesh position={[-0.08, -0.55, 0.12]} rotation={[0, 0, 0.12]}>
            <boxGeometry args={[0.1, 0.34, 0.46]} />
            <meshStandardMaterial color="#3a415f" />
          </mesh>
          <mesh position={[-0.14, -0.55, 0.12]} rotation={[0, 0, 0.12]}>
            <boxGeometry args={[0.02, 0.3, 0.4]} />
            <meshStandardMaterial color="#39ff88" emissive="#39ff88" emissiveIntensity={0.5} />
          </mesh>
        </group>

        {/* right arm with the bug net */}
        <group ref={armR} position={[0.45, 0.25, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <boxGeometry args={[0.18, 0.6, 0.2]} />
            <meshStandardMaterial color={HOODIE} />
          </mesh>
          <group position={[0.05, -0.55, 0.15]} rotation={[0.5, 0, -0.2]}>
            {/* handle */}
            <mesh position={[0, 0.45, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 1.1, 6]} />
              <meshStandardMaterial color="#8a6a3b" />
            </mesh>
            {/* ring */}
            <mesh position={[0, 1.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.22, 0.03, 6, 12]} />
              <meshStandardMaterial color="#c0c6e8" />
            </mesh>
            {/* net cone */}
            <mesh position={[0, 0.93, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.2, 0.28, 8, 1, true]} />
              <meshStandardMaterial color="#39ff88" transparent opacity={0.35} wireframe />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}
