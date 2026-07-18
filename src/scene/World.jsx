import { useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars, Sparkles, Html } from '@react-three/drei'
import * as THREE from 'three'
import Hero from './Hero'
import BugsyNpc from './BugsyNpc'
import Cat from './Cat'
import Checkpoints from './Checkpoints'
import Signposts from './Signposts'
import RoundGates from './RoundGates'
import { LOOP_CENTER, LOOP_RADIUS, PATH_LENGTH, GAP_START, GAP_END, CLIFF_T, pathPoint, seeded } from './constants'
import { useNearCamera } from './useNearCamera'
import { look } from './lookState'
import { SECTIONS } from '../data/sections'
import { useUiStore } from '../store/useUiStore'
import { gainXp } from '../game/rewards'
import { trackEvent } from '../game/analytics'
import { sfx } from '../game/sfx'

const TAU = Math.PI * 2

// ── Day / Night ───────────────────────────────────────────────────────
const THEMES = {
  night: {
    bg: '#0b1026',
    ambient: 0.6,
    dirColor: '#dfe6ff',
    dirIntensity: 1.05,
    gridA: '#3a4fa0',
    gridB: '#1d2650',
    cloud: '#2a356e',
    cloudOpacity: 0.5,
    windowGlow: 0.4,
  },
  day: {
    bg: '#79b8e6',
    ambient: 1.05,
    dirColor: '#fff3d6',
    dirIntensity: 1.6,
    gridA: '#5f83c4',
    gridB: '#4a6aa8',
    cloud: '#f2f7ff',
    cloudOpacity: 0.85,
    windowGlow: 0.12,
  },
}

/** The SQUARE sun (day) or moon (night) — Minecraft skies don't do circles. */
function Celestial({ theme }) {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = 34 + Math.sin(state.clock.elapsedTime * 0.12) * 1.2
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.05) * 0.1
    }
  })
  const pos = [LOOP_CENTER.x + 46, 34, LOOP_CENTER.z - 66]
  if (theme === 'day') {
    return (
      <group ref={ref} position={pos}>
        <mesh>
          <boxGeometry args={[8, 8, 0.6]} />
          <meshBasicMaterial color="#ffdf6b" toneMapped={false} />
        </mesh>
        <mesh>
          <boxGeometry args={[10.5, 10.5, 0.4]} />
          <meshBasicMaterial color="#ffdf6b" transparent opacity={0.16} toneMapped={false} />
        </mesh>
      </group>
    )
  }
  return (
    <group ref={ref} position={pos}>
      <mesh>
        <boxGeometry args={[6.5, 6.5, 0.6]} />
        <meshStandardMaterial color="#e9edff" emissive="#cdd6ff" emissiveIntensity={0.7} />
      </mesh>
      {/* pixel craters */}
      <mesh position={[-1.4, 1.2, 0.32]}>
        <boxGeometry args={[1.3, 1.3, 0.1]} />
        <meshStandardMaterial color="#c3cbe8" />
      </mesh>
      <mesh position={[1.5, -1.1, 0.32]}>
        <boxGeometry args={[0.9, 0.9, 0.1]} />
        <meshStandardMaterial color="#c3cbe8" />
      </mesh>
    </group>
  )
}

/** Minecraft-style voxel terrain: a field of grass-capped dirt blocks with
 * per-block color jitter, in TWO instanced draw calls. Holes are left under
 * the gap and the cliff so there is still somewhere to fall. */
function VoxelTerrain({ mobile, theme }) {
  const { caps, dirt } = useMemo(() => {
    // bigger blocks over the bigger map keep the instance count (and the
    // frame budget) the same as the old, smaller city
    const B = mobile ? 3.9 : 3.3
    const RADIUS = mobile ? 54 : 66
    const capItems = []
    const dirtItems = []
    const grass = theme === 'day' ? [76, 155, 80] : [40, 105, 62]
    const soil = theme === 'day' ? [107, 74, 46] : [70, 50, 32]
    let n = 0
    for (let x = -RADIUS; x <= RADIUS; x += B) {
      for (let z = -RADIUS; z <= RADIUS; z += B) {
        const wx = LOOP_CENTER.x + x
        const wz = LOOP_CENTER.z + z
        const d = Math.hypot(x, z)
        if (d > RADIUS) continue
        // leave the void under the jump gap and the cliff
        const u = ((Math.atan2(x, z) / TAU) + 1) % 1
        const nearRoad = d > LOOP_RADIUS - 7 && d < LOOP_RADIUS + 8
        if (nearRoad && ((u > GAP_START - 0.006 && u < GAP_END + 0.006) || u > CLIFF_T - 0.002)) continue
        n += 1
        const j = seeded(n) * 24 - 12 // color jitter, the Minecraft signature
        const jy = seeded(n + 9000) * 0.06
        capItems.push({
          pos: [wx, -0.3 - jy, wz],
          scale: [B, 0.36, B],
          color: `rgb(${grass[0] + j | 0},${grass[1] + j | 0},${grass[2] + (j / 2) | 0})`,
        })
        dirtItems.push({
          pos: [wx, -1.25 - jy, wz],
          scale: [B, 1.55, B],
          color: `rgb(${soil[0] + j | 0},${soil[1] + (j / 2) | 0},${soil[2] + (j / 2) | 0})`,
        })
      }
    }
    return { caps: capItems, dirt: dirtItems }
  }, [mobile, theme])
  return (
    <group>
      <Boxes items={dirt} />
      <Boxes items={caps} />
    </group>
  )
}

// two rivers, both OUTSIDE the loop so nothing collides with the road:
// one across the Round-1 countryside, one across the Round-2 garden stretch
const RIVERS = [
  { t1: 0.07, t2: 0.23, bridgeU: 0.15 },
  { t1: 0.56, t2: 0.84, bridgeU: 0.7 },
]
const RIVER_INNER = LOOP_RADIUS + 6
const RIVER_OUTER = LOOP_RADIUS + 9.5

// the formal garden occupies this sector INSIDE the ring (buildings keep out)
const GARDEN_U1 = 0.56
const GARDEN_U2 = 0.74

// the park sector, also inside the ring
const PARK_U1 = 0.79
const PARK_U2 = 0.94

// the beach: sand + open sea beyond the Round-2 river (palms replace trees)
const BEACH_U1 = 0.585
const BEACH_U2 = 0.79

const SKIN_TONES = ['#e8b17e', '#c68642', '#8d5524', '#f1c27d']
const SHIRTS = ['#ff5d5d', '#39ff88', '#ffd93d', '#a06bff', '#4db3ff', '#ff8fb0']

// river-free arcs where the homes stand (their garden flowers are placed
// by Nature's instanced pass using the same slots)
const HOME_SLOTS = [0.88, 0.93, 0.98, 0.28, 0.34, 0.4, 0.46]

function inAnyRiver(u, pad = 0.02) {
  return RIVERS.some((r) => u > r.t1 - pad && u < r.t2 + pad)
}

/** Flat arc between progress t1..t2 (one draw call).
 * Mapping: mesh rotated x:-π/2 puts ring angle φ at world (cos φ, −sin φ)
 * relative to center; pathPoint(t) is (sin a, cos a), a = 2πt → φ = a − π/2. */
