import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars, Sparkles } from '@react-three/drei'
import Hero from './Hero'
import BugsyNpc from './BugsyNpc'
import Checkpoints from './Checkpoints'
import Signposts from './Signposts'
import { PATH_LENGTH, seeded } from './constants'
import { SECTIONS } from '../data/sections'
import { gainXp } from '../game/rewards'
import { sfx } from '../game/sfx'

/** Wide neon grid + walkway + scattered tiles: a full floor, not a line. */
function NeonFloor({ mobile }) {
  const pulseTiles = useRef([])

  const tiles = useMemo(() => {
    const list = []
    const count = mobile ? 30 : 60
    for (let i = 0; i < count; i++) {
      const z = -seeded(i) * (PATH_LENGTH + 14)
      const x = (seeded(i + 100) - 0.5) * 30
      if (Math.abs(x) < 2.4) continue
      list.push({
        key: i,
        pos: [x, -0.26 + seeded(i + 200) * 0.15, z],
        size: 0.9 + seeded(i + 300) * 1.8,
        color: ['#1d2650', '#232e63', '#2a356e'][i % 3],
        pulse: i % 4 === 0, // every 4th tile glows and breathes
        pulseColor: ['#39ff88', '#a06bff', '#ffd93d', '#ff8a3d'][i % 4],
      })
    }
    return list
  }, [mobile])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    pulseTiles.current.forEach((mat, i) => {
      if (mat) mat.emissiveIntensity = 0.25 + (Math.sin(t * 1.6 + i * 1.7) + 1) * 0.3
    })
  })

  let pulseIdx = -1
  return (
    <group>
      {/* glowing wireframe grid across the whole floor */}
      <gridHelper
        args={[44, 44, '#3a4fa0', '#1d2650']}
        position={[0, -0.27, -PATH_LENGTH / 2]}
        scale={[1, 1, 3.4]}
      />
      {/* main walkway */}
      <mesh position={[0, -0.15, -PATH_LENGTH / 2]} receiveShadow>
        <boxGeometry args={[3.6, 0.3, PATH_LENGTH + 16]} />
        <meshStandardMaterial color="#2a356e" />
      </mesh>
      <mesh position={[0, 0.01, -PATH_LENGTH / 2]}>
        <boxGeometry args={[0.5, 0.02, PATH_LENGTH + 16]} />
        <meshStandardMaterial color="#39ff88" emissive="#39ff88" emissiveIntensity={0.3} />
      </mesh>

      {tiles.map((tile) => {
        if (tile.pulse) pulseIdx += 1
        const idx = pulseIdx
        return (
          <mesh key={tile.key} position={tile.pos}>
            <boxGeometry args={[tile.size, 0.3, tile.size]} />
            {tile.pulse ? (
              <meshStandardMaterial
                ref={(m) => (pulseTiles.current[idx] = m)}
                color={tile.color}
                emissive={tile.pulseColor}
                emissiveIntensity={0.4}
              />
            ) : (
              <meshStandardMaterial color={tile.color} />
            )}
          </mesh>
        )
      })}
    </group>
  )
}

