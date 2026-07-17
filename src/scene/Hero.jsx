import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { pathPoint, PATH_LENGTH, GAP_START, CLIFF_T } from './constants'
import { sfx } from '../game/sfx'

const SKIN = '#e8b17e'
// Argentina 2026 kit — REHEL 10 🇦🇷
const JERSEY = '#f4f8ff'
const ALBI = '#75aadb' // albiceleste sky blue
const SHORTS = '#171d33'
const SOCKS = '#f4f8ff'
const DARK = '#181c33'

const GRAVITY = 22
const JUMP_VELOCITY = 7.5

/**
 * Soyed's voxel avatar walking the loop road: glasses, hoodie, laptop, bug
 * net. Auto-jumps the Round-2 gap, and walks off the cliff at the end of the
 * lap (the fall is handled here; the respawn scroll-back lives in World).
 */
export default function Hero({ speedRef, tRef }) {
  const group = useRef()
  const legL = useRef()
  const legR = useRef()
  const armL = useRef()
  const armR = useRef()
  const body = useRef()
  const head = useRef()
  const stepAcc = useRef(0)
  const lastT = useRef(0)
  const jumpY = useRef(0)
  const jumpVel = useRef(0)
  const fallY = useRef(0)
  const fallVel = useRef(0)

  function jump(boost = 1) {
    if (jumpY.current > 0.01 || fallY.current > 0) return
    jumpVel.current = JUMP_VELOCITY * boost
    sfx.jump()
  }

  // SPACE / ArrowUp = jump (without scrolling the page); mobile's JUMP
  // button fires the custom 'hero-jump' event
  useEffect(() => {
    function onKey(e) {
      if (e.code !== 'Space' && e.code !== 'ArrowUp') return
      const el = document.activeElement
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'BUTTON')) return
      e.preventDefault()
      jump()
    }
    const onJumpEvent = () => jump()
    window.addEventListener('keydown', onKey)
    window.addEventListener('hero-jump', onJumpEvent)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('hero-jump', onJumpEvent)
    }
  }, [])

  useFrame((state, delta) => {
    if (!group.current) return
    const time = state.clock.elapsedTime
    const t = tRef.current
    const speed = Math.min(1, Math.abs(speedRef.current))
    const walking = speed > 0.02

    // place + face along the loop
    const p = pathPoint(t)
    group.current.rotation.y = p.yaw

    // the gap into Round 2: leap automatically when walking into it
    if (walking && t > GAP_START - 0.01 && t < GAP_START + 0.002) {
      jump(1.25)
    }

    // the cliff: past the edge there is no road — gravity wins
    if (t > CLIFF_T) {
      fallVel.current += GRAVITY * delta
      fallY.current += fallVel.current * delta
      group.current.rotation.z = Math.min(0.9, fallY.current * 0.15)
    } else if (fallY.current > 0 && t < 0.5) {
      // respawned at the start of the loop
      fallY.current = 0
      fallVel.current = 0
      group.current.rotation.z = 0
    }

    // jump physics
    if (jumpVel.current !== 0 || jumpY.current > 0) {
      jumpY.current = Math.max(0, jumpY.current + jumpVel.current * delta)
      jumpVel.current -= GRAVITY * delta
      if (jumpY.current === 0 && jumpVel.current < 0) jumpVel.current = 0
    }
    group.current.position.set(p.x, jumpY.current - fallY.current, p.z)
    const airborne = jumpY.current > 0.01 || fallY.current > 0.01

    // head follows the visitor's pointer (subtle, lerped)
    if (head.current) {
      const targetY = -state.pointer.x * 0.5
      const targetX = -state.pointer.y * 0.22
      head.current.rotation.y += (targetY - head.current.rotation.y) * 0.12
      head.current.rotation.x += (targetX - head.current.rotation.x) * 0.12
    }

    // footsteps: one soft tick per stride of distance walked around the loop
    stepAcc.current += Math.abs(t - lastT.current) * PATH_LENGTH
    lastT.current = t
    if (walking && !airborne && stepAcc.current > 1.1) {
      stepAcc.current = 0
      sfx.step()
    }

    // limbs tuck mid-air
    if (airborne) {
      legL.current.rotation.x = 0.55
      legR.current.rotation.x = 0.4
      armL.current.rotation.x = -0.5
      armR.current.rotation.x = -0.3
      body.current.position.y = 1.05
      return
    }

    if (walking) {
      const swing = Math.sin(time * 10) * 0.65 * Math.min(1, speed * 3)
      legL.current.rotation.x = swing
      legR.current.rotation.x = -swing
      armL.current.rotation.x = -swing * 0.7
      armR.current.rotation.x = swing * 0.4
      body.current.position.y = 1.05 + Math.abs(Math.sin(time * 10)) * 0.06
    } else {
      legL.current.rotation.x *= 0.85
      legR.current.rotation.x *= 0.85
      armL.current.rotation.x *= 0.85
      armR.current.rotation.x = Math.sin(time * 1.6) * 0.06
      body.current.position.y = 1.05 + Math.sin(time * 1.6) * 0.03
    }
  })

  return (
    <group
      ref={group}
      onClick={(e) => {
        e.stopPropagation()
        jump()
      }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {/* legs: dark shorts over white socks */}
      <group position={[-0.16, 0.55, 0]} ref={legL}>
        <mesh position={[0, -0.13, 0]} castShadow>
          <boxGeometry args={[0.22, 0.28, 0.24]} />
          <meshStandardMaterial color={SHORTS} />
        </mesh>
        <mesh position={[0, -0.41, 0]} castShadow>
          <boxGeometry args={[0.2, 0.28, 0.22]} />
          <meshStandardMaterial color={SOCKS} />
        </mesh>
      </group>
      <group position={[0.16, 0.55, 0]} ref={legR}>
        <mesh position={[0, -0.13, 0]} castShadow>
          <boxGeometry args={[0.22, 0.28, 0.24]} />
          <meshStandardMaterial color={SHORTS} />
        </mesh>
        <mesh position={[0, -0.41, 0]} castShadow>
          <boxGeometry args={[0.2, 0.28, 0.22]} />
          <meshStandardMaterial color={SOCKS} />
        </mesh>
      </group>

      {/* torso: the albiceleste jersey */}
      <group ref={body} position={[0, 1.05, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.72, 0.75, 0.42]} />
          <meshStandardMaterial color={JERSEY} />
        </mesh>
        {/* sky-blue vertical stripes, front and back */}
        {[0.215, -0.215].map((z) =>
          [-0.22, 0, 0.22].map((x) => (
            <mesh key={`${z}-${x}`} position={[x, 0, z]}>
              <boxGeometry args={[0.13, 0.75, 0.015]} />
              <meshStandardMaterial color={ALBI} />
            </mesh>
          ))
        )}
        {/* collar */}
        <mesh position={[0, 0.36, 0]}>
          <boxGeometry args={[0.4, 0.06, 0.44]} />
          <meshStandardMaterial color={ALBI} />
        </mesh>
        {/* REHEL 10 on the back — big enough to read from the chase camera */}
        <Html
          transform
          position={[0, 0.04, -0.235]}
          rotation={[0, Math.PI, 0]}
          distanceFactor={2.8}
          style={{ pointerEvents: 'none' }}
          zIndexRange={[5, 0]}
        >
          <div className="select-none text-center leading-none">
            <p
              className="font-pixel text-[12px] tracking-[0.2em] text-[#0a0d1a]"
              style={{ textShadow: '0 0 2px #fff, 0 0 3px #fff, 1px 1px 0 #fff, -1px -1px 0 #fff' }}
            >
              REHEL
            </p>
            <p
              className="mt-0.5 font-pixel text-[34px] text-[#0a0d1a]"
              style={{ textShadow: '0 0 3px #fff, 0 0 4px #fff, 2px 2px 0 #fff, -2px -2px 0 #fff' }}
            >
              10
            </p>
          </div>
        </Html>

        {/* head */}
        <group ref={head} position={[0, 0.72, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.52, 0.5, 0.48]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>
          <mesh position={[0, 0.24, -0.03]}>
            <boxGeometry args={[0.56, 0.14, 0.5]} />
            <meshStandardMaterial color={DARK} />
          </mesh>
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

        {/* left arm + laptop */}
        <group ref={armL} position={[-0.45, 0.25, 0]}>
          <mesh position={[0, -0.14, 0]} castShadow>
            <boxGeometry args={[0.18, 0.3, 0.2]} />
            <meshStandardMaterial color={ALBI} />
          </mesh>
          <mesh position={[0, -0.44, 0]} castShadow>
            <boxGeometry args={[0.17, 0.3, 0.19]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>
          <mesh position={[-0.08, -0.55, 0.12]} rotation={[0, 0, 0.12]}>
            <boxGeometry args={[0.1, 0.34, 0.46]} />
            <meshStandardMaterial color="#3a415f" />
          </mesh>
          <mesh position={[-0.14, -0.55, 0.12]} rotation={[0, 0, 0.12]}>
            <boxGeometry args={[0.02, 0.3, 0.4]} />
            <meshStandardMaterial color="#39ff88" emissive="#39ff88" emissiveIntensity={0.5} />
          </mesh>
        </group>

        {/* right arm + bug net */}
        <group ref={armR} position={[0.45, 0.25, 0]}>
          <mesh position={[0, -0.14, 0]} castShadow>
            <boxGeometry args={[0.18, 0.3, 0.2]} />
            <meshStandardMaterial color={ALBI} />
          </mesh>
          <mesh position={[0, -0.44, 0]} castShadow>
            <boxGeometry args={[0.17, 0.3, 0.19]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>
          <group position={[0.05, -0.55, 0.15]} rotation={[0.5, 0, -0.2]}>
            <mesh position={[0, 0.45, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 1.1, 6]} />
              <meshStandardMaterial color="#8a6a3b" />
            </mesh>
            <mesh position={[0, 1.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.22, 0.03, 6, 12]} />
              <meshStandardMaterial color="#c0c6e8" />
            </mesh>
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