function RingArc({ t1, t2, inner, outer, y = 0, color = '#2a356e', emissive, emissiveIntensity = 0.3, opacity = 1, segments = 96 }) {
  const thetaStart = TAU * t1 - Math.PI / 2
  const thetaLength = TAU * (t2 - t1)
  return (
    <mesh position={[LOOP_CENTER.x, y, LOOP_CENTER.z]} rotation={[-Math.PI / 2, 0, 0]}>
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

/** A flat ribbon that follows the winding path exactly between t1..t2 —
 * one draw call, built once. This is how the আঁকাবাঁকা road gets drawn. */
function PathRibbon({ t1, t2, halfWidth, y = 0, color = '#2a356e', emissive, emissiveIntensity = 0.3 }) {
  const geometry = useMemo(() => {
    const N = Math.max(12, Math.round((t2 - t1) * 220))
    const positions = new Float32Array((N + 1) * 2 * 3)
    const normals = new Float32Array((N + 1) * 2 * 3)
    const indices = []
    for (let i = 0; i <= N; i++) {
      const t = t1 + ((t2 - t1) * i) / N
      const p = pathPoint(t)
      const o = i * 6
      positions.set([p.x - p.nx * halfWidth, y, p.z - p.nz * halfWidth], o)
      positions.set([p.x + p.nx * halfWidth, y, p.z + p.nz * halfWidth], o + 3)
      normals.set([0, 1, 0, 0, 1, 0], o)
      if (i < N) {
        const k = i * 2
        indices.push(k, k + 1, k + 2, k + 1, k + 3, k + 2)
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
    g.setIndex(indices)
    return g
  }, [t1, t2, halfWidth, y])
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color={color}
        emissive={emissive ?? '#000000'}
        emissiveIntensity={emissive ? emissiveIntensity : 0}
        side={2}
      />
    </mesh>
  )
}

/** One instancedMesh of unit boxes: pass [{pos, scale, color?}]. 1 draw call. */
function Boxes({ items, color, emissive, emissiveIntensity = 0 }) {
  const ref = useRef()
  useLayoutEffect(() => {
    if (!ref.current) return
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    items.forEach((it, i) => {
      q.setFromEuler(it.rot ? e.set(...it.rot) : e.set(0, 0, 0))
      m.compose(new THREE.Vector3(...it.pos), q, new THREE.Vector3(...it.scale))
      ref.current.setMatrixAt(i, m)
      if (it.color) ref.current.setColorAt(i, new THREE.Color(it.color))
    })
    ref.current.instanceMatrix.needsUpdate = true
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true
  }, [items])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={color ?? '#ffffff'}
        emissive={emissive ?? '#000000'}
        emissiveIntensity={emissiveIntensity}
      />
    </instancedMesh>
  )
}

/** The loop road: two arcs, neon stripes, gap warning, cliff rubble, flag. */
function RingRoad() {
  const gapSign = pathPoint(0.395)
  const finish = pathPoint(0.965)
  const rubble = useMemo(
    () =>
      [0, 1, 2].map((i) => {
        const p = pathPoint(CLIFF_T - 0.004 + i * 0.002)
        const s = 0.3 + seeded(i + 5) * 0.35
        return { pos: [p.x + (seeded(i) - 0.5) * 2, 0.12, p.z], scale: [s, s, s], rot: [seeded(i) * 0.8, seeded(i + 3) * 2, 0], color: '#1d2650' }
      }),
    []
  )
  return (
    <group>
      <PathRibbon t1={0} t2={GAP_START} halfWidth={1.8} />
      <PathRibbon t1={GAP_END} t2={CLIFF_T} halfWidth={1.8} />
      <PathRibbon t1={0} t2={GAP_START} halfWidth={0.22} y={0.02} color="#39ff88" emissive="#39ff88" />
      <PathRibbon t1={GAP_END} t2={CLIFF_T} halfWidth={0.22} y={0.02} color="#a06bff" emissive="#a06bff" />

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

      <Boxes items={rubble} />
    </group>
  )
}

/** City towers (3 instanced draws) + beacon + traffic. Fewer, taller,
 * further apart — a skyline, not a shelf of clutter. */
function MiniCity({ mobile, windowGlow = 0.35 }) {
  const buildings = useMemo(() => {
    const list = []
    // urban plan: ALL towers form a downtown core around the beacon —
    // the band beyond stays free for the monument boulevard
    const count = mobile ? 8 : 11
    for (let i = 0; i < count; i++) {
      const ang = seeded(i * 7 + 1) * TAU
      const rad = 4 + seeded(i + 20) * 6
      const h = 3 + seeded(i + 40) * 8
      const w = 1.4 + seeded(i + 50) * 2
      list.push({
        ang, rad, h, w,
        pos: [LOOP_CENTER.x + Math.sin(ang) * rad, h / 2, LOOP_CENTER.z + Math.cos(ang) * rad],
        color: ['#141b3c', '#1d2650', '#232e63'][i % 3],
        glow: ['#39ff88', '#ffd93d', '#a06bff', '#ff8a3d'][i % 4],
      })
    }
    return list
  }, [mobile])

  const bodies = useMemo(() => buildings.map((b) => ({ pos: b.pos, scale: [b.w, b.h, b.w], color: b.color })), [buildings])
  const windows = useMemo(
    () =>
      buildings.map((b) => ({
        pos: [b.pos[0], b.h * 0.55, b.pos[2] + b.w / 2 + 0.02],
        scale: [b.w * 0.55, b.h * 0.6, 0.02],
        color: b.glow,
      })),
    [buildings]
  )
  const roofLights = useMemo(
    () => buildings.map((b) => ({ pos: [b.pos[0], b.h + 0.1, b.pos[2]], scale: [0.14, 0.16, 0.14], color: b.glow })),
    [buildings]
  )

  const cars = useMemo(
    () => [
      { key: 0, radius: 13.5, speed: 0.03, offset: 0, color: '#ff5d5d', len: 0.9 },
      { key: 1, radius: 13.5, speed: 0.028, offset: 0.32, color: '#ffd93d', len: 0.9 },
      { key: 2, radius: 13.5, speed: 0.02, offset: 0.66, color: '#39ff88', len: 1.6 },
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
      <mesh position={[LOOP_CENTER.x, 0.005, LOOP_CENTER.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[12.6, 14.4, 64]} />
        <meshStandardMaterial color="#181f45" side={2} />
      </mesh>

      <Boxes items={bodies} />
      <Boxes items={windows} emissive="#ffffff" emissiveIntensity={windowGlow} />
      <Boxes items={roofLights} emissive="#ffffff" emissiveIntensity={0.8} />

      <group position={[LOOP_CENTER.x, 0, LOOP_CENTER.z]}>
        <mesh position={[0, 3.4, 0]}>
          <boxGeometry args={[1.6, 6.8, 1.6]} />
          <meshStandardMaterial color="#1d2650" />
        </mesh>
        <mesh position={[0, 7, 0]}>
          <octahedronGeometry args={[0.55, 0]} />
          <meshStandardMaterial color="#39ff88" emissive="#39ff88" emissiveIntensity={0.9} />
        </mesh>
      </group>

      <CityBillboard />

      {cars.map((cfg, i) => (
        <group key={cfg.key} ref={(el) => (carRefs.current[i] = el)}>
          <mesh>
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

/** The city-center billboard: raised on a mast ABOVE the whole skyline so
 * it reads from anywhere on the loop. Front greets the start; back winks
 * at Round 2. Each face is occluded by the panel — no ghost-through. */
function CityBillboard() {
  const glow = useRef()
  const panel = useRef()
  useFrame((state) => {
    if (glow.current) {
      glow.current.material.emissiveIntensity = 0.18 + (Math.sin(state.clock.elapsedTime * 1.6) + 1) * 0.08
    }
  })
  const TOP = 13 // panel center — clears the tallest tower (~11) without looming
  return (
    <group position={[LOOP_CENTER.x, 0, LOOP_CENTER.z]}>
      {/* twin masts */}
      {[-4.6, 4.6].map((x) => (
        <mesh key={x} position={[x, TOP / 2, 0]}>
          <boxGeometry args={[0.45, TOP, 0.45]} />
          <meshStandardMaterial color="#232e63" emissive="#39ff88" emissiveIntensity={0.08} />
        </mesh>
      ))}
      {/* panel frame + glowing screen */}
      <mesh ref={panel} position={[0, TOP, 0]}>
        <boxGeometry args={[12.5, 5.6, 0.5]} />
        <meshStandardMaterial color="#141b3c" />
      </mesh>
      <mesh ref={glow} position={[0, TOP, 0]}>
        <boxGeometry args={[11.9, 5.0, 0.62]} />
        <meshStandardMaterial color="#0b1026" emissive="#39ff88" emissiveIntensity={0.2} />
      </mesh>
      {/* corner beacons so the eye finds it at night */}
      {[-6, 6].map((x) =>
        [TOP - 2.6, TOP + 2.6].map((y) => (
          <mesh key={`${x}-${y}`} position={[x * 0.98, y, 0]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#ffd93d" emissive="#ffd93d" emissiveIntensity={0.9} />
          </mesh>
        ))
      )}

      {/* front: the pitch, facing the starting line */}
      <Html
        transform
        occlude={[panel]}
        position={[0, TOP, 0.34]}
        distanceFactor={9}
        style={{ pointerEvents: 'none' }}
        zIndexRange={[5, 0]}
      >
        <div className="flex w-[330px] select-none items-center gap-3 text-left">
          <img
            src="/soyed-photo.png"
            alt=""
            width={78}
            height={86}
            style={{ imageRendering: 'pixelated', border: '3px solid #39ff88', flexShrink: 0 }}
          />
          <div>
            <p className="font-pixel text-[8px] tracking-wider text-[#39ff88]">— WELCOME TO —</p>
            <p className="mt-1 font-pixel text-[14px] leading-snug text-[#ffd93d]">SOYED SOLAMAN&apos;S</p>
            <p className="font-pixel text-[11px] text-[#e6e9ff]">PORTFOLIO CITY</p>
            <p className="mt-1.5 font-body text-[10px] leading-snug text-[#9aa3d1]">
              Software Engineer · SQA · AI Engineer — this world is my resume.
            </p>
            <p className="mt-1 font-pixel text-[7px] text-[#a06bff]">SCROLL · OPEN CRYSTALS · EARN XP</p>
          </div>
        </div>
      </Html>

      {/* back: a wink for the Round-2 half of the loop */}
      <Html
        transform
        occlude={[panel]}
        position={[0, TOP, -0.34]}
        rotation={[0, Math.PI, 0]}
        distanceFactor={9}
        style={{ pointerEvents: 'none' }}
        zIndexRange={[5, 0]}
      >
        <div className="w-[310px] select-none text-center">
          <p className="font-pixel text-[14px] text-[#a06bff]">ROUND 2</p>
          <p className="mt-1.5 font-body text-[11px] leading-snug text-[#9aa3d1]">
            Learning game · question dungeon · live job quests · company codex
          </p>
          <p className="mt-1.5 font-pixel text-[8px] text-[#39ff88]">HIRE THE PLAYER 🐞 · TESTED LIKE PRODUCTION</p>
        </div>
      </Html>
    </group>
  )
}

/** Cozy voxel homes outside the loop (clear of both rivers), each with a
 * garden plot; the plot flowers ride the global instanced flower pass. */
function Homes({ mobile }) {
  const homes = useMemo(() => {
    const list = []
    // a few cozy homes, not a suburb — the open land IS the aesthetic
    const count = mobile ? 3 : 4
    for (let i = 0; i < count; i++) {
      const p = circlePoint(HOME_SLOTS[i % HOME_SLOTS.length], LOOP_RADIUS + 5.6 + seeded(i + 22) * 2.6)
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
          <mesh position={[0, 0.55, 0]}>
            <boxGeometry args={[1.7, 1.1, 1.5]} />
            <meshStandardMaterial color={h.wall} />
          </mesh>
          <mesh position={[0, 1.45, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[1.35, 0.75, 4]} />
            <meshStandardMaterial color={h.roof} />
          </mesh>
          <mesh position={[0.35, 0.4, 0.76]}>
            <boxGeometry args={[0.34, 0.7, 0.03]} />
            <meshStandardMaterial color="#6b4f2a" />
          </mesh>
          <mesh position={[-0.4, 0.65, 0.76]}>
            <boxGeometry args={[0.4, 0.36, 0.03]} />
            <meshStandardMaterial color="#ffd93d" emissive="#ffd93d" emissiveIntensity={0.7} />
          </mesh>
          <mesh position={[1.6, 0.03, 0.2]}>
            <boxGeometry args={[1.5, 0.06, 1.1]} />
            <meshStandardMaterial color="#1e5c38" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Tiny voxel citizens: sidewalk strollers (outside the checkpoints), plaza
 * walkers between the towers and the inner street, and the waving greeter. */
function People({ mobile }) {
  const walkers = useMemo(() => {
    const list = []
    const count = mobile ? 2 : 4
    for (let i = 0; i < count; i++) {
      const sidewalk = i % 2 === 0
      list.push({
        key: i,
        // sidewalk radius clears the winding road (outer reach R+4.3) and
        // checkpoints; plaza ring sits between towers (≤9.5) and street (≥12.6)
        radius: sidewalk ? LOOP_RADIUS + 5.4 : 11.5,
        speed: (0.0032 + seeded(i + 32) * 0.004) * (i % 3 === 0 ? -1 : 1),
        offset: seeded(i + 33),
        shirt: SHIRTS[i % SHIRTS.length],
        skin: SKIN_TONES[i % SKIN_TONES.length],
      })
    }
    return list
  }, [mobile])
  const refs = useRef([])
  const greeter = useRef()
  const greetP = useMemo(() => pathPoint(0.015), [])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    refs.current.forEach((g, i) => {
      if (!g) return
      const cfg = walkers[i]
      const p = circlePoint(time * cfg.speed + cfg.offset, cfg.radius)
      g.position.set(p.x, 0, p.z)
      g.rotation.y = cfg.speed >= 0 ? p.yaw : p.yaw + Math.PI
      const swing = Math.sin(time * 6 + i) * 0.4
      g.children[0].rotation.x = swing
      g.children[1].rotation.x = -swing
      // arms swing opposite the legs (children: 0,1 legs · 2 body · 3,4 arms · 5 head)
      if (g.children[3]) g.children[3].rotation.x = -swing * 0.7
      if (g.children[4]) g.children[4].rotation.x = swing * 0.7
    })
    if (greeter.current) {
      // left arm rests, right arm waves
      greeter.current.children[4].rotation.z = 2.4 + Math.sin(time * 5) * 0.35
    }
  })

  function PersonBody({ shirt, skin }) {
    return (
      <>
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
        <mesh position={[0, 0.62, 0]}>
          <boxGeometry args={[0.42, 0.5, 0.26]} />
          <meshStandardMaterial color={shirt} />
        </mesh>
        {/* both arms — citizens are not action figures with missing parts */}
        <mesh position={[-0.28, 0.72, 0]}>
          <boxGeometry args={[0.11, 0.4, 0.13]} />
          <meshStandardMaterial color={shirt} />
        </mesh>
        <mesh position={[0.28, 0.72, 0]}>
          <boxGeometry args={[0.11, 0.4, 0.13]} />
          <meshStandardMaterial color={shirt} />
        </mesh>
        <mesh position={[0, 1.05, 0]}>
          <boxGeometry args={[0.32, 0.32, 0.3]} />
          <meshStandardMaterial color={skin} />
        </mesh>
      </>
    )
  }

  return (
    <group>
      {walkers.map((w, i) => (
        <group key={w.key} ref={(el) => (refs.current[i] = el)}>
          <PersonBody shirt={w.shirt} skin={w.skin} />
        </group>
      ))}
      <group
        ref={greeter}
        position={[greetP.x - greetP.nx * 2.6, 0, greetP.z - greetP.nz * 2.6]}
        rotation={[0, Math.atan2(greetP.nx, greetP.nz), 0]}
      >
        <PersonBody shirt="#ffd93d" skin="#e8b17e" />
        <Html center position={[0, 1.6, 0]} style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
          <span className="whitespace-nowrap font-pixel text-[7px] text-ink-dim">hi! 👋</span>
        </Html>
      </group>
    </group>
  )
}

/** A river arc outside the loop: banks, shimmering water, sparkles, a wooden
 * footbridge and instanced reeds. */
function River({ t1, t2, bridgeU }) {
  const water = useRef()
  useFrame((state) => {
    if (water.current) {
      water.current.material.emissiveIntensity = 0.25 + Math.sin(state.clock.elapsedTime * 1.4 + t1 * 20) * 0.1
    }
  })
  const bridge = circlePoint(bridgeU, (RIVER_INNER + RIVER_OUTER) / 2)
  const reeds = useMemo(
    () =>
      [...Array(7)].map((_, i) => {
        const u = t1 + 0.015 + seeded(i + 77 + t1 * 100) * (t2 - t1 - 0.03)
        const edge = i % 2 === 0 ? RIVER_INNER - 0.4 : RIVER_OUTER + 0.4
        const p = circlePoint(u, edge)
        const h = 0.5 + seeded(i + 78) * 0.4
        return { pos: [p.x, h / 2, p.z], scale: [0.06, h, 0.06], color: '#2fae62' }
      }),
    [t1, t2]
  )
  return (
    <group>
      <RingArc t1={t1 - 0.015} t2={t2 + 0.015} inner={RIVER_INNER - 0.8} outer={RIVER_OUTER + 0.8} y={-0.04} color="#1a2a4f" />
      <mesh ref={water} position={[LOOP_CENTER.x, -0.02, LOOP_CENTER.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[RIVER_INNER, RIVER_OUTER, 96, 1, TAU * t1 - Math.PI / 2, TAU * (t2 - t1)]} />
        <meshStandardMaterial color="#1d4e89" emissive="#4db3ff" emissiveIntensity={0.3} transparent opacity={0.9} side={2} />
      </mesh>
      <Sparkles count={22} scale={[10, 0.6, 10]} position={[bridge.x, 0.3, bridge.z]} size={1.6} speed={0.2} color="#bfe3ff" />
      {/* footbridge — LANDS on both banks: stone abutments at the ends,
          piers in the water, deck low enough to step onto */}
      <group position={[bridge.x, 0, bridge.z]} rotation={[0, bridge.yaw + Math.PI / 2, 0]}>
        {/* deck (reaches well past both bank edges) */}
        <mesh position={[0, 0.26, 0]}>
          <boxGeometry args={[1.35, 0.14, RIVER_OUTER - RIVER_INNER + 4.4]} />
          <meshStandardMaterial color="#8a6a3b" />
        </mesh>
        {/* railings */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.6, 0.56, 0]}>
            <boxGeometry args={[0.07, 0.46, RIVER_OUTER - RIVER_INNER + 4.4]} />
            <meshStandardMaterial color="#6b4f2a" />
          </mesh>
        ))}
        {/* stone abutments where the deck meets each bank */}
        {[-1, 1].map((s) => (
          <mesh key={`ab${s}`} position={[0, 0.08, s * ((RIVER_OUTER - RIVER_INNER + 4.4) / 2 - 0.7)]}>
            <boxGeometry args={[1.7, 0.4, 1.5]} />
            <meshStandardMaterial color="#3d4468" />
          </mesh>
        ))}
        {/* piers standing in the river */}
        {[-1, 1].map((s) =>
          [-0.45, 0.45].map((x) => (
            <mesh key={`p${s}${x}`} position={[x, 0, s * 1.4]}>
              <boxGeometry args={[0.28, 0.55, 0.28]} />
              <meshStandardMaterial color="#4a3a1e" />
            </mesh>
          ))
        )}
      </group>
      <Boxes items={reeds} />
    </group>
  )
}

/** The formal garden inside the ring: lawn, flower beds, hedges, fountain. */
function Garden() {
  const center = circlePoint((GARDEN_U1 + GARDEN_U2) / 2, 20.5)
  const fountain = useRef()
  useFrame((state) => {
    if (fountain.current) {
      fountain.current.material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 2.2) * 0.25
      fountain.current.position.y = 0.55 + Math.sin(state.clock.elapsedTime * 2.2) * 0.06
    }
  })
  const hedges = useMemo(() => {
    const list = []
    for (let i = 0; i < 6; i++) {
      const u = GARDEN_U1 + 0.015 + (i / 6) * (GARDEN_U2 - GARDEN_U1 - 0.03)
      const p = circlePoint(u, 25)
      list.push({ pos: [p.x, 0.3, p.z], scale: [1.8, 0.6, 0.7], rot: [0, p.yaw, 0], color: '#1e5c38' })
    }
    return list
  }, [])
  return (
    <group>
      {/* lawn */}
      <RingArc t1={GARDEN_U1} t2={GARDEN_U2} inner={16.5} outer={25.8} y={-0.01} color="#143d27" />
      {/* fountain — block-built, of course */}
      <group position={[center.x, 0, center.z]}>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[2.6, 0.4, 2.6]} />
          <meshStandardMaterial color="#2a356e" />
        </mesh>
        <mesh ref={fountain} position={[0, 0.55, 0]}>
          <boxGeometry args={[1.9, 0.25, 1.9]} />
          <meshStandardMaterial color="#1d4e89" emissive="#4db3ff" emissiveIntensity={0.5} />
        </mesh>
        <Sparkles count={16} scale={[2.2, 1.6, 2.2]} position={[0, 1.2, 0]} size={1.4} speed={0.5} color="#bfe3ff" />
      </group>
      <Boxes items={hedges} />
    </group>
  )
}

/** All greenery in a handful of instanced draws: trunks, canopies, flower
 * stems, flower heads (garden beds + home plots + wild ones). Plus birds. */
function Nature({ mobile }) {
  const trees = useMemo(() => {
    // keep-out map: everything a tree could collapse onto
    const LANDMARKS = [
      { u: 0.05, r: LOOP_RADIUS + 16 }, { u: 0.13, r: LOOP_RADIUS + 18 }, { u: 0.21, r: LOOP_RADIUS + 16 }, { u: 0.3, r: LOOP_RADIUS + 18 },
      { u: 0.4, r: LOOP_RADIUS + 20 }, { u: 0.5, r: LOOP_RADIUS + 16 } /* Camp Nou */, { u: 0.57, r: LOOP_RADIUS + 18 }, { u: 0.85, r: LOOP_RADIUS + 16 },
    ]
    const uDist = (a, b) => {
      const d = Math.abs(a - b) % 1
      return Math.min(d, 1 - d)
    }
    const spotOK = (u, rad) => {
      if (u > BEACH_U1 - 0.01 && u < BEACH_U2 + 0.01) return false // palms' turf
      if (Math.abs(rad - RAIL_R) < 1.7) return false // under the train viaduct
      for (const slot of HOME_SLOTS) {
        if (uDist(u, slot) < 0.022 && rad > LOOP_RADIUS + 4.5 && rad < LOOP_RADIUS + 10) return false
      }
      for (const lm of LANDMARKS) {
        if (uDist(u, lm.u) < 0.032 && rad > lm.r - 9) return false
      }
      return true
    }

    const list = []
    const count = mobile ? 5 : 8
    for (let i = 0; i < count; i++) {
      // retry with fresh deterministic seeds until the spot is clear
      // (48 attempts verified sufficient for all 12 trees)
      for (let attempt = 0; attempt < 48; attempt++) {
        const k = i * 13 + 2 + attempt * 97
        const u = seeded(k)
        const rad = inAnyRiver(u, 0.035)
          ? RIVER_OUTER + 1.6 + seeded(k + 61) * 2.2
          : LOOP_RADIUS + 5.6 + seeded(k + 60) * 3.2
        if (!spotOK(u, rad)) continue
        const ang = u * TAU
        list.push({
          pos: [LOOP_CENTER.x + Math.sin(ang) * rad, 0, LOOP_CENTER.z + Math.cos(ang) * rad],
          h: 1 + seeded(k + 70) * 0.9,
          leaf: i % 4 === 0 ? '#ff8fb0' : '#2fae62',
        })
        break
      }
    }
    return list
  }, [mobile])

  const flowers = useMemo(() => {
    const list = []
    // wild flowers: roadside strips PLACED RELATIVE TO THE WINDING ROAD so
    // they hug its bends without ever sitting on the asphalt
    const wildCount = mobile ? 12 : 24
    for (let i = 0; i < wildCount; i++) {
      const u = seeded(i * 17 + 3)
      const inside = i % 3 === 0
      let pos
      if (inside) {
        const ang = u * TAU
        const rad = 20 + seeded(i + 80) * 5.5
        pos = [LOOP_CENTER.x + Math.sin(ang) * rad, 0, LOOP_CENTER.z + Math.cos(ang) * rad]
      } else {
        const p = pathPoint(u)
        const off = 2.3 + seeded(i + 80) * 1.4 // just off the road's edge (1.8)
        pos = [p.x + p.nx * off, 0, p.z + p.nz * off]
      }
      list.push({
        pos,
        color: ['#ffd93d', '#ff8a3d', '#ff8fb0', '#a06bff', '#e6e9ff'][i % 5],
        s: 0.12 + seeded(i + 90) * 0.1,
      })
    }
    // garden beds: neat rows flanking the fountain
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 8; c++) {
        const u = GARDEN_U1 + 0.02 + (c / 8) * (GARDEN_U2 - GARDEN_U1 - 0.04)
        const p = circlePoint(u, 17.6 + r * 1.3)
        list.push({ pos: [p.x, 0, p.z], color: ['#ff8fb0', '#ffd93d', '#e6e9ff'][r], s: 0.15 })
      }
    }
    // home garden plots
    HOME_SLOTS.slice(0, mobile ? 3 : 4).forEach((slot, i) => {
      const hp = circlePoint(slot, LOOP_RADIUS + 5.6 + seeded(i + 22) * 2.6)
      for (let f = 0; f < 4; f++) {
        list.push({
          pos: [hp.x + 1.3 + (f % 2) * 0.5, 0, hp.z - 0.3 + Math.floor(f / 2) * 0.5],
          color: ['#ffd93d', '#ff8fb0', '#e6e9ff', '#ff8a3d'][f],
          s: 0.13,
        })
      }
    })
    return list
  }, [mobile])

  const stems = useMemo(() => flowers.map((f) => ({ pos: [f.pos[0], 0.14, f.pos[2]], scale: [0.04, 0.28, 0.04], color: '#2fae62' })), [flowers])
  const heads = useMemo(() => flowers.map((f) => ({ pos: [f.pos[0], 0.32, f.pos[2]], scale: [f.s, f.s, f.s], color: f.color })), [flowers])
  const trunks = useMemo(() => trees.map((t) => ({ pos: [t.pos[0], t.h / 2, t.pos[2]], scale: [0.22, t.h, 0.22], color: '#6b4f2a' })), [trees])
  const canopies = useMemo(() => trees.map((t) => ({ pos: [t.pos[0], t.h + 0.55, t.pos[2]], scale: [1.05, 1.05, 1.05], color: t.leaf })), [trees])

  const birds = useMemo(
    () =>
      [...Array(mobile ? 2 : 4)].map((_, i) => ({
        key: i,
        radius: 8 + seeded(i + 11) * 26,
        height: 7.5 + seeded(i + 12) * 6,
        speed: 0.028 + seeded(i + 13) * 0.03,
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
      <Boxes items={trunks} />
      <Boxes items={canopies} />
      <Boxes items={stems} />
      <Boxes items={heads} emissive="#ffffff" emissiveIntensity={0.15} />

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

/** 🏖️ The beach: a sandy shore beyond the Round-2 river, palms, umbrella,
 * a rolling sea that fades into the mountains. */
function Beach() {
  const sea = useRef()
  useFrame((state) => {
    if (sea.current) {
      sea.current.material.emissiveIntensity = 0.22 + Math.sin(state.clock.elapsedTime * 0.9) * 0.08
      sea.current.position.y = -0.06 + Math.sin(state.clock.elapsedTime * 0.7) * 0.02
    }
  })
  const palms = useMemo(
    () =>
      [...Array(5)].map((_, i) => {
        const u = BEACH_U1 + 0.02 + (i / 5) * (BEACH_U2 - BEACH_U1 - 0.04)
        const p = circlePoint(u, LOOP_RADIUS + 12 + seeded(i + 300) * 3)
        return { key: i, pos: [p.x, 0, p.z], lean: (seeded(i + 301) - 0.5) * 0.3, h: 2 + seeded(i + 302) * 0.8 }
      }),
    []
  )
  const mid = circlePoint((BEACH_U1 + BEACH_U2) / 2, LOOP_RADIUS + 13)
  return (
    <group>
      {/* sand */}
      <RingArc t1={BEACH_U1} t2={BEACH_U2} inner={RIVER_OUTER + 0.9} outer={LOOP_RADIUS + 17} y={-0.03} color="#c9b47f" />
      {/* the sea */}
      <mesh ref={sea} position={[LOOP_CENTER.x, -0.06, LOOP_CENTER.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[LOOP_RADIUS + 17, LOOP_RADIUS + 36, 96, 1, TAU * BEACH_U1 - Math.PI / 2, TAU * (BEACH_U2 - BEACH_U1)]} />
        <meshStandardMaterial color="#123f70" emissive="#4db3ff" emissiveIntensity={0.22} transparent opacity={0.95} side={2} />
      </mesh>
      {/* surf line */}
      <RingArc t1={BEACH_U1 + 0.005} t2={BEACH_U2 - 0.005} inner={LOOP_RADIUS + 16.7} outer={LOOP_RADIUS + 17.15} y={-0.02} color="#bfe3ff" emissive="#bfe3ff" emissiveIntensity={0.35} />
      <Sparkles count={26} scale={[16, 0.8, 16]} position={[mid.x, 0.3, mid.z]} size={1.5} speed={0.18} color="#bfe3ff" />

      {/* palms */}
      {palms.map((p) => (
        <group key={p.key} position={p.pos} rotation={[0, seeded(p.key + 40) * TAU, p.lean]}>
          <mesh position={[0, p.h / 2, 0]}>
            <boxGeometry args={[0.18, p.h, 0.18]} />
            <meshStandardMaterial color="#7a5a30" />
          </mesh>
          {[0, 1, 2, 3].map((f) => (
            <mesh
              key={f}
              position={[Math.sin((f / 4) * TAU) * 0.55, p.h + 0.1, Math.cos((f / 4) * TAU) * 0.55]}
              rotation={[0.35 * Math.cos((f / 4) * TAU), (f / 4) * TAU, -0.35 * Math.sin((f / 4) * TAU)]}
            >
              <boxGeometry args={[0.28, 0.06, 1.15]} />
              <meshStandardMaterial color="#2fae62" />
            </mesh>
          ))}
        </group>
      ))}

      {/* umbrella + towel + beach ball */}
      <group position={[mid.x, 0, mid.z]}>
        <mesh position={[0, 0.75, 0]}>
          <boxGeometry args={[0.08, 1.5, 0.08]} />
          <meshStandardMaterial color="#e6e9ff" />
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <coneGeometry args={[1.0, 0.5, 8]} />
          <meshStandardMaterial color="#ff5d5d" />
        </mesh>
        <mesh position={[1.1, 0.02, 0.4]}>
          <boxGeometry args={[0.9, 0.03, 1.6]} />
          <meshStandardMaterial color="#ffd93d" />
        </mesh>
        <mesh position={[-0.9, 0.18, -0.5]}>
          <sphereGeometry args={[0.18, 10, 8]} />
          <meshStandardMaterial color="#ff8a3d" />
        </mesh>
      </group>
    </group>
  )
}

/** 🌳 The park inside the ring: lawn, benches, lamp posts, a slide and a
 * swing set that actually swings. */
function Park() {
  const swings = useRef([])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    swings.current.forEach((s, i) => {
      if (s) s.rotation.x = Math.sin(t * 1.15 + i * 1.4) * 0.45
    })
  })
  const at = (du, radius) => circlePoint(PARK_U1 + du * (PARK_U2 - PARK_U1), radius)
  const benchSpots = [at(0.2, 23.8), at(0.8, 23.8)]
  const lampSpots = [at(0.12, 18.5), at(0.5, 24.8), at(0.88, 18.5)]
  const swingSpot = at(0.35, 20.5)
  const slideSpot = at(0.68, 20.5)
  return (
    <group>
      {/* lawn */}
      <RingArc t1={PARK_U1} t2={PARK_U2} inner={16.5} outer={25.8} y={-0.01} color="#16482e" />

      {/* benches */}
      {benchSpots.map((b, i) => (
        <group key={i} position={[b.x, 0, b.z]} rotation={[0, b.yaw, 0]}>
          <mesh position={[0, 0.28, 0]}>
            <boxGeometry args={[1.1, 0.08, 0.4]} />
            <meshStandardMaterial color="#8a6a3b" />
          </mesh>
          <mesh position={[0, 0.55, -0.18]}>
            <boxGeometry args={[1.1, 0.4, 0.08]} />
            <meshStandardMaterial color="#8a6a3b" />
          </mesh>
          {[-0.45, 0.45].map((x) => (
            <mesh key={x} position={[x, 0.12, 0]}>
              <boxGeometry args={[0.08, 0.24, 0.34]} />
              <meshStandardMaterial color="#4a3a1e" />
            </mesh>
          ))}
        </group>
      ))}

      {/* lamp posts */}
      {lampSpots.map((l, i) => (
        <group key={i} position={[l.x, 0, l.z]}>
          <mesh position={[0, 0.9, 0]}>
            <boxGeometry args={[0.09, 1.8, 0.09]} />
            <meshStandardMaterial color="#232e63" />
          </mesh>
          <mesh position={[0, 1.85, 0]}>
            <boxGeometry args={[0.22, 0.24, 0.22]} />
            <meshStandardMaterial color="#ffd93d" emissive="#ffd93d" emissiveIntensity={0.8} />
          </mesh>
        </group>
      ))}

      {/* swing set — the swings actually swing */}
      <group position={[swingSpot.x, 0, swingSpot.z]} rotation={[0, swingSpot.yaw, 0]}>
        {[-0.8, 0.8].map((x) => (
          <mesh key={x} position={[x, 0.75, 0]}>
            <boxGeometry args={[0.1, 1.5, 0.1]} />
            <meshStandardMaterial color="#4db3ff" />
          </mesh>
        ))}
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[1.8, 0.1, 0.1]} />
          <meshStandardMaterial color="#4db3ff" />
        </mesh>
        {[-0.4, 0.4].map((x, i) => (
          <group key={x} position={[x, 1.45, 0]} ref={(el) => (swings.current[i] = el)}>
            {[-0.12, 0.12].map((rx) => (
              <mesh key={rx} position={[rx, -0.5, 0]}>
                <boxGeometry args={[0.03, 1.0, 0.03]} />
                <meshStandardMaterial color="#c0c6e8" />
              </mesh>
            ))}
            <mesh position={[0, -1.02, 0]}>
              <boxGeometry args={[0.34, 0.05, 0.18]} />
              <meshStandardMaterial color="#ff5d5d" />
            </mesh>
          </group>
        ))}
      </group>

      {/* slide */}
      <group position={[slideSpot.x, 0, slideSpot.z]} rotation={[0, slideSpot.yaw + 0.6, 0]}>
        <mesh position={[0.55, 0.5, 0]}>
          <boxGeometry args={[0.1, 1.0, 0.5]} />
          <meshStandardMaterial color="#c0c6e8" />
        </mesh>
        <mesh position={[-0.25, 0.5, 0]} rotation={[0, 0, 0.62]}>
          <boxGeometry args={[1.5, 0.07, 0.5]} />
          <meshStandardMaterial color="#ffd93d" />
        </mesh>
        <mesh position={[0.55, 1.05, 0]}>
          <boxGeometry args={[0.5, 0.06, 0.5]} />
          <meshStandardMaterial color="#ff8a3d" />
        </mesh>
      </group>
    </group>
  )
}

const GONDOLA_COLORS = ['#ff5d5d', '#ffd93d', '#39ff88', '#a06bff', '#4db3ff', '#ff8a3d', '#ff8fb0', '#e6e9ff']
const WHEEL_R = 3.1

/** 🎡 Fun in the open bands the bigger loop created: a ferris wheel on the
 * playground side, a hot-air balloon overhead, kite-flying kids and a mango
 * grove on the Round-1 meadow, and a rickshaw doing laps of the inner ring.
 * Mobile keeps the two big-silhouette pieces (wheel + balloon). */
function FunSpots({ mobile }) {
  const wheel = useRef()
  const gondolas = useRef([])
  const balloon = useRef()
  const rickshaw = useRef()
  const kites = useRef([])

  const wheelSpot = useMemo(() => circlePoint(0.49, 21), [])
  const kiteSpots = useMemo(
    () => [
      { p: circlePoint(0.165, 30), shirt: '#ffd93d', kite: '#ff5d5d' },
      { p: circlePoint(0.195, 29), shirt: '#39ff88', kite: '#a06bff' },
    ],
    []
  )
  // 🥭 the mango grove — Chapainawabganj comes to the meadow (1 draw call)
  const grove = useMemo(() => {
    const items = []
    for (let i = 0; i < 5; i++) {
      const p = circlePoint(0.065 + i * 0.012, 29 + seeded(i + 500) * 2.5)
      const h = 1.1 + seeded(i + 501) * 0.5
      items.push({ pos: [p.x, h / 2, p.z], scale: [0.16, h, 0.16], color: '#6b4f2a' })
      items.push({ pos: [p.x, h + 0.5, p.z], scale: [1.15, 1.0, 1.15], color: '#2c8f55' })
      items.push({ pos: [p.x + 0.35, h + 0.28, p.z + 0.3], scale: [0.16, 0.16, 0.16], color: '#ff8a3d' })
      items.push({ pos: [p.x - 0.3, h + 0.18, p.z - 0.25], scale: [0.16, 0.16, 0.16], color: '#ffd93d' })
    }
    return items
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    // the wheel turns; gondolas ride the rim but stay level
    const spin = t * 0.28
    if (wheel.current) wheel.current.rotation.z = spin
    gondolas.current.forEach((g, i) => {
      if (!g) return
      const a = spin + (i / GONDOLA_COLORS.length) * TAU
      g.position.set(-Math.sin(a) * WHEEL_R, 4.1 + Math.cos(a) * WHEEL_R, 0)
    })
    // the balloon drifts a lazy circle over the meadow
    if (balloon.current) {
      const p = circlePoint((t * 0.006) % 1, 27)
      balloon.current.position.set(p.x, 11.5 + Math.sin(t * 0.5) * 0.8, p.z)
      balloon.current.rotation.y = t * 0.05
    }
    // the rickshaw laps the inner ring against the flow of the cars
    if (rickshaw.current) {
      const p = circlePoint(1 - ((t * 0.0075) % 1), 32)
      rickshaw.current.position.set(p.x, 0, p.z)
      rickshaw.current.rotation.y = p.yaw + Math.PI
    }
    // kites tug at their strings in the wind
    kites.current.forEach((k, i) => {
      if (k) k.rotation.z = Math.sin(t * (0.7 + i * 0.2) + i * 2) * 0.2
    })
  })

  return (
    <group>
      {/* 🎡 ferris wheel */}
      <group position={[wheelSpot.x, 0, wheelSpot.z]} rotation={[0, wheelSpot.yaw, 0]}>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0, 2.05, s * 0.55]} rotation={[s * 0.24, 0, 0]}>
            <boxGeometry args={[0.24, 4.4, 0.24]} />
            <meshStandardMaterial color="#232e63" />
          </mesh>
        ))}
        <group position={[0, 4.1, 0]}>
          <mesh>
            <boxGeometry args={[0.32, 0.32, 0.55]} />
            <meshStandardMaterial color="#ffd93d" emissive="#ffd93d" emissiveIntensity={0.45} />
          </mesh>
          <group ref={wheel}>
            {[0, 1, 2, 3].map((i) => (
              <mesh key={i} rotation={[0, 0, (i / 4) * Math.PI]}>
                <boxGeometry args={[0.09, WHEEL_R * 2, 0.09]} />
                <meshStandardMaterial color="#c0c6e8" emissive="#c0c6e8" emissiveIntensity={0.15} />
              </mesh>
            ))}
          </group>
        </group>
        {GONDOLA_COLORS.map((c, i) => (
          <group key={c} ref={(el) => (gondolas.current[i] = el)}>
            <mesh position={[0, -0.2, 0]}>
              <boxGeometry args={[0.44, 0.38, 0.36]} />
              <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.3} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 🎈 hot-air balloon */}
      <group ref={balloon}>
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.6, 0.5, 0.6]} />
          <meshStandardMaterial color="#6b4f2a" />
        </mesh>
        {[[-0.24, -0.24], [0.24, -0.24], [-0.24, 0.24], [0.24, 0.24]].map(([x, z], i) => (
          <mesh key={i} position={[x, 1.05, z]}>
            <boxGeometry args={[0.04, 1.2, 0.04]} />
            <meshStandardMaterial color="#c0c6e8" />
          </mesh>
        ))}
        <mesh position={[0, 1.95, 0]}>
          <boxGeometry args={[1.05, 0.6, 1.05]} />
          <meshStandardMaterial color="#ff8a3d" emissive="#ff8a3d" emissiveIntensity={0.18} />
        </mesh>
        <mesh position={[0, 2.95, 0]}>
          <boxGeometry args={[1.85, 1.5, 1.85]} />
          <meshStandardMaterial color="#ff5d5d" emissive="#ff5d5d" emissiveIntensity={0.18} />
        </mesh>
        <mesh position={[0, 3.95, 0]}>
          <boxGeometry args={[1.2, 0.55, 1.2]} />
          <meshStandardMaterial color="#ffd93d" emissive="#ffd93d" emissiveIntensity={0.18} />
        </mesh>
      </group>

      {!mobile && (
        <>
          {/* 🪁 kite kids on the meadow */}
          {kiteSpots.map(({ p, shirt, kite }, i) => (
            <group key={i} position={[p.x, 0, p.z]} rotation={[0, seeded(i + 600) * TAU, 0]}>
              <mesh position={[0, 0.15, 0]}>
                <boxGeometry args={[0.2, 0.3, 0.15]} />
                <meshStandardMaterial color="#22306e" />
              </mesh>
              <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[0.34, 0.42, 0.22]} />
                <meshStandardMaterial color={shirt} />
              </mesh>
              <mesh position={[0, 0.85, 0]}>
                <boxGeometry args={[0.26, 0.26, 0.24]} />
                <meshStandardMaterial color="#e8b17e" />
              </mesh>
              {/* string + kite sway together around the kid's hand */}
              <group ref={(el) => (kites.current[i] = el)}>
                <mesh position={[0.55, 2.1, 0]} rotation={[0, 0, -0.39]}>
                  <boxGeometry args={[0.025, 2.5, 0.025]} />
                  <meshStandardMaterial color="#e6e9ff" transparent opacity={0.7} />
                </mesh>
                <mesh position={[1.0, 3.3, 0]} rotation={[0, 0, Math.PI / 4]}>
                  <boxGeometry args={[0.55, 0.55, 0.04]} />
                  <meshStandardMaterial color={kite} emissive={kite} emissiveIntensity={0.25} />
                </mesh>
                <mesh position={[0.82, 2.85, 0]} rotation={[0, 0, 0.5]}>
                  <boxGeometry args={[0.12, 0.12, 0.03]} />
                  <meshStandardMaterial color="#ffd93d" />
                </mesh>
                <mesh position={[0.7, 2.62, 0]} rotation={[0, 0, -0.4]}>
                  <boxGeometry args={[0.1, 0.1, 0.03]} />
                  <meshStandardMaterial color="#e6e9ff" />
                </mesh>
              </group>
            </group>
          ))}

          <Boxes items={grove} />

          {/* 🛺 the rickshaw — no Bangladeshi city is complete without one */}
          <group ref={rickshaw}>
            <mesh position={[0, 0.38, 0]}>
              <boxGeometry args={[0.7, 0.08, 1.35]} />
              <meshStandardMaterial color="#181c33" />
            </mesh>
            <mesh position={[0, 0.62, -0.3]}>
              <boxGeometry args={[0.62, 0.4, 0.4]} />
              <meshStandardMaterial color="#4db3ff" />
            </mesh>
            {/* the hand-painted hood */}
            <mesh position={[0, 1.05, -0.42]} rotation={[-0.35, 0, 0]}>
              <boxGeometry args={[0.68, 0.5, 0.08]} />
              <meshStandardMaterial color="#ff5d5d" emissive="#ff5d5d" emissiveIntensity={0.15} />
            </mesh>
            <mesh position={[0, 1.28, -0.28]}>
              <boxGeometry args={[0.7, 0.08, 0.5]} />
              <meshStandardMaterial color="#ffd93d" emissive="#ffd93d" emissiveIntensity={0.2} />
            </mesh>
            {/* saddle + handlebar for the (invisible, resting) driver */}
            <mesh position={[0, 0.66, 0.3]}>
              <boxGeometry args={[0.16, 0.1, 0.16]} />
              <meshStandardMaterial color="#6b4f2a" />
            </mesh>
            <mesh position={[0, 0.78, 0.58]}>
              <boxGeometry args={[0.5, 0.06, 0.06]} />
              <meshStandardMaterial color="#c0c6e8" />
            </mesh>
            {/* wheels: two back, one front */}
            {[[-0.38, -0.35], [0.38, -0.35], [0, 0.6]].map(([x, z], i) => (
              <mesh key={i} position={[x, 0.28, z]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.28, 0.28, 0.06, 12]} />
                <meshStandardMaterial color="#232e63" />
              </mesh>
            ))}
          </group>
        </>
      )}
    </group>
  )
}

/** ⚽ Camp Nou — a voxel homage to Barcelona's cathedral of football,
 * standing outside the loop where Round 2 begins. Blaugrana tiers, green
 * pitch, four floodlight towers and a crowd of sparkles. */
function Stadium() {
  const spot = circlePoint(0.5, LOOP_RADIUS + 16)
  const faceCity = Math.atan2(LOOP_CENTER.x - spot.x, LOOP_CENTER.z - spot.z)
  const lights = useRef([])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    lights.current.forEach((l, i) => {
      if (l) l.material.emissiveIntensity = 0.75 + Math.sin(t * 2.2 + i * 1.6) * 0.25
    })
  })

  const BLAU = '#004d98'
  const GRANA = '#a50044'

  return (
    <group position={[spot.x, 0, spot.z]} rotation={[0, faceCity, 0]}>
      {/* stands: three oval blaugrana tiers + dark outer shell */}
      {[
        { rx: 5.6, rz: 4.4, y: 0.55, h: 1.1, color: GRANA },
        { rx: 6.3, rz: 5.0, y: 1.35, h: 1.3, color: BLAU },
        { rx: 7.0, rz: 5.6, y: 2.25, h: 1.5, color: GRANA },
      ].map((tier, i) => (
        <mesh key={i} position={[0, tier.y, 0]} scale={[tier.rx, 1, tier.rz]}>
          <cylinderGeometry args={[1, 1, tier.h, 28, 1, true]} />
          <meshStandardMaterial color={tier.color} side={2} />
        </mesh>
      ))}
      <mesh position={[0, 1.6, 0]} scale={[7.4, 1, 6.0]}>
        <cylinderGeometry args={[1, 1, 3.2, 28, 1, true]} />
        <meshStandardMaterial color="#14204a" side={2} transparent opacity={0.9} />
      </mesh>

      {/* the pitch */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[8.2, 0.08, 5.6]} />
        <meshStandardMaterial color="#1e7d3c" />
      </mesh>
      {/* halfway line + center circle + goals */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.08, 0.02, 5.2]} />
        <meshStandardMaterial color="#e6e9ff" />
      </mesh>
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.9, 0.04, 6, 24]} />
        <meshStandardMaterial color="#e6e9ff" />
      </mesh>
      {[-3.7, 3.7].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[0.08, 0.9, 1.6]} />
            <meshStandardMaterial color="#e6e9ff" emissive="#e6e9ff" emissiveIntensity={0.15} />
          </mesh>
        </group>
      ))}
      {/* the ball, waiting at the center spot */}
      <mesh position={[0, 0.22, 0]}>
        <sphereGeometry args={[0.16, 10, 8]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>

      {/* four floodlight towers */}
      {[[-6.4, -4.9], [6.4, -4.9], [-6.4, 4.9], [6.4, 4.9]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 2.6, 0]}>
            <boxGeometry args={[0.16, 5.2, 0.16]} />
            <meshStandardMaterial color="#232e63" />
          </mesh>
          <mesh ref={(el) => (lights.current[i] = el)} position={[0, 5.35, 0]} rotation={[0.5, Math.atan2(-x, -z), 0]}>
            <boxGeometry args={[0.9, 0.5, 0.12]} />
            <meshStandardMaterial color="#fffbe6" emissive="#fffbe6" emissiveIntensity={0.9} />
          </mesh>
        </group>
      ))}

      {/* the crowd */}
      <Sparkles count={40} scale={[11, 2.2, 9]} position={[0, 2.2, 0]} size={1.6} speed={0.15} color="#ffd93d" />

      {/* name board facing the city */}
      <mesh position={[0, 4.3, 5.9]}>
        <boxGeometry args={[6.4, 1.0, 0.15]} />
        <meshStandardMaterial color="#0b1026" />
      </mesh>
      <Html
        transform
        position={[0, 4.3, 6.0]}
        distanceFactor={7}
        style={{ pointerEvents: 'none' }}
        zIndexRange={[5, 0]}
      >
        <div className="w-[240px] select-none text-center">
          <p className="font-pixel text-[13px] tracking-wide">
            <span style={{ color: '#004d98' }}>CAMP</span>{' '}
            <span style={{ color: '#a50044' }}>NOU</span>
          </p>
          <p className="mt-0.5 font-pixel text-[7px] text-[#ffd93d]">⚽ BARCELONA · MÉS QUE UN CLUB</p>
        </div>
      </Html>
    </group>
  )
}

