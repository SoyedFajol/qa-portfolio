import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars, Sparkles } from '@react-three/drei'
import Hero from './Hero'
import BugsyNpc from './BugsyNpc'
import Checkpoints from './Checkpoints'
import Signposts from './Signposts'
import { PATH_LENGTH, seeded } from './constants'

/** Ground: a long voxel walkway with side tiles, plus floating decor cubes. */
function PathWorld({ mobile }) {
  const sideTiles = useMemo(() => {
    const tiles = []
    const count = mobile ? 26 : 48
    for (let i = 0; i < count; i++) {
      const z = -seeded(i) * (PATH_LENGTH + 10)
      const x = (seeded(i + 100) - 0.5) * 22
      if (Math.abs(x) < 2.2) continue // keep the walkway clear
      tiles.push({
        key: i,
        pos: [x, -0.3 + seeded(i + 200) * 0.25, z],
        size: 0.8 + seeded(i + 300) * 1.6,
        color: seeded(i + 400) > 0.66 ? '#1d2650' : seeded(i + 400) > 0.33 ? '#141b3c' : '#232e63',
      })
    }
    return tiles
  }, [mobile])

  const floaters = useMemo(() => {
    const cubes = []
    const count = mobile ? 8 : 16
    for (let i = 0; i < count; i++) {
      cubes.push({
        key: i,
        pos: [
          (seeded(i + 500) - 0.5) * 26,
          2.5 + seeded(i + 600) * 5,
          -seeded(i + 700) * PATH_LENGTH,
        ],
        size: 0.25 + seeded(i + 800) * 0.5,
        color: ['#39ff88', '#a06bff', '#ffd93d', '#ff8a3d'][i % 4],
        speed: 0.4 + seeded(i + 900) * 0.8,
      })
    }
    return cubes
  }, [mobile])

  const floatGroup = useRef()
  useFrame((state) => {
    if (!floatGroup.current) return
    const t = state.clock.elapsedTime
    floatGroup.current.children.forEach((c, i) => {
      const f = floaters[i]
      c.position.y = f.pos[1] + Math.sin(t * f.speed + i) * 0.4
      c.rotation.x = t * 0.2 * f.speed
      c.rotation.y = t * 0.3 * f.speed
    })
  })

  return (
    <group>
      {/* main walkway */}
      <mesh position={[0, -0.15, -PATH_LENGTH / 2]} receiveShadow>
        <boxGeometry args={[3.6, 0.3, PATH_LENGTH + 16]} />
        <meshStandardMaterial color="#2a356e" />
      </mesh>
      {/* walkway center stripe */}
      <mesh position={[0, 0.01, -PATH_LENGTH / 2]}>
        <boxGeometry args={[0.5, 0.02, PATH_LENGTH + 16]} />
        <meshStandardMaterial color="#39ff88" emissive="#39ff88" emissiveIntensity={0.25} />
      </mesh>

      {sideTiles.map((tile) => (
        <mesh key={tile.key} position={tile.pos}>
          <boxGeometry args={[tile.size, 0.3, tile.size]} />
          <meshStandardMaterial color={tile.color} />
        </mesh>
      ))}

      <group ref={floatGroup}>
        {floaters.map((f) => (
          <mesh key={f.key} position={f.pos}>
            <boxGeometry args={[f.size, f.size, f.size]} />
            <meshStandardMaterial color={f.color} emissive={f.color} emissiveIntensity={0.35} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/** Smoothly follows the scroll progress and drives hero + camera. */
function Rig({ progressRef, heroZRef, speedRef }) {
  const { camera } = useThree()
  const smoothed = useRef(0)

  useFrame((_, delta) => {
    const target = progressRef.current
    const prev = smoothed.current
    // critically-damped-ish lerp; frame-rate independent
    const k = 1 - Math.exp(-delta * 5)
    smoothed.current = prev + (target - prev) * k
    speedRef.current = (smoothed.current - prev) * PATH_LENGTH * 0.6

    const heroZ = -smoothed.current * PATH_LENGTH
    heroZRef.current = heroZ

    camera.position.set(4.6, 3.6, heroZ + 7.5)
    camera.lookAt(0, 1.2, heroZ - 2.5)
  })
  return null
}

/**
 * The 3D pixel world. Rendered fixed behind the scroll container; the page's
 * native scroll (progressRef 0..1) walks the hero down the path.
 */
export default function World({ progressRef, visitedIds, onOpenSection, onOpenChat }) {
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
        <fog attach="fog" args={['#0b1026', 14, mobile ? 34 : 48]} />

        <ambientLight intensity={0.55} />
        <directionalLight
          position={[6, 10, 4]}
          intensity={1.1}
          castShadow={!mobile}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-4, 3, -8]} intensity={12} color="#a06bff" />

        <Stars radius={70} depth={40} count={mobile ? 900 : 2200} factor={3} saturation={0.4} fade speed={0.6} />
        <Sparkles count={mobile ? 40 : 110} scale={[24, 8, 40]} position={[0, 3, -18]} size={2.2} speed={0.35} color="#39ff88" />

        <PathWorld mobile={mobile} />
        <Hero speedRef={speedRef} positionRef={heroZRef} />
        <BugsyNpc positionRef={heroZRef} onClick={onOpenChat} />
        <Checkpoints visitedIds={visitedIds} onOpen={onOpenSection} />
        <Signposts onOpen={onOpenSection} />

        <Rig progressRef={progressRef} heroZRef={heroZRef} speedRef={speedRef} />
      </Canvas>
    </div>
  )
}
