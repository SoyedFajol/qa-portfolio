// Shared scene constants.
//
// V3: the world is a CIRCULAR loop road around a mini city (Soyed's sketch:
// "round one finish jump to round 2, and at the end fall off the cliff and
// start again"). Progress t (0..1) maps to a point on the ring.

export const LOOP_RADIUS = 26
export const LOOP_CENTER = { x: 0, z: -LOOP_RADIUS } // start point stays at origin
export const PATH_LENGTH = 2 * Math.PI * LOOP_RADIUS // ~132 world units walked per lap

// the walkway gap the hero must JUMP across into Round 2
export const GAP_START = 0.405
export const GAP_END = 0.425
// the cliff at the end of the lap — walk off, fall, respawn at start
export const CLIFF_T = 0.982

// the road is NOT a plain circle: it snakes আঁকাবাঁকা (left-right) around
// the circular city — radius wobbles ±WAVE_AMP over WAVES bends per lap
export const WAVE_AMP = 2.5
export const WAVES = 5

/** Point on the winding loop at progress t: position, outward unit normal
 * (perpendicular to travel), and the yaw that makes a group's local +z face
 * the direction of travel. */
export function pathPoint(t) {
  const a = t * Math.PI * 2
  const r = LOOP_RADIUS + WAVE_AMP * Math.sin(WAVES * a)
  const dr = WAVE_AMP * WAVES * Math.cos(WAVES * a) // dr/da
  const x = LOOP_CENTER.x + Math.sin(a) * r
  const z = LOOP_CENTER.z + Math.cos(a) * r
  // travel direction = d(pos)/da
  const dx = Math.cos(a) * r + Math.sin(a) * dr
  const dz = -Math.sin(a) * r + Math.cos(a) * dr
  const len = Math.hypot(dx, dz) || 1
  return {
    x,
    z,
    nx: -dz / len, // outward normal (unit), rotate travel dir −90°
    nz: dx / len,
    yaw: Math.atan2(dx, dz),
  }
}

/** Deterministic pseudo-random in [0,1) from an integer seed — keeps the
 * decorative layout stable across renders without Math.random(). */
export function seeded(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}