/** 🇧🇩 Seven Bangladeshi landmarks stand OUTSIDE the ring road like the
 * stadium does — spaced around the outskirts, each facing the city. Labels
 * scale with distance and only mount when the hero is near — the skyline
 * stays clean instead of wearing eight name tags at once. */
function Landmark({ u, radius, label, children, mobile, s = 1.0 }) {
  const p = circlePoint(u, radius)
  const faceCity = Math.atan2(LOOP_CENTER.x - p.x, LOOP_CENTER.z - p.z)
  const labelVisible = useNearCamera(p.x, p.z, 46, 54)
  return (
    <group position={[p.x, 0, p.z]} rotation={[0, faceCity, 0]} scale={[s, s, s]}>
      {children}
      {!mobile && labelVisible && (
        <Html center position={[0, 9, 0]} distanceFactor={24} style={{ pointerEvents: 'none' }} zIndexRange={[8, 0]}>
          <span className="whitespace-nowrap border-2 border-panel-2 bg-night/90 px-2 py-1 font-pixel text-[9px] text-ink">
            {label}
          </span>
        </Html>
      )}
    </group>
  )
}

function BangladeshLandmarks({ mobile }) {
  const S = 1 // per-landmark scale now lives on <Landmark s={…}>
  return (
    <group>
      {/* ✈️ Hazrat Shahjalal International Airport — Terminal 3 */}
      <Landmark u={0.40} radius={LOOP_RADIUS + 20} s={0.9} label="✈️ Shahjalal Int'l Airport · Dhaka" mobile={mobile}>
        <group scale={[S, S, S]}>
          <mesh position={[0, 1.6, 0]}>
            <boxGeometry args={[14, 3, 4]} />
            <meshStandardMaterial color="#2456a0" emissive="#4db3ff" emissiveIntensity={0.28} />
          </mesh>
          {/* the golden lattice canopy */}
          <mesh position={[0, 3.4, 0.4]}>
            <boxGeometry args={[16.5, 0.55, 5.6]} />
            <meshStandardMaterial color="#d9a441" emissive="#d9a441" emissiveIntensity={0.18} />
          </mesh>
          {[-6, -3, 0, 3, 6].map((x) => (
            <mesh key={x} position={[x, 1.4, 2.35]}>
              <boxGeometry args={[0.45, 2.8, 0.45]} />
              <meshStandardMaterial color="#e8e2d4" />
            </mesh>
          ))}
          {/* a plane on the apron */}
          <group position={[9.5, 0.5, 1]} rotation={[0, 0.6, 0]}>
            <mesh>
              <boxGeometry args={[0.5, 0.5, 2.6]} />
              <meshStandardMaterial color="#f2f4ff" />
            </mesh>
            <mesh>
              <boxGeometry args={[2.6, 0.08, 0.5]} />
              <meshStandardMaterial color="#c9cede" />
            </mesh>
            <mesh position={[0, 0.35, -1.15]}>
              <boxGeometry args={[0.08, 0.7, 0.5]} />
              <meshStandardMaterial color="#ff5d5d" />
            </mesh>
          </group>
        </group>
      </Landmark>

      {/* 🏛️ Jatiya Sangsad Bhaban — Louis Kahn's parliament on its lake */}
      <Landmark u={0.30} radius={LOOP_RADIUS + 18} label="🏛️ Jatiya Sangsad Bhaban" mobile={mobile}>
        <group scale={[S, S, S]}>
          {/* green lawns, then the teal lake — like the aerial photo */}
          <mesh position={[0, 0.03, 0]}>
            <cylinderGeometry args={[10.5, 10.5, 0.06, 24]} />
            <meshStandardMaterial color="#1f7a44" />
          </mesh>
          <mesh position={[0, 0.09, 0]}>
            <cylinderGeometry args={[8, 8, 0.12, 24]} />
            <meshStandardMaterial color="#17808f" emissive="#2ec4d6" emissiveIntensity={0.22} />
          </mesh>
          {/* the brick-red masses of the Sangsad complex */}
          <mesh position={[0, 2.6, 0]}>
            <cylinderGeometry args={[2.4, 2.4, 5.2, 8]} />
            <meshStandardMaterial color="#a8503a" flatShading />
          </mesh>
          {[0, 1, 2, 3].map((i) => {
            const a = (i / 4) * TAU + Math.PI / 4
            return (
              <mesh key={i} position={[Math.sin(a) * 3.6, 2, Math.cos(a) * 3.6]}>
                <cylinderGeometry args={[1.3, 1.3, 4, 10]} />
                <meshStandardMaterial color="#96452f" flatShading />
              </mesh>
            )
          })}
          {[0, 1, 2, 3].map((i) => {
            const a = (i / 4) * TAU
            return (
              <mesh key={i} position={[Math.sin(a) * 3.8, 1.8, Math.cos(a) * 3.8]}>
                <boxGeometry args={[2.4, 3.6, 2.4]} />
                <meshStandardMaterial color="#a8503a" />
              </mesh>
            )
          })}
          {/* the great circular openings */}
          <mesh position={[0, 2.4, 3.95]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.9, 0.9, 0.1, 16]} />
            <meshStandardMaterial color="#181c33" />
          </mesh>
        </group>
      </Landmark>

      {/* 🕌 Choto Sona Mosque — the pride of Chapainawabganj */}
      <Landmark u={0.13} radius={LOOP_RADIUS + 18} label="🕌 Choto Sona Mosque · Chapainawabganj" mobile={mobile}>
        <group scale={[S, S, S]}>
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[9.5, 0.3, 7]} />
            <meshStandardMaterial color="#d8c9a8" />
          </mesh>
          <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[7, 2.6, 4.6]} />
            <meshStandardMaterial color="#4a4a52" />
          </mesh>
          {/* golden domes, 2×4 */}
          {[0, 1, 2, 3].map((c) =>
            [0, 1].map((r) => (
              <mesh key={`${c}-${r}`} position={[-2.4 + c * 1.6, 2.9, -0.9 + r * 1.8]}>
                <sphereGeometry args={[0.62, 10, 8]} />
                <meshStandardMaterial color="#cf9a4e" emissive="#cf9a4e" emissiveIntensity={0.2} flatShading />
              </mesh>
            ))
          )}
          {/* corner turrets */}
          {[[-3.5, -2.3], [3.5, -2.3], [-3.5, 2.3], [3.5, 2.3]].map(([x, z], i) => (
            <mesh key={i} position={[x, 1.7, z]}>
              <cylinderGeometry args={[0.32, 0.38, 3.4, 8]} />
              <meshStandardMaterial color="#3d3d45" />
            </mesh>
          ))}
          {/* arched doorways */}
          {[-1.6, 0, 1.6].map((x) => (
            <mesh key={x} position={[x, 1.1, 2.32]}>
              <boxGeometry args={[0.8, 1.7, 0.06]} />
              <meshStandardMaterial color="#181c33" />
            </mesh>
          ))}
        </group>
      </Landmark>

      {/* 🗼 Jatiyo Smriti Soudho — the Martyrs' Memorial spire */}
      <Landmark u={0.57} radius={LOOP_RADIUS + 18} label="🗼 Jatiyo Smriti Soudho · Savar" mobile={mobile}>
        <group scale={[S, S, S]}>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[12, 0.2, 10]} />
            <meshStandardMaterial color="#1f7a44" />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[10, 0.3, 8]} />
            <meshStandardMaterial color="#b53a2a" />
          </mesh>
          {[
            { h: 3.5, z: 2.4 },
            { h: 5.5, z: 1.5 },
            { h: 7.5, z: 0.6 },
            { h: 10, z: -0.5 },
          ].map((t, i) => (
            <mesh key={i} position={[0, t.h / 2 + 0.4, t.z]} scale={[1, 1, 0.16]}>
              <coneGeometry args={[t.h * 0.42, t.h, 4]} />
              <meshStandardMaterial color="#eef1f7" flatShading />
            </mesh>
          ))}
        </group>
      </Landmark>

      {/* 🌅 Shaheed Minar — the Language Martyrs' Memorial */}
      <Landmark u={0.85} radius={LOOP_RADIUS + 16} label="🌅 Shaheed Minar · ২১শে ফেব্রুয়ারি" mobile={mobile}>
        <group scale={[S, S, S]}>
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[10, 0.5, 6]} />
            <meshStandardMaterial color="#e8e2d4" />
          </mesh>
          {/* the red sun */}
          <mesh position={[0, 3.6, -1.2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.7, 1.7, 0.12, 20]} />
            <meshStandardMaterial color="#f42a41" emissive="#f42a41" emissiveIntensity={0.4} />
          </mesh>
          {/* outer columns */}
          {[[-3.6, 2.6], [-1.9, 3.3], [1.9, 3.3], [3.6, 2.6]].map(([x, h], i) => (
            <mesh key={i} position={[x, h / 2 + 0.5, 0]}>
              <boxGeometry args={[0.9, h, 0.35]} />
              <meshStandardMaterial color="#f4f6ff" />
            </mesh>
          ))}
          {/* the bowing mother — center column with tilted head */}
          <mesh position={[0, 2.5, 0]}>
            <boxGeometry args={[1.1, 4, 0.35]} />
            <meshStandardMaterial color="#f4f6ff" />
          </mesh>
          <mesh position={[0, 4.6, 0.4]} rotation={[0.5, 0, 0]}>
            <boxGeometry args={[1.1, 1.6, 0.3]} />
            <meshStandardMaterial color="#f4f6ff" />
          </mesh>
        </group>
      </Landmark>

      {/* 🎓 AIUB — the glass sphere where the coding began */}
      <Landmark u={0.21} radius={LOOP_RADIUS + 16} label="🎓 AIUB — my university" mobile={mobile}>
        <group scale={[S, S, S]}>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[12, 0.2, 8]} />
            <meshStandardMaterial color="#1e5c38" />
          </mesh>
          {/* the sphere */}
          <mesh position={[-3, 2.5, 0.5]}>
            <sphereGeometry args={[2.3, 16, 12]} />
            <meshStandardMaterial color="#5fb3ec" emissive="#4db3ff" emissiveIntensity={0.45} flatShading />
          </mesh>
          <mesh position={[-3, 0.6, 0.5]}>
            <cylinderGeometry args={[1.2, 1.5, 1.2, 10]} />
            <meshStandardMaterial color="#c9cede" />
          </mesh>
          {/* the academic building with garden balconies */}
          <mesh position={[2.8, 2.1, -0.5]}>
            <boxGeometry args={[5.5, 4, 3]} />
            <meshStandardMaterial color="#3b5a8f" emissive="#4db3ff" emissiveIntensity={0.12} />
          </mesh>
          {[0.8, 2, 3.2].map((y) => (
            <mesh key={y} position={[2.8, y, 1.05]}>
              <boxGeometry args={[5.5, 0.18, 0.15]} />
              <meshStandardMaterial color="#2fae62" />
            </mesh>
          ))}
          {/* the football field out front */}
          <mesh position={[1.5, 0.22, 2.6]}>
            <boxGeometry args={[4.5, 0.06, 2.4]} />
            <meshStandardMaterial color="#1e7d3c" />
          </mesh>
        </group>
      </Landmark>

      {/* 🏫 Harimohan Government High School — where it all started */}
      <Landmark u={0.05} radius={LOOP_RADIUS + 16} label="🏫 Harimohan Govt. High School — my school" mobile={mobile}>
        <group scale={[S, S, S]}>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[13, 0.2, 8]} />
            <meshStandardMaterial color="#1f7a44" />
          </mesh>
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[11, 0.3, 6]} />
            <meshStandardMaterial color="#d8c9a8" />
          </mesh>
          <mesh position={[0, 1.6, 0]}>
            <boxGeometry args={[9, 2.4, 3]} />
            <meshStandardMaterial color="#c04a30" />
          </mesh>
          <mesh position={[0, 3.0, 0]}>
            <boxGeometry args={[9.6, 0.5, 3.6]} />
            <meshStandardMaterial color="#8a3520" />
          </mesh>
          {/* arched white verandah */}
          {[-3.2, -1.6, 0, 1.6, 3.2].map((x) => (
            <mesh key={x} position={[x, 1.3, 1.55]}>
              <boxGeometry args={[0.9, 1.8, 0.1]} />
              <meshStandardMaterial color="#f4f6ff" />
            </mesh>
          ))}
          {/* flag of Bangladesh */}
          <group position={[5.2, 0, 1.5]}>
            <mesh position={[0, 2.2, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 4.4, 6]} />
              <meshStandardMaterial color="#c9cede" />
            </mesh>
            <mesh position={[0.55, 3.9, 0]}>
              <boxGeometry args={[1.1, 0.7, 0.04]} />
              <meshStandardMaterial color="#006a4e" />
            </mesh>
            <mesh position={[0.5, 3.9, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.22, 0.22, 0.03, 14]} />
              <meshStandardMaterial color="#f42a41" />
            </mesh>
          </group>
        </group>
      </Landmark>
    </group>
  )
}

