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

// the river occupies this slice of the garden stretch, outside the loop
const RIVER_T1 = 0.56
const RIVER_T2 = 0.84
const RIVER_INNER = LOOP_RADIUS + 5
const RIVER_OUTER = LOOP_RADIUS + 8.5

const SKIN_TONES = ['#e8b17e', '#c68642', '#8d5524', '#f1c27d']
const SHIRTS = ['#ff5d5d', '#39ff88', '#ffd93d', '#a06bff', '#4db3ff', '#ff8fb0']

/** Flat arc between progress t1..t2 (one draw call).
 * Mapping: mesh rotated x:-π/2 puts ring angle φ at world (cos φ, −sin φ)
 * relative to center; pathPoint(t) is (sin a, cos a), a = 2πt → φ = a − π/2. */
function RingArc({ t1, t2, inner, outer, y = 0, color = '#2a356e', emissive, emissiveIntensity = 0.3, opacity = 1, segments = 96 }) {
  const thetaStart = TAU * t1 - Math.PI / 2
  const thetaLength = TAU * (t2 - t1)
  return (
    <mesh position={[LOOP_CENTER.x, y, LOOP_CENTER.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <ringGeometry args={[inner, outer, segments, 1, thetaStart, thetaLength]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive ?? '#000000'}
        emissiveIntensity={emissive ? emissiveIntensity : 0}
        transparent={opacity < 1}
        opacity={opacity}
        side={2}
      />
    </mesh>
  )
}

/** Position on a circle of `radius` at angular progress u (0..1). */
function circlePoint(u, radius) {
  const a = u * TAU
  return {
    x: LOOP_CENTER.x + Math.sin(a) * radius,
    z: LOOP_CENTER.z + Math.cos(a) * radius,
    yaw: Math.atan2(Math.cos(a), -Math.sin(a)),
  }
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
      <RingArc t1={0} t2={GAP_START} inner={LOOP_RADIUS - 1.8} outer={LOOP_RADIUS + 1.8} />
      <RingArc t1={GAP_END} t2={CLIFF_T} inner={LOOP_RADIUS - 1.8} outer={LOOP_RADIUS + 1.8} />
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

      {rubble.map((r) => (
        <mesh key={r.key} position={r.pos} rotation={[seeded(r.key) * 0.8, seeded(r.key + 3) * 2, 0]}>
          <boxGeometry args={[r.size, r.size, r.size]} />
          <meshStandardMaterial color="#1d2650" />
        </mesh>
      ))}
    </group>
  )
}

/** The mini city inside the loop: voxel towers, a beacon, an inner street
 * with cars and a van circling it. */
function MiniCity({ mobile }) {
  const buildings = useMemo(() => {
    const list = []
    const count = mobile ? 12 : 20
    for (let i = 0; i < count; i++) {
      const ang = seeded(i * 7 + 1) * TAU
      const rad = i % 3 === 0 ? 3.5 + seeded(i + 20) * 4.5 : 13 + seeded(i + 30) * 4.5
      const h = 1.6 + seeded(i + 40) * 5.2
      list.push({
        key: i,
        pos: [LOOP_CENTER.x + Math.sin(ang) * rad, h / 2, LOOP_CENTER.z + Math.cos(ang) * rad],
        w: 1.1 + seeded(i + 50) * 1.5,
        h,
        color: ['#141b3c', '#1d2650', '#232e63'][i % 3],
        glow: ['#39ff88', '#ffd93d', '#a06bff', '#ff8a3d'][i % 4],
      })
    }
    return list
  }, [mobile])

  const cars = useMemo(
    () => [
      { key: 0, radius: 11, speed: 0.05, offset: 0, color: '#ff5d5d', len: 0.9 },
      { key: 1, radius: 11, speed: 0.05, offset: 0.32, color: '#ffd93d', len: 0.9 },
      { key: 2, radius: 11, speed: 0.038, offset: 0.6, color: '#4db3ff', len: 0.9 },
      { key: 3, radius: 11, speed: 0.032, offset: 0.85, color: '#39ff88', len: 1.6 }, // the van
    ],
    []
  )
  const carRefs = useRef([])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    carRefs.current.forEach((c, i) => {
      if (!c) return
      const cfg = cars[i]
      const p = circlePoint(time * cfg.speed + cfg.offset, cfg.radius)
      c.position.set(p.x, 0.25, p.z)
      c.rotation.y = p.yaw
    })
  })

  return (
    <group>
      {/* inner street */}
      <mesh position={[LOOP_CENTER.x, 0.005, LOOP_CENTER.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[10.1, 11.9, 64]} />
        <meshStandardMaterial color="#181f45" side={2} />
      </mesh>

      {buildings.map((b) => (
        <group key={b.key} position={b.pos}>
          <mesh castShadow>
            <boxGeometry args={[b.w, b.h, b.w]} />
            <meshStandardMaterial color={b.color} />
          </mesh>
          <mesh position={[0, b.h * 0.1, b.w / 2 + 0.01]}>
            <boxGeometry args={[b.w * 0.55, b.h * 0.6, 0.02]} />
            <meshStandardMaterial color={b.glow} emissive={b.glow} emissiveIntensity={0.5} transparent opacity={0.85} />
          </mesh>
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

/** Cozy voxel homes outside the loop, each with its own little garden. */
function Homes({ mobile }) {
  const homes = useMemo(() => {
    const list = []
    const count = mobile ? 4 : 7
    for (let i = 0; i < count; i++) {
      // keep homes on the non-river half of the outside
      const u = 0.88 + (i / count) * 0.62 // wraps through the start area
      const p = circlePoint(u % 1, LOOP_RADIUS + 4.5 + seeded(i + 22) * 4)
      list.push({
        key: i,
        pos: [p.x, 0, p.z],
        yaw: p.yaw + Math.PI / 2 + (seeded(i + 23) - 0.5) * 0.6,
        wall: ['#3a2f5f', '#2f3f6e', '#4a3358'][i % 3],
        roof: ['#ff5d5d', '#ff8a3d', '#a06bff'][i % 3],
      })
    }
    return list
  }, [mobile])

  return (
    <group>
      {homes.map((h) => (
        <group key={h.key} position={h.pos} rotation={[0, h.yaw, 0]}>
          {/* house */}
          <mesh position={[0, 0.55, 0]} castShadow>
            <boxGeometry args={[1.7, 1.1, 1.5]} />
            <meshStandardMaterial color={h.wall} />
          </mesh>
          {/* pyramid roof */}
          <mesh position={[0, 1.45, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[1.35, 0.75, 4]} />
            <meshStandardMaterial color={h.roof} />
          </mesh>
          {/* door + warm window */}
          <mesh position={[0.35, 0.4, 0.76]}>
            <boxGeometry args={[0.34, 0.7, 0.03]} />
            <meshStandardMaterial color="#6b4f2a" />
          </mesh>
          <mesh position={[-0.4, 0.65, 0.76]}>
            <boxGeometry args={[0.4, 0.36, 0.03]} />
            <meshStandardMaterial color="#ffd93d" emissive="#ffd93d" emissiveIntensity={0.7} />
          </mesh>
          {/* chimney */}
          <mesh position={[0.5, 1.6, -0.3]}>
            <boxGeometry args={[0.2, 0.5, 0.2]} />
            <meshStandardMaterial color="#1d2650" />
          </mesh>
          {/* home garden plot with flowers */}
          <group position={[1.6, 0, 0.2]}>
            <mesh position={[0, 0.03, 0]}>
              <boxGeometry args={[1.5, 0.06, 1.1]} />
              <meshStandardMaterial color="#1e5c38" />
            </mesh>
            {[0, 1, 2, 3].map((f) => (
              <group key={f} position={[-0.45 + (f % 2) * 0.9, 0, -0.25 + Math.floor(f / 2) * 0.5]}>
                <mesh position={[0, 0.15, 0]}>
                  <boxGeometry args={[0.04, 0.24, 0.04]} />
                  <meshStandardMaterial color="#2fae62" />
                </mesh>
                <mesh position={[0, 0.3, 0]}>
                  <boxGeometry args={[0.14, 0.14, 0.14]} />
                  <meshStandardMaterial
                    color={['#ffd93d', '#ff8fb0', '#e6e9ff', '#ff8a3d'][(h.key + f) % 4]}
                    emissive={['#ffd93d', '#ff8fb0', '#e6e9ff', '#ff8a3d'][(h.key + f) % 4]}
                    emissiveIntensity={0.3}
                  />
                </mesh>
              </group>
            ))}
          </group>
        </group>
      ))}
    </group>
  )
}

/** Tiny voxel citizens: strolling the sidewalk, wandering the city, and one
 * greeter waving beside the starting line. */
function People({ mobile }) {
  const walkers = useMemo(() => {
    const list = []
    const count = mobile ? 3 : 6
    for (let i = 0; i < count; i++) {
      const sidewalk = i % 2 === 0
      list.push({
        key: i,
        radius: sidewalk ? LOOP_RADIUS + 2.6 : 7.5 + seeded(i + 31) * 1.5,
        speed: (0.006 + seeded(i + 32) * 0.006) * (i % 3 === 0 ? -1 : 1),
        offset: seeded(i + 33),
        shirt: SHIRTS[i % SHIRTS.length],
        skin: SKIN_TONES[i % SKIN_TONES.length],
      })
    }
    return list
  }, [mobile])
  const refs = useRef([])
  const greeter = useRef()
  const greetP = useMemo(() => {
    const p = pathPoint(0.015)
    return p
  }, [])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    refs.current.forEach((g, i) => {
      if (!g) return
      const cfg = walkers[i]
      const p = circlePoint(time * cfg.speed + cfg.offset, cfg.radius)
      g.position.set(p.x, 0, p.z)
      g.rotation.y = cfg.speed >= 0 ? p.yaw : p.yaw + Math.PI
      // little leg swings
      const swing = Math.sin(time * 6 + i) * 0.4
      g.children[0].rotation.x = swing
      g.children[1].rotation.x = -swing
    })
    if (greeter.current) {
      // the greeter waves at the hero forever
      greeter.current.children[3].rotation.z = 2.4 + Math.sin(time * 5) * 0.35
    }
  })

  function Person({ shirt, skin, refFn, position, rotation }) {
    return (
      <group ref={refFn} position={position} rotation={rotation}>
        <group position={[-0.09, 0.34, 0]}>
          <mesh position={[0, -0.17, 0]}>
            <boxGeometry args={[0.13, 0.34, 0.15]} />
            <meshStandardMaterial color="#22306e" />
          </mesh>
        </group>
        <group position={[0.09, 0.34, 0]}>
          <mesh position={[0, -0.17, 0]}>
            <boxGeometry args={[0.13, 0.34, 0.15]} />
            <meshStandardMaterial color="#22306e" />
          </mesh>
        </group>
        <mesh position={[0, 0.62, 0]} castShadow>
          <boxGeometry args={[0.42, 0.5, 0.26]} />
          <meshStandardMaterial color={shirt} />
        </mesh>
        {/* right arm (the greeter waves with this) */}
        <mesh position={[0.28, 0.72, 0]}>
          <boxGeometry args={[0.11, 0.4, 0.13]} />
          <meshStandardMaterial color={shirt} />
        </mesh>
        <mesh position={[0, 1.05, 0]} castShadow>
          <boxGeometry args={[0.32, 0.32, 0.3]} />
          <meshStandardMaterial color={skin} />
        </mesh>
      </group>
    )
  }

  return (
    <group>
      {walkers.map((w, i) => (
        <Person key={w.key} shirt={w.shirt} skin={w.skin} refFn={(el) => (refs.current[i] = el)} />
      ))}
      {/* the greeter by the starting line */}
      <group
        ref={greeter}
        position={[greetP.x - greetP.nx * 2.6, 0, greetP.z - greetP.nz * 2.6]}
        rotation={[0, Math.atan2(-greetP.nx, -greetP.nz) + Math.PI, 0]}
      >
        <group position={[-0.09, 0.34, 0]}>
          <mesh position={[0, -0.17, 0]}>
            <boxGeometry args={[0.13, 0.34, 0.15]} />
            <meshStandardMaterial color="#22306e" />
          </mesh>
        </group>
        <group position={[0.09, 0.34, 0]}>
          <mesh position={[0, -0.17, 0]}>
            <boxGeometry args={[0.13, 0.34, 0.15]} />
            <meshStandardMaterial color="#22306e" />
          </mesh>
        </group>
        <mesh position={[0, 0.62, 0]} castShadow>
          <boxGeometry args={[0.42, 0.5, 0.26]} />
          <meshStandardMaterial color="#ffd93d" />
        </mesh>
        <mesh position={[0.3, 0.85, 0]} rotation={[0, 0, 2.4]}>
          <boxGeometry args={[0.11, 0.42, 0.13]} />
          <meshStandardMaterial color="#ffd93d" />
        </mesh>
        <mesh position={[0, 1.05, 0]} castShadow>
          <boxGeometry args={[0.32, 0.32, 0.3]} />
          <meshStandardMaterial color="#e8b17e" />
        </mesh>
        <Html center position={[0, 1.6, 0]} style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
          <span className="whitespace-nowrap font-pixel text-[7px] text-ink-dim">hi! 👋</span>
        </Html>
      </group>
    </group>
  )
}

/** The river: a glinting arc of water outside the garden stretch, with a
 * wooden footbridge and reeds. */
function River() {
  const water = useRef()
  useFrame((state) => {
    if (water.current) {
      water.current.material.emissiveIntensity = 0.25 + Math.sin(state.clock.elapsedTime * 1.4) * 0.1
    }
  })
  const bridge = circlePoint(0.7, (RIVER_INNER + RIVER_OUTER) / 2)
  const reeds = useMemo(
    () =>
      [...Array(8)].map((_, i) => {
        const u = RIVER_T1 + 0.02 + seeded(i + 77) * (RIVER_T2 - RIVER_T1 - 0.04)
        const edge = i % 2 === 0 ? RIVER_INNER - 0.4 : RIVER_OUTER + 0.4
        const p = circlePoint(u, edge)
        return { key: i, pos: [p.x, 0, p.z], h: 0.5 + seeded(i + 78) * 0.4 }
      }),
    []
  )
  return (
    <group>
      {/* banks then water */}
      <RingArc t1={RIVER_T1 - 0.015} t2={RIVER_T2 + 0.015} inner={RIVER_INNER - 0.8} outer={RIVER_OUTER + 0.8} y={-0.04} color="#1a2a4f" />
      <mesh ref={water} position={[LOOP_CENTER.x, -0.02, LOOP_CENTER.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[RIVER_INNER, RIVER_OUTER, 96, 1, TAU * RIVER_T1 - Math.PI / 2, TAU * (RIVER_T2 - RIVER_T1)]} />
        <meshStandardMaterial color="#1d4e89" emissive="#4db3ff" emissiveIntensity={0.3} transparent opacity={0.9} side={2} />
      </mesh>
      {/* sparkle on the water */}
      <Sparkles
        count={30}
        scale={[10, 0.6, 10]}
        position={[bridge.x, 0.3, bridge.z]}
        size={1.6}
        speed={0.2}
        color="#bfe3ff"
      />
      {/* wooden footbridge across the river */}
      <group position={[bridge.x, 0, bridge.z]} rotation={[0, bridge.yaw + Math.PI / 2, 0]}>
        <mesh position={[0, 0.32, 0]}>
          <boxGeometry args={[1.2, 0.1, RIVER_OUTER - RIVER_INNER + 1.6]} />
          <meshStandardMaterial color="#8a6a3b" />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.55, 0.55, 0]}>
            <boxGeometry args={[0.06, 0.35, RIVER_OUTER - RIVER_INNER + 1.6]} />
            <meshStandardMaterial color="#6b4f2a" />
          </mesh>
        ))}
      </group>
      {reeds.map((r) => (
        <mesh key={r.key} position={[r.pos[0], r.h / 2, r.pos[2]]}>
          <boxGeometry args={[0.06, r.h, 0.06]} />
          <meshStandardMaterial color="#2fae62" />
        </mesh>
      ))}
    </group>
  )
}

