// Shared scene constants.
export const PATH_LENGTH = 120 // world units the hero walks over the full scroll

/** Deterministic pseudo-random in [0,1) from an integer seed — keeps the
 * decorative layout stable across renders without Math.random(). */
export function seeded(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}