/** 🚆 The elevated train line: a viaduct ring OUTSIDE the city (over the
 * suburbs, rivers and beach edge) with a green train forever circling. */
const RAIL_R = LOOP_RADIUS + 9
const RAIL_Y = 2.75

/** One train car: body, lit window band, headlight on the engine. */
function TrainCar({ cfg, carRef }) {
  return (
    <group ref={carRef}>
      <mesh castShadow>
        <boxGeometry args={[0.85, 0.85, cfg.len]} />
        <meshStandardMaterial color={cfg.color} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.87, 0.28, cfg.len * 0.82]} />
        <meshStandardMaterial color="#ffd93d" emissive="#ffd93d" emissiveIntensity={0.5} />
      </mesh>
      {cfg.engine && (
        <mesh position={[0, -0.1, cfg.len / 2 + 0.02]}>
          <boxGeometry args={[0.5, 0.2, 0.05]} />
          <meshStandardMaterial color="#fffbe6" emissive="#fffbe6" emissiveIntensity={1.2} />
        </mesh>
      )}
    </group>
  )
}

function TrainLine({ mobile }) {
  const cars = useMemo(
    // two-tone in the colors of the Bangladesh flag: bottle green + the red
    // of the rising sun, alternating car by car 🇧🇩
    () => [
      { len: 2.3, color: '#006a4e', engine: true },
      { len: 2.1, color: '#f42a41' },
      { len: 2.1, color: '#006a4e' },
      { len: 2.1, color: '#f42a41' },
    ],
    []
  )
  const carRefs = useRef([])

  const pillars = useMemo(() => {
    const list = []
    const count = mobile ? 20 : 30
    const uDist = (a, b) => {
      const d = Math.abs(a - b) % 1
      return Math.min(d, 1 - d)
    }
    for (let i = 0; i < count; i++) {
      const u = i / count
      // no pillar may spear a footbridge — shift it aside instead
      const clash = RIVERS.find((r) => uDist(u, r.bridgeU) < 0.028)
      const uSafe = clash ? clash.bridgeU + (u >= clash.bridgeU ? 0.03 : -0.03) : u
      const p = circlePoint(uSafe, RAIL_R)
      list.push({ pos: [p.x, RAIL_Y / 2, p.z], scale: [0.38, RAIL_Y, 0.38], color: '#1d2650' })
    }
    return list
  }, [mobile])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const head = (t / 85) % 1 // one lap ≈ 85s — a calm commuter, not an express
    const gap = 2.55 / (TAU * RAIL_R) // car spacing along the arc
    carRefs.current.forEach((c, i) => {
      if (!c) return
      const p = circlePoint(head - i * gap, RAIL_R)
      c.position.set(p.x, RAIL_Y + 0.62, p.z)
      c.rotation.y = p.yaw
    })
  })

  return (
    <group>
      {/* track bed + twin rails (full rings, 3 draw calls) */}
      <mesh position={[LOOP_CENTER.x, RAIL_Y, LOOP_CENTER.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[RAIL_R - 0.75, RAIL_R + 0.75, 96]} />
        <meshStandardMaterial color="#1d2650" side={2} />
      </mesh>
      {[RAIL_R - 0.35, RAIL_R + 0.35].map((r) => (
        <mesh key={r} position={[LOOP_CENTER.x, RAIL_Y + 0.05, LOOP_CENTER.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r - 0.07, r + 0.07, 96]} />
          <meshStandardMaterial color="#c0c6e8" emissive="#c0c6e8" emissiveIntensity={0.25} side={2} />
        </mesh>
      ))}
      <Boxes items={pillars} />

      {/* the train */}
      {cars.map((cfg, i) => (
        <TrainCar key={i} cfg={cfg} carRef={(el) => (carRefs.current[i] = el)} />
      ))}
    </group>
  )
}