/** Gardens: voxel trees + many flowers, and birds circling over the city. */
function Nature({ mobile }) {
  const trees = useMemo(() => {
    const list = []
    const count = mobile ? 8 : 16
    for (let i = 0; i < count; i++) {
      const ang = seeded(i * 13 + 2) * TAU
      const u = ang / TAU
      // keep trees off the river
      const inRiver = u > RIVER_T1 - 0.03 && u < RIVER_T2 + 0.03
      const rad = inRiver ? LOOP_RADIUS + 10.5 + seeded(i + 61) * 3 : LOOP_RADIUS + 3.5 + seeded(i + 60) * 6
      list.push({
        key: i,
        pos: [LOOP_CENTER.x + Math.sin(ang) * rad, 0, LOOP_CENTER.z + Math.cos(ang) * rad],
        h: 1 + seeded(i + 70) * 0.9,
        leaf: i % 4 === 0 ? '#ff8fb0' : '#2fae62',
      })
    }
    return list
  }, [mobile])

  const flowers = useMemo(() => {
    const list = []
    const count = mobile ? 26 : 60
    for (let i = 0; i < count; i++) {
      const ang = seeded(i * 17 + 3) * TAU
      const u = ang / TAU
      const inside = i % 3 === 0
      let rad
      if (inside) {
        rad = 17 + seeded(i + 80) * 6 // between outer buildings and the road
      } else {
        const inRiver = u > RIVER_T1 - 0.02 && u < RIVER_T2 + 0.02
        rad = inRiver ? LOOP_RADIUS + 2.2 + seeded(i + 80) * 2.2 : LOOP_RADIUS + 2.4 + seeded(i + 80) * 6.5
      }
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
      [...Array(mobile ? 3 : 7)].map((_, i) => ({
        key: i,
        radius: 6 + seeded(i + 11) * 14,
        height: 6.5 + seeded(i + 12) * 4.5,
        speed: 0.05 + seeded(i + 13) * 0.05,
        offset: seeded(i + 14),
        dir: i % 2 === 0 ? 1 : -1,
        color: i % 3 === 0 ? '#ffd93d' : '#e6e9ff',
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
            <meshStandardMaterial color={cfg.color} />
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
        pos: [0, 10 + seeded(i + 41) * 4, LOOP_CENTER.z + (seeded(i + 42) - 0.5) * 48],
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
      c.position.x = ((cl.pos[0] + t * cl.speed + 30) % 60) - 30
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
      ref.current.position.set(-24 + p * 48, 14 - p * 4, LOOP_CENTER.z - 16)
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
        <planeGeometry args={[86, 86]} />
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

/** The cliff → fall → respawn-at-start loop. */
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

/** Camera: follows behind the hero around the loop, FOV widening with speed. */
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
    const cam = pathPoint(Math.max(0, smoothed.current - 0.038))
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
 * The 3D mini-city world: a circular loop road through gardens, homes and a
 * river — Round 1 (portfolio) → gap jump → Round 2 (playground) → cliff →
 * respawn. Rendered fixed behind the scroll container.
 */
export default function World({ progressRef, visitedIds, onOpenSection }) {
  const tRef = useRef(0)
  const speedRef = useRef(0)
  const mobile = typeof window !== 'undefined' && window.innerWidth < 640

  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={[1, mobile ? 1.5 : 1.75]}
        camera={{ fov: 50, near: 0.1, far: 130, position: [0, 3.9, 8] }}
        shadows={!mobile}
        gl={{ antialias: !mobile, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#0b1026']} />
        <fog attach="fog" args={['#0b1026', 18, mobile ? 50 : 70]} />

        <ambientLight intensity={0.55} />
        <directionalLight
          position={[10, 16, 8]}
          intensity={1.1}
          castShadow={!mobile}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[LOOP_CENTER.x, 9, LOOP_CENTER.z]} intensity={22} color="#a06bff" />

        <Stars radius={90} depth={45} count={mobile ? 1100 : 2600} factor={3.2} saturation={0.4} fade speed={0.9} />
        <Sparkles count={mobile ? 40 : 100} scale={[62, 10, 62]} position={[LOOP_CENTER.x, 4, LOOP_CENTER.z]} size={2.2} speed={0.35} color="#39ff88" />
        <Sparkles count={mobile ? 25 : 60} scale={[56, 12, 56]} position={[LOOP_CENTER.x, 6, LOOP_CENTER.z]} size={2.6} speed={0.25} color="#a06bff" />

        <gridHelper
          args={[80, 56, '#3a4fa0', '#1d2650']}
          position={[LOOP_CENTER.x, -0.06, LOOP_CENTER.z]}
        />

        <RingRoad />
        <MiniCity mobile={mobile} />
        <Homes mobile={mobile} />
        <People mobile={mobile} />
        <River />
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