/** Floating neon cubes + slow drifting clouds filling the sky. */
function SkyLife({ mobile }) {
  const floatGroup = useRef()
  const cloudGroup = useRef()

  const floaters = useMemo(() => {
    const cubes = []
    const count = mobile ? 10 : 20
    for (let i = 0; i < count; i++) {
      cubes.push({
        key: i,
        pos: [(seeded(i + 500) - 0.5) * 30, 2.5 + seeded(i + 600) * 6, -seeded(i + 700) * PATH_LENGTH],
        size: 0.25 + seeded(i + 800) * 0.55,
        color: ['#39ff88', '#a06bff', '#ffd93d', '#ff8a3d'][i % 4],
        speed: 0.4 + seeded(i + 900) * 0.9,
      })
    }
    return cubes
  }, [mobile])

  const clouds = useMemo(() => {
    const list = []
    const count = mobile ? 4 : 8
    for (let i = 0; i < count; i++) {
      list.push({
        key: i,
        pos: [(seeded(i + 40) - 0.5) * 36, 7 + seeded(i + 41) * 4, -seeded(i + 42) * PATH_LENGTH],
        w: 3 + seeded(i + 43) * 4,
        speed: 0.15 + seeded(i + 44) * 0.25,
      })
    }
    return list
  }, [mobile])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    floatGroup.current?.children.forEach((c, i) => {
      const f = floaters[i]
      c.position.y = f.pos[1] + Math.sin(t * f.speed + i) * 0.5
      c.rotation.x = t * 0.25 * f.speed
      c.rotation.y = t * 0.35 * f.speed
    })
    cloudGroup.current?.children.forEach((c, i) => {
      const cl = clouds[i]
      // drift sideways and wrap around
      c.position.x = ((cl.pos[0] + t * cl.speed + 18) % 36) - 18
    })
  })

  return (
    <group>
      <group ref={floatGroup}>
        {floaters.map((f) => (
          <mesh key={f.key} position={f.pos}>
            <boxGeometry args={[f.size, f.size, f.size]} />
            <meshStandardMaterial color={f.color} emissive={f.color} emissiveIntensity={0.4} />
          </mesh>
        ))}
      </group>
      <group ref={cloudGroup}>
        {clouds.map((cl) => (
          <group key={cl.key} position={cl.pos}>
            <mesh>
              <boxGeometry args={[cl.w, 0.5, 1.4]} />
              <meshStandardMaterial color="#2a356e" transparent opacity={0.5} />
            </mesh>
            <mesh position={[cl.w * 0.28, 0.35, 0]}>
              <boxGeometry args={[cl.w * 0.5, 0.4, 1.1]} />
              <meshStandardMaterial color="#324086" transparent opacity={0.5} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

/** A shooting star streaks across the sky every few seconds. */
function ShootingStar() {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    const cycle = 6.5
    const t = state.clock.elapsedTime % cycle
    if (t < 1.1) {
      const p = t / 1.1
      const lap = Math.floor(state.clock.elapsedTime / cycle)
      const zBase = -seeded(lap) * PATH_LENGTH
      ref.current.visible = true
      ref.current.position.set(-16 + p * 32, 12 - p * 5, zBase - 10)
      ref.current.material.opacity = Math.sin(p * Math.PI) * 0.9
    } else {
      ref.current.visible = false
    }
  })
  return (
    <mesh ref={ref} rotation={[0, 0, -0.28]}>
      <boxGeometry args={[1.6, 0.05, 0.05]} />
      <meshBasicMaterial color="#e6e9ff" transparent opacity={0} />
    </mesh>
  )
}

/** Quiet chime whenever the hero walks past a checkpoint. */
function CheckpointChimes({ heroZRef }) {
  const passed = useRef(new Set())
  useFrame(() => {
    for (const s of SECTIONS) {
      const z = -s.at * PATH_LENGTH
      if (!passed.current.has(s.id) && heroZRef.current <= z + 0.4) {
        passed.current.add(s.id)
        sfx.ding()
      }
    }
  })
  return null
}

/** Spinning XP coins hovering over the walkway — walk through to collect. */
function Coins({ heroZRef, mobile }) {
  const group = useRef()
  const coins = useMemo(() => {
    const list = []
    const step = mobile ? 12 : 8
    for (let z = -6; z > -PATH_LENGTH; z -= step) {
      list.push({ z, x: (seeded(z) - 0.5) * 1.6 })
    }
    return list
  }, [mobile])
  const collected = useRef(new Set())

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    group.current.children.forEach((c, i) => {
      if (collected.current.has(i)) return
      c.rotation.y = t * 3
      c.position.y = 1.1 + Math.sin(t * 2 + i) * 0.1
      if (Math.abs(coins[i].z - heroZRef.current) < 0.7) {
        collected.current.add(i)
        c.visible = false
        sfx.coin()
        gainXp(2, { silent: true })
      }
    })
  })

  return (
    <group ref={group}>
      {coins.map((c, i) => (
        <mesh key={i} position={[c.x, 1.1, c.z]}>
          <cylinderGeometry args={[0.16, 0.16, 0.05, 12]} />
          <meshStandardMaterial color="#ffd93d" emissive="#ffd93d" emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

/** Smoothly follows the scroll progress and drives hero + camera (with sway). */
function Rig({ progressRef, heroZRef, speedRef }) {
  const { camera } = useThree()
  const smoothed = useRef(0)

  useFrame((state, delta) => {
    const target = progressRef.current
    const prev = smoothed.current
    const k = 1 - Math.exp(-delta * 5)
    smoothed.current = prev + (target - prev) * k
    speedRef.current = (smoothed.current - prev) * PATH_LENGTH * 0.6

    const heroZ = -smoothed.current * PATH_LENGTH
    heroZRef.current = heroZ

    const t = state.clock.elapsedTime
    camera.position.set(
      4.6 + Math.sin(t * 0.32) * 0.35,
      3.6 + Math.sin(t * 0.45) * 0.2,
      heroZ + 7.5
    )
    camera.lookAt(Math.sin(t * 0.2) * 0.2, 1.2, heroZ - 2.5)
  })
  return null
}

/**
 * The 3D pixel world. Rendered fixed behind the scroll container; the page's
 * native scroll (progressRef 0..1) walks the hero down the path.
 */
export default function World({ progressRef, visitedIds, onOpenSection }) {
  const heroZRef = useRef(0)
  const speedRef = useRef(0)
  const mobile = typeof window !== 'undefined' && window.innerWidth < 640

  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={[1, mobile ? 1.5 : 1.75]}
        camera={{ fov: 50, near: 0.1, far: 90, position: [4.6, 3.6, 7.5] }}
        shadows={!mobile}
        gl={{ antialias: !mobile, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#0b1026']} />
        <fog attach="fog" args={['#0b1026', 14, mobile ? 36 : 50]} />

        <ambientLight intensity={0.55} />
        <directionalLight
          position={[6, 10, 4]}
          intensity={1.1}
          castShadow={!mobile}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-4, 3, -8]} intensity={12} color="#a06bff" />

        <Stars radius={70} depth={40} count={mobile ? 1100 : 2600} factor={3.2} saturation={0.4} fade speed={0.9} />
        <Sparkles count={mobile ? 40 : 110} scale={[26, 9, 44]} position={[0, 3, -18]} size={2.2} speed={0.35} color="#39ff88" />
        <Sparkles count={mobile ? 25 : 70} scale={[26, 10, 44]} position={[0, 4, -60]} size={2.6} speed={0.25} color="#a06bff" />

        <NeonFloor mobile={mobile} />
        <SkyLife mobile={mobile} />
        <ShootingStar />
        <Coins heroZRef={heroZRef} mobile={mobile} />
        <CheckpointChimes heroZRef={heroZRef} />
        <Hero speedRef={speedRef} positionRef={heroZRef} />
        <BugsyNpc positionRef={heroZRef} />
        <Checkpoints visitedIds={visitedIds} onOpen={onOpenSection} />
        <Signposts onOpen={onOpenSection} />

        <Rig progressRef={progressRef} heroZRef={heroZRef} speedRef={speedRef} />
      </Canvas>
    </div>
  )
}
