import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars, Sparkles, Html } from '@react-three/drei'
import Hero from './Hero'
import BugsyNpc from './BugsyNpc'
import Checkpoints from './Checkpoints'
import Signposts from './Signposts'
import RoundGates from './RoundGates'
import { LOOP_CENTER, LOOP_RADIUS, PATH_LENGTH, GAP_START, GAP_END, CLIFF_T, pathPoint, seeded } from './constants'
import { SECTIONS } from '../data/sections'
import { useUiStore } from '../store/useUiStore'
import { gainXp } from '../game/rewards'
import { sfx } from '../game/sfx'

const TAU = Math.PI * 2

/** Flat arc of the ring road between progress t1..t2 (one draw call).
 * Mapping check: mesh is rotated x:-π/2, so ring angle φ lands at world
 * (cos φ, −sin φ) relative to center, while pathPoint(t) is (sin a, cos a)
 * with a = 2πt — hence φ = a − π/2. */
function RingArc({ t1, t2, inner, outer, y = 0, color = '#2a356e', emissive, emissiveIntensity = 0.3, segments = 96 }) {
  const thetaStart = TAU * t1 - Math.PI / 2
  const thetaLength = TAU * (t2 - t1)
  return (
    <mesh position={[LOOP_CENTER.x, y, LOOP_CENTER.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <ringGeometry args={[inner, outer, segments, 1, thetaStart, thetaLength]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive ?? '#000000'}
        emissiveIntensity={emissive ? emissiveIntensity : 0}
        side={2}
      />
    </mesh>
  )
}

/** The loop road: two arcs (Round 1 → gap, gap → cliff), neon stripe, gap
 * warning, cliff edge rubble and the finish flag. */
function RingRoad() {
  const gapSign = pathPoint(0.395)
  const finish = pathPoint(0.965)
  const rubble = useMemo(
    () =>
      [0, 1, 2].map((i) => {
        const p = pathPoint(CLIFF_T - 0.004 + i * 0.002)
        return { key: i, pos: [p.x + (seeded(i) - 0.5) * 2, 0.12 + seeded(i + 9) * 0.1, p.z], size: 0.3 + seeded(i + 5) * 0.35 }
      }),
    []
  )
  return (
    <group>
      {/* road surfaces */}
      <RingArc t1={0} t2={GAP_START} inner={LOOP_RADIUS - 1.8} outer={LOOP_RADIUS + 1.8} />
      <RingArc t1={GAP_END} t2={CLIFF_T} inner={LOOP_RADIUS - 1.8} outer={LOOP_RADIUS + 1.8} />
      {/* neon center stripe */}
      <RingArc t1={0} t2={GAP_START} inner={LOOP_RADIUS - 0.22} outer={LOOP_RADIUS + 0.22} y={0.02} color="#39ff88" emissive="#39ff88" />
      <RingArc t1={GAP_END} t2={CLIFF_T} inner={LOOP_RADIUS - 0.22} outer={LOOP_RADIUS + 0.22} y={0.02} color="#a06bff" emissive="#a06bff" />

      {/* JUMP! warning before the gap */}
      <group position={[gapSign.x + gapSign.nx * 2.4, 0, gapSign.z + gapSign.nz * 2.4]}>
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[0.1, 1.2, 0.1]} />
          <meshStandardMaterial color="#8a6a3b" />
        </mesh>
        <mesh position={[0, 1.25, 0]}>
          <boxGeometry args={[1.0, 0.5, 0.08]} />
          <meshStandardMaterial color="#ffd93d" emissive="#ffd93d" emissiveIntensity={0.35} />
        </mesh>
        <Html center position={[0, 1.25, 0.1]} style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
          <span className="whitespace-nowrap font-pixel text-[8px] text-night">⚠️ JUMP!</span>
        </Html>
      </group>

      {/* finish flag before the cliff */}
      <group position={[finish.x + finish.nx * 2.3, 0, finish.z + finish.nz * 2.3]}>
        <mesh position={[0, 1.1, 0]}>
          <boxGeometry args={[0.08, 2.2, 0.08]} />
          <meshStandardMaterial color="#c0c6e8" />
        </mesh>
        <mesh position={[0.35, 1.85, 0]}>
          <boxGeometry args={[0.7, 0.45, 0.04]} />
          <meshStandardMaterial color="#e6e9ff" emissive="#e6e9ff" emissiveIntensity={0.2} />
        </mesh>
        <Html center position={[0, 2.5, 0]} style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
          <span className="whitespace-nowrap border-2 border-danger bg-night/90 px-2 py-1 font-pixel text-[8px] text-danger">
            🏁 CLIFF AHEAD — LOOP RESTARTS
          </span>
        </Html>
      </group>

      {/* crumbled cliff edge */}
      {rubble.map((r) => (
        <mesh key={r.key} position={r.pos} rotation={[seeded(r.key) * 0.8, seeded(r.key + 3) * 2, 0]}>
          <boxGeometry args={[r.size, r.size, r.size]} />
          <meshStandardMaterial color="#1d2650" />
        </mesh>
      ))}
    </group>
  )
}

/** The mini city inside the loop: voxel towers, a beacon landmark, an inner
 * ring street with cars and a van circling it. */
function MiniCity({ mobile }) {
  const buildings = useMemo(() => {
    const list = []
    const count = mobile ? 9 : 15
    for (let i = 0; i < count; i++) {
      const ang = seeded(i * 7 + 1) * TAU
      const rad = i % 3 === 0 ? 3 + seeded(i + 20) * 3 : 10.5 + seeded(i + 30) * 3.5
      const h = 1.6 + seeded(i + 40) * 4.6
      list.push({
        key: i,
        pos: [LOOP_CENTER.x + Math.sin(ang) * rad, h / 2, LOOP_CENTER.z + Math.cos(ang) * rad],
        w: 1.1 + seeded(i + 50) * 1.4,
        h,
        color: ['#141b3c', '#1d2650', '#232e63'][i % 3],
        glow: ['#39ff88', '#ffd93d', '#a06bff', '#ff8a3d'][i % 4],
      })
    }
    return list
  }, [mobile])

  const cars = useMemo(
    () => [
      { key: 0, radius: 8, speed: 0.055, offset: 0, color: '#ff5d5d', len: 0.9 },
      { key: 1, radius: 8, speed: 0.055, offset: 0.45, color: '#ffd93d', len: 0.9 },
      { key: 2, radius: 8, speed: 0.04, offset: 0.75, color: '#39ff88', len: 1.5 }, // the van
    ],
    []
  )
  const carRefs = useRef([])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    carRefs.current.forEach((c, i) => {
      if (!c) return
      const cfg = cars[i]
      const a = (time * cfg.speed + cfg.offset) * TAU
      c.position.set(
        LOOP_CENTER.x + Math.sin(a) * cfg.radius,
        0.25,
        LOOP_CENTER.z + Math.cos(a) * cfg.radius
      )
      c.rotation.y = Math.atan2(Math.cos(a), -Math.sin(a))
    })
  })

  return (
    <group>
      {/* inner street */}
      <mesh position={[LOOP_CENTER.x, 0.005, LOOP_CENTER.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[7.2, 8.8, 64]} />
        <meshStandardMaterial color="#181f45" side={2} />
      </mesh>

      {buildings.map((b) => (
        <group key={b.key} position={b.pos}>
          <mesh castShadow>
            <boxGeometry args={[b.w, b.h, b.w]} />
            <meshStandardMaterial color={b.color} />
          </mesh>
          {/* lit window strips */}
          <mesh position={[0, b.h * 0.1, b.w / 2 + 0.01]}>
            <boxGeometry args={[b.w * 0.55, b.h * 0.6, 0.02]} />
            <meshStandardMaterial color={b.glow} emissive={b.glow} emissiveIntensity={0.5} transparent opacity={0.85} />
          </mesh>
          {/* rooftop light */}
          <mesh position={[0, b.h / 2 + 0.08, 0]}>
            <boxGeometry args={[0.14, 0.16, 0.14]} />
            <meshStandardMaterial color={b.glow} emissive={b.glow} emissiveIntensity={1} />
          </mesh>
        </group>
      ))}

      {/* central beacon tower */}
      <group position={[LOOP_CENTER.x, 0, LOOP_CENTER.z]}>
        <mesh position={[0, 3.4, 0]} castShadow>
          <boxGeometry args={[1.6, 6.8, 1.6]} />
          <meshStandardMaterial color="#1d2650" />
        </mesh>
        <mesh position={[0, 7, 0]}>
          <octahedronGeometry args={[0.55, 0]} />
          <meshStandardMaterial color="#39ff88" emissive="#39ff88" emissiveIntensity={0.9} />
        </mesh>
      </group>

      {/* traffic */}
      {cars.map((cfg, i) => (
        <group key={cfg.key} ref={(el) => (carRefs.current[i] = el)}>
          <mesh castShadow>
            <boxGeometry args={[0.55, 0.3, cfg.len]} />
            <meshStandardMaterial color={cfg.color} />
          </mesh>
          <mesh position={[0, 0.25, -cfg.len * 0.08]}>
            <boxGeometry args={[0.45, 0.22, cfg.len * 0.55]} />
            <meshStandardMaterial color="#181c33" />
          </mesh>
          <mesh position={[0, 0.02, cfg.len / 2 + 0.01]}>
            <boxGeometry args={[0.4, 0.08, 0.02]} />
            <meshStandardMaterial color="#fffbe6" emissive="#fffbe6" emissiveIntensity={1} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Gardens: voxel trees + flowers around the outside of the loop, and birds
 * circling over the city. */
function Nature({ mobile }) {
  const trees = useMemo(() => {
    const list = []
    const count = mobile ? 6 : 11
    for (let i = 0; i < count; i++) {
      const ang = seeded(i * 13 + 2) * TAU
      const rad = LOOP_RADIUS + 3.5 + seeded(i + 60) * 5
      list.push({
        key: i,
        pos: [LOOP_CENTER.x + Math.sin(ang) * rad, 0, LOOP_CENTER.z + Math.cos(ang) * rad],
        h: 1 + seeded(i + 70) * 0.9,
        leaf: i % 4 === 0 ? '#ff8fb0' : '#2fae62', // one in four blossoms pink
      })
    }
    return list
  }, [mobile])

  const flowers = useMemo(() => {
    const list = []
    const count = mobile ? 12 : 26
    for (let i = 0; i < count; i++) {
      const ang = seeded(i * 17 + 3) * TAU
      const inside = i % 3 === 0
      const rad = inside ? 14.5 + seeded(i + 80) * 4 : LOOP_RADIUS + 2.4 + seeded(i + 80) * 4.5
      list.push({
        key: i,
        pos: [LOOP_CENTER.x + Math.sin(ang) * rad, 0, LOOP_CENTER.z + Math.cos(ang) * rad],
        color: ['#ffd93d', '#ff8a3d', '#ff8fb0', '#a06bff', '#e6e9ff'][i % 5],
        s: 0.12 + seeded(i + 90) * 0.1,
      })
    }
    return list
  }, [mobile])

  const birds = useMemo(
    () =>
      [...Array(mobile ? 2 : 4)].map((_, i) => ({
        key: i,
        radius: 6 + seeded(i + 11) * 9,
        height: 7 + seeded(i + 12) * 3.5,
        speed: 0.06 + seeded(i + 13) * 0.05,
        offset: seeded(i + 14),
        dir: i % 2 === 0 ? 1 : -1,
      })),
    [mobile]
  )
  const birdRefs = useRef([])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    birdRefs.current.forEach((b, i) => {
      if (!b) return
      const cfg = birds[i]
      const a = (time * cfg.speed * cfg.dir + cfg.offset) * TAU
      b.position.set(
        LOOP_CENTER.x + Math.sin(a) * cfg.radius,
        cfg.height + Math.sin(time * 2 + i) * 0.4,
        LOOP_CENTER.z + Math.cos(a) * cfg.radius
      )
      b.rotation.y = Math.atan2(Math.cos(a), -Math.sin(a)) * cfg.dir
      const flap = Math.sin(time * 9 + i * 2) * 0.7
      b.children[1].rotation.z = flap
      b.children[2].rotation.z = -flap
    })
  })

  return (
    <group>
      {trees.map((tr) => (
        <group key={tr.key} position={tr.pos}>
          <mesh position={[0, tr.h / 2, 0]} castShadow>
            <boxGeometry args={[0.22, tr.h, 0.22]} />
            <meshStandardMaterial color="#6b4f2a" />
          </mesh>
          <mesh position={[0, tr.h + 0.45, 0]} castShadow>
            <boxGeometry args={[1.0, 0.9, 1.0]} />
            <meshStandardMaterial color={tr.leaf} />
          </mesh>
          <mesh position={[0.25, tr.h + 1.0, 0.15]}>
            <boxGeometry args={[0.55, 0.45, 0.55]} />
            <meshStandardMaterial color={tr.leaf} />
          </mesh>
        </group>
      ))}

      {flowers.map((f) => (
        <group key={f.key} position={f.pos}>
          <mesh position={[0, 0.14, 0]}>
            <boxGeometry args={[0.04, 0.28, 0.04]} />
            <meshStandardMaterial color="#2fae62" />
          </mesh>
          <mesh position={[0, 0.32, 0]}>
            <boxGeometry args={[f.s, f.s, f.s]} />
            <meshStandardMaterial color={f.color} emissive={f.color} emissiveIntensity={0.25} />
          </mesh>
        </group>
      ))}

      {birds.map((cfg, i) => (
        <group key={cfg.key} ref={(el) => (birdRefs.current[i] = el)}>
          <mesh>
            <boxGeometry args={[0.16, 0.12, 0.34]} />
            <meshStandardMaterial color="#e6e9ff" />
          </mesh>
          <mesh position={[-0.2, 0.05, 0]}>
            <boxGeometry args={[0.36, 0.02, 0.18]} />
            <meshStandardMaterial color="#c0c6e8" />
          </mesh>
          <mesh position={[0.2, 0.05, 0]}>
            <boxGeometry args={[0.36, 0.02, 0.18]} />
            <meshStandardMaterial color="#c0c6e8" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Sky: drifting clouds + floating neon cubes above the city. */
function SkyLife({ mobile }) {
  const floatGroup = useRef()
  const cloudGroup = useRef()

  const floaters = useMemo(() => {
    const cubes = []
    const count = mobile ? 8 : 16
    for (let i = 0; i < count; i++) {
      const ang = seeded(i + 500) * TAU
      const rad = seeded(i + 550) * (LOOP_RADIUS + 8)
      cubes.push({
        key: i,
        pos: [LOOP_CENTER.x + Math.sin(ang) * rad, 3 + seeded(i + 600) * 6, LOOP_CENTER.z + Math.cos(ang) * rad],
        size: 0.25 + seeded(i + 800) * 0.5,
        color: ['#39ff88', '#a06bff', '#ffd93d', '#ff8a3d'][i % 4],
        speed: 0.4 + seeded(i + 900) * 0.9,
      })
    }
    return cubes
  }, [mobile])

  const clouds = useMemo(() => {
    const list = []
    const count = mobile ? 4 : 7
    for (let i = 0; i < count; i++) {
      list.push({
        key: i,
        pos: [0, 9 + seeded(i + 41) * 4, LOOP_CENTER.z + (seeded(i + 42) - 0.5) * 40],
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
      c.position.x = ((cl.pos[0] + t * cl.speed + 26) % 52) - 26
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
      ref.current.visible = true
      ref.current.position.set(-20 + p * 40, 13 - p * 4, LOOP_CENTER.z - 14)
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

/** Spinning XP coins hovering over the road — walk through to collect. */
function Coins({ tRef, mobile }) {
  const group = useRef()
  const coins = useMemo(() => {
    const list = []
    const step = mobile ? 0.05 : 0.033
    for (let t = 0.03; t < CLIFF_T - 0.01; t += step) {
      if (t > GAP_START - 0.02 && t < GAP_END + 0.01) continue
      const p = pathPoint(t)
      const off = (seeded(Math.round(t * 1000)) - 0.5) * 1.6
      list.push({ t, pos: [p.x + p.nx * off, 1.1, p.z + p.nz * off] })
    }
    return list
  }, [mobile])
  const collected = useRef(new Set())

  useFrame((state) => {
    if (!group.current) return
    const time = state.clock.elapsedTime
    const heroT = tRef.current
    group.current.children.forEach((c, i) => {
      if (collected.current.has(i)) return
      c.rotation.y = time * 3
      c.position.y = 1.1 + Math.sin(time * 2 + i) * 0.1
      if (Math.abs(coins[i].t - heroT) < 0.005) {
        collected.current.add(i)
        c.visible = false
        sfx.coin()
        gainXp(2, { silent: true })
      }
    })
    // fresh coins every lap
    if (heroT < 0.015 && collected.current.size > 10) {
      collected.current.clear()
      group.current.children.forEach((c) => (c.visible = true))
    }
  })

  return (
    <group ref={group}>
      {coins.map((c, i) => (
        <mesh key={i} position={c.pos}>
          <cylinderGeometry args={[0.16, 0.16, 0.05, 12]} />
          <meshStandardMaterial color="#ffd93d" emissive="#ffd93d" emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

/** Click anywhere on the ground → neon ripple + tick. */
function ClickPing() {
  const ring = useRef()
  const ping = useRef({ t0: -1, x: 0, z: 0 })

  useFrame((state) => {
    if (!ring.current) return
    if (ping.current.t0 === -2) ping.current.t0 = state.clock.elapsedTime
    const { t0, x, z } = ping.current
    if (t0 < 0) {
      ring.current.visible = false
      return
    }
    const p = (state.clock.elapsedTime - t0) / 0.55
    if (p >= 1) {
      ping.current.t0 = -1
      ring.current.visible = false
      return
    }
    ring.current.visible = true
    ring.current.position.set(x, 0.06, z)
    const s = 0.3 + p * 2.2
    ring.current.scale.set(s, s, s)
    ring.current.material.opacity = 0.8 * (1 - p)
  })

  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[LOOP_CENTER.x, -0.05, LOOP_CENTER.z]}
        onPointerDown={(e) => {
          ping.current = { t0: -2, x: e.point.x, z: e.point.z }
          sfx.hover()
        }}
      >
        <planeGeometry args={[72, 72]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.34, 0.44, 24]} />
        <meshBasicMaterial color="#39ff88" transparent opacity={0} depthWrite={false} side={2} />
      </mesh>
    </>
  )
}

/** Chimes when passing checkpoints; resets each lap. */
function CheckpointChimes({ tRef }) {
  const passed = useRef(new Set())
  useFrame(() => {
    const t = tRef.current
    if (t < 0.02 && passed.current.size > 0) passed.current.clear()
    for (const s of SECTIONS) {
      if (!passed.current.has(s.id) && t >= s.at && t < s.at + 0.05) {
        passed.current.add(s.id)
        sfx.ding()
      }
    }
  })
  return null
}

/** The cliff → fall → respawn-at-start loop (Soyed's sketch, panel 2). */
function RespawnController({ tRef }) {
  const falling = useRef(false)
  useFrame(() => {
    const t = tRef.current
    if (!falling.current && t > CLIFF_T + 0.003) {
      falling.current = true
      sfx.error()
      setTimeout(() => {
        useUiStore.getState().pushToast({
          icon: '🌀',
          title: 'LOOP COMPLETE!',
          desc: 'The road is a circle — respawning at Round 1. +25 XP lap bonus.',
        })
        gainXp(25, { silent: true })
        window.scrollTo({ top: 0, behavior: 'instant' })
      }, 1400)
    }
    if (falling.current && t < 0.5) falling.current = false
  })
  return null
}

/** Camera: follows behind the hero around the loop, swaying gently, FOV
 * widening with speed. */
function Rig({ progressRef, tRef, speedRef }) {
  const { camera } = useThree()
  const smoothed = useRef(0)
  const fov = useRef(50)

  useFrame((state, delta) => {
    const target = progressRef.current
    const prev = smoothed.current
    const k = 1 - Math.exp(-delta * 5)
    smoothed.current = prev + (target - prev) * k
    speedRef.current = (smoothed.current - prev) * PATH_LENGTH * 0.6
    tRef.current = smoothed.current

    const hero = pathPoint(smoothed.current)
    const cam = pathPoint(Math.max(0, smoothed.current - 0.042))
    const time = state.clock.elapsedTime

    camera.position.set(
      cam.x + cam.nx * 2.6 + Math.sin(time * 0.32) * 0.3,
      3.9 + Math.sin(time * 0.45) * 0.2,
      cam.z + cam.nz * 2.6
    )
    camera.lookAt(hero.x, 1.3, hero.z)

    const targetFov = 50 + Math.min(1, Math.abs(speedRef.current) * 3) * 9
    fov.current += (targetFov - fov.current) * (1 - Math.exp(-delta * 4))
    if (Math.abs(camera.fov - fov.current) > 0.05) {
      camera.fov = fov.current
      camera.updateProjectionMatrix()
    }
  })
  return null
}

/**
 * The 3D mini-city world. A circular loop road: Round 1 (portfolio) → gap
 * jump → Round 2 (playground) → garden stretch → cliff → respawn. Rendered
 * fixed behind the scroll container; native scroll walks the hero.
 */
export default function World({ progressRef, visitedIds, onOpenSection }) {
  const tRef = useRef(0) // smoothed loop progress shared with hero/bugsy/coins
  const speedRef = useRef(0)
  const mobile = typeof window !== 'undefined' && window.innerWidth < 640

  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={[1, mobile ? 1.5 : 1.75]}
        camera={{ fov: 50, near: 0.1, far: 110, position: [0, 3.9, 8] }}
        shadows={!mobile}
        gl={{ antialias: !mobile, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#0b1026']} />
        <fog attach="fog" args={['#0b1026', 16, mobile ? 44 : 60]} />

        <ambientLight intensity={0.55} />
        <directionalLight
          position={[8, 14, 6]}
          intensity={1.1}
          castShadow={!mobile}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[LOOP_CENTER.x, 8, LOOP_CENTER.z]} intensity={18} color="#a06bff" />

        <Stars radius={80} depth={40} count={mobile ? 1100 : 2600} factor={3.2} saturation={0.4} fade speed={0.9} />
        <Sparkles count={mobile ? 40 : 100} scale={[52, 10, 52]} position={[LOOP_CENTER.x, 4, LOOP_CENTER.z]} size={2.2} speed={0.35} color="#39ff88" />
        <Sparkles count={mobile ? 25 : 60} scale={[46, 12, 46]} position={[LOOP_CENTER.x, 6, LOOP_CENTER.z]} size={2.6} speed={0.25} color="#a06bff" />

        <gridHelper
          args={[64, 48, '#3a4fa0', '#1d2650']}
          position={[LOOP_CENTER.x, -0.02, LOOP_CENTER.z]}
        />

        <RingRoad />
        <MiniCity mobile={mobile} />
        <Nature mobile={mobile} />
        <SkyLife mobile={mobile} />
        <ShootingStar />
        <Coins tRef={tRef} mobile={mobile} />
        <ClickPing />
        <CheckpointChimes tRef={tRef} />
        <RespawnController tRef={tRef} />

        <Hero speedRef={speedRef} tRef={tRef} />
        <BugsyNpc tRef={tRef} />
        <Checkpoints visitedIds={visitedIds} onOpen={onOpenSection} />
        <Signposts onOpen={onOpenSection} />
        <RoundGates />

        <Rig progressRef={progressRef} tRef={tRef} speedRef={speedRef} />
      </Canvas>
    </div>
  )
}