/** Sky: a few clouds drifting over the city (white by day, dim by night). */
function SkyLife({ mobile, cloudColor, cloudOpacity }) {
  const cloudGroup = useRef()

  const clouds = useMemo(() => {
    const list = []
    const count = mobile ? 3 : 5
    for (let i = 0; i < count; i++) {
      list.push({
        key: i,
        pos: [0, 14 + seeded(i + 41) * 5, LOOP_CENTER.z + (seeded(i + 42) - 0.5) * 64],
        w: 4 + seeded(i + 43) * 5,
        speed: 0.09 + seeded(i + 44) * 0.14,
      })
    }
    return list
  }, [mobile])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    cloudGroup.current?.children.forEach((c, i) => {
      const cl = clouds[i]
      c.position.x = ((cl.pos[0] + t * cl.speed + 40) % 80) - 40
    })
  })

  return (
    <group ref={cloudGroup}>
      {clouds.map((cl) => (
        <group key={cl.key} position={cl.pos}>
          <mesh>
            <boxGeometry args={[cl.w, 0.55, 1.6]} />
            <meshStandardMaterial color={cloudColor} transparent opacity={cloudOpacity} />
          </mesh>
          <mesh position={[cl.w * 0.28, 0.4, 0]}>
            <boxGeometry args={[cl.w * 0.5, 0.45, 1.2]} />
            <meshStandardMaterial color={cloudColor} transparent opacity={cloudOpacity} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** A shooting star streaks across the sky every few seconds. */
function ShootingStar() {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    const cycle = 10
    const t = state.clock.elapsedTime % cycle
    if (t < 1.1) {
      const p = t / 1.1
      ref.current.visible = true
      ref.current.position.set(-24 + p * 48, 15 - p * 4, LOOP_CENTER.z - 18)
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

/** XP coins as ONE instanced mesh — spin, bob, collect, respawn per lap. */
function Coins({ tRef, mobile }) {
  const inst = useRef()
  const coins = useMemo(() => {
    const list = []
    const step = mobile ? 0.045 : 0.033 // keeps coin spacing steady on the longer road
    for (let t = 0.03; t < CLIFF_T - 0.01; t += step) {
      if (t > GAP_START - 0.02 && t < GAP_END + 0.01) continue
      const p = pathPoint(t)
      const off = (seeded(Math.round(t * 1000)) - 0.5) * 1.6
      list.push({ t, x: p.x + p.nx * off, z: p.z + p.nz * off })
    }
    return list
  }, [mobile])
  const collected = useRef(new Set())
  const m = useMemo(() => new THREE.Matrix4(), [])
  const q = useMemo(() => new THREE.Quaternion(), [])
  const e = useMemo(() => new THREE.Euler(), [])
  const v = useMemo(() => new THREE.Vector3(), [])
  const one = useMemo(() => new THREE.Vector3(0.32, 0.05, 0.32), [])
  const zero = useMemo(() => new THREE.Vector3(0, 0, 0), [])

  useFrame((state) => {
    if (!inst.current) return
    const time = state.clock.elapsedTime
    const heroT = tRef.current
    if (heroT < 0.015 && collected.current.size > 10) collected.current.clear()
    coins.forEach((c, i) => {
      const got = collected.current.has(i)
      if (!got && Math.abs(c.t - heroT) < 0.005) {
        collected.current.add(i)
        sfx.coin()
        gainXp(2, { silent: true })
      }
      q.setFromEuler(e.set(0, time * 3 + i, 0))
      v.set(c.x, 1.1 + Math.sin(time * 2 + i) * 0.1, c.z)
      m.compose(v, q, got ? zero : one)
      inst.current.setMatrixAt(i, m)
    })
    inst.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={inst} args={[undefined, undefined, coins.length]} frustumCulled={false}>
      <cylinderGeometry args={[0.5, 0.5, 1, 12]} />
      <meshStandardMaterial color="#ffd93d" emissive="#ffd93d" emissiveIntensity={0.6} />
    </instancedMesh>
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
        <planeGeometry args={[95, 95]} />
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

/** The cliff → fall → END bar (the START NOW button restarts the lap). */
function RespawnController({ tRef }) {
  const falling = useRef(false)
  useFrame(() => {
    const t = tRef.current
    if (!falling.current && t > CLIFF_T + 0.003) {
      falling.current = true
      sfx.error()
      setTimeout(() => {
        if (!falling.current) return // scrolled back before the fall finished
        gainXp(25, { silent: true })
        trackEvent('loop_completed')
        useUiStore.getState().setEndOpen(true)
      }, 1400)
    }
    if (falling.current && t < 0.5) {
      // scrolled back before the edge (or START NOW brought us home)
      falling.current = false
      useUiStore.getState().setEndOpen(false)
    }
  })
  return null
}

/** Camera: zoomed-out chase view — higher, further back, wider FOV. The
 * player's zoom (HUD 🔍 / pinch / Ctrl+scroll) scales the whole rig, and
 * the FOG LIFTS as you zoom out so the whole city becomes visible. */
function Rig({ progressRef, tRef, speedRef, mobile }) {
  const { camera, scene } = useThree()
  const smoothed = useRef(0)
  const fov = useRef(55)
  const zoomSmooth = useRef(1)
  const extra = useRef({ yaw: 0, pitch: 0 }) // eased gyro / pointer-parallax look
  const fogBase = mobile ? 80 : 112

  useFrame((state, delta) => {
    const target = progressRef.current
    const prev = smoothed.current
    const k = 1 - Math.exp(-delta * 5)
    smoothed.current = prev + (target - prev) * k
    speedRef.current = (smoothed.current - prev) * PATH_LENGTH * 0.6
    tRef.current = smoothed.current

    // ease toward the requested zoom
    const zoomTarget = useUiStore.getState().zoom
    zoomSmooth.current += (zoomTarget - zoomSmooth.current) * (1 - Math.exp(-delta * 6))
    const zoom = zoomSmooth.current

    const hero = pathPoint(smoothed.current)
    const cam = pathPoint(Math.max(0, smoothed.current - Math.max(0.028, 0.052 * zoom)))
    const time = state.clock.elapsedTime

    // ease the look-around back to center when the drag is released
    if (!look.active) {
      const decay = Math.exp(-delta * 4)
      look.yaw *= decay
      look.pitch *= decay
    }

    // the extra look layered on top of the drag: phone tilt while GYRO is
    // on, a gentle pointer parallax on desktop — always eased, never snaps
    const exYaw = look.gyro.on ? look.gyro.yaw : mobile ? 0 : -state.pointer.x * 0.22
    const exPitch = look.gyro.on ? look.gyro.pitch : mobile ? 0 : -state.pointer.y * 0.07
    const ek = 1 - Math.exp(-delta * 3)
    extra.current.yaw += (exYaw - extra.current.yaw) * ek
    extra.current.pitch += (exPitch - extra.current.pitch) * ek
    const lookYaw = look.yaw + extra.current.yaw
    const lookPitch = look.pitch + extra.current.pitch

    let cx = cam.x + cam.nx * 4.6 * zoom + Math.sin(time * 0.32) * 0.3
    let cz = cam.z + cam.nz * 4.6 * zoom
    // orbit the camera around the hero by the combined look yaw
    if (Math.abs(lookYaw) > 0.001) {
      const bx = cx - hero.x
      const bz = cz - hero.z
      const cos = Math.cos(lookYaw)
      const sin = Math.sin(lookYaw)
      cx = hero.x + bx * cos - bz * sin
      cz = hero.z + bx * sin + bz * cos
    }
    camera.position.set(
      cx,
      Math.max(2.2, Math.max(3.2, 6.2 * zoom) + Math.sin(time * 0.45) * 0.25 + lookPitch * 7),
      cz
    )
    // look a touch past the hero so more of the world stays in frame
    const ahead = pathPoint(Math.min(1, smoothed.current + 0.012))
    camera.lookAt((hero.x + ahead.x) / 2, 1.1 - lookPitch * 2.5, (hero.z + ahead.z) / 2)

    const targetFov = 55 + Math.min(1, Math.abs(speedRef.current) * 3) * 8
    fov.current += (targetFov - fov.current) * (1 - Math.exp(-delta * 4))
    if (Math.abs(camera.fov - fov.current) > 0.05) {
      camera.fov = fov.current
      camera.updateProjectionMatrix()
    }

    // lift the fog when zoomed out — the whole city deserves to be seen
    if (scene.fog) {
      const lift = Math.max(1, zoom)
      scene.fog.far = fogBase * lift
      scene.fog.near = 24 * lift
    }
  })
  return null
}

/**
 * The 3D mini-city world: a circular loop road through gardens, homes and
 * two rivers. Heavy repetition (flowers, trees, coins, hedges, reeds,
 * buildings) is GPU-instanced and shadows are off — smoothness first.
 */
export default function World({ progressRef, visitedIds, onOpenSection }) {
  const tRef = useRef(0)
  const speedRef = useRef(0)
  const mobile = typeof window !== 'undefined' && window.innerWidth < 640
  const theme = useUiStore((s) => s.theme)
  const T = THEMES[theme]

  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={[1, mobile ? 1.25 : 1.5]}
        camera={{ fov: 55, near: 0.1, far: 210, position: [0, 6.2, 10] }}
        gl={{ antialias: !mobile, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={[T.bg]} />
        <fog attach="fog" args={[T.bg, 24, mobile ? 80 : 112]} />

        <ambientLight intensity={T.ambient} />
        <directionalLight position={[46, 34, -40]} color={T.dirColor} intensity={T.dirIntensity} />
        {theme === 'night' && (
          <pointLight position={[LOOP_CENTER.x, 10, LOOP_CENTER.z]} intensity={22} color="#a06bff" />
        )}

        {theme === 'night' && (
          <Stars radius={120} depth={50} count={mobile ? 650 : 1300} factor={3.4} saturation={0.4} fade speed={0.9} />
        )}
        {theme === 'night' && <ShootingStar />}
        <Celestial theme={theme} />
        <Sparkles count={mobile ? 16 : 30} scale={[94, 10, 94]} position={[LOOP_CENTER.x, 4, LOOP_CENTER.z]} size={2} speed={0.3} color={theme === 'night' ? '#39ff88' : '#ffffff'} />

        <VoxelTerrain mobile={mobile} theme={theme} />

        <RingRoad />
        <MiniCity mobile={mobile} windowGlow={T.windowGlow} />
        <Homes mobile={mobile} />
        <People mobile={mobile} />
        {RIVERS.map((r) => (
          <River key={r.t1} t1={r.t1} t2={r.t2} bridgeU={r.bridgeU} />
        ))}
        <Garden />
        <Park />
        <FunSpots mobile={mobile} />
        <Beach />
        <Stadium />
        <Nature mobile={mobile} />
        <TrainLine mobile={mobile} />
        <BangladeshLandmarks mobile={mobile} />
        <SkyLife mobile={mobile} cloudColor={T.cloud} cloudOpacity={T.cloudOpacity} />
        <Coins tRef={tRef} mobile={mobile} />
        <ClickPing />
        <CheckpointChimes tRef={tRef} />
        <RespawnController tRef={tRef} />

        <Hero speedRef={speedRef} tRef={tRef} />
        <BugsyNpc tRef={tRef} />
        <Cat tRef={tRef} speedRef={speedRef} />
        <Checkpoints visitedIds={visitedIds} onOpen={onOpenSection} />
        <Signposts onOpen={onOpenSection} mobile={mobile} />
        <RoundGates />

        <Rig progressRef={progressRef} tRef={tRef} speedRef={speedRef} mobile={mobile} />
      </Canvas>
    </div>
  )
}
