import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'

/**
 * True while the camera is within `showAt` world units of (x, z). The wider
 * `hideAt` threshold adds hysteresis so a label doesn't flicker on the
 * boundary. Used to unmount far-away DOM labels: fewer live Html overlays
 * per frame is the single biggest smoothness win, and the nearest cards get
 * the screen to themselves instead of stacking on each other.
 */
export function useNearCamera(x, z, showAt = 30, hideAt = showAt + 5) {
  const [near, setNear] = useState(false)
  const nearRef = useRef(false)
  useFrame(({ camera }) => {
    const d = Math.hypot(camera.position.x - x, camera.position.z - z)
    const next = nearRef.current ? d < hideAt : d < showAt
    if (next !== nearRef.current) {
      nearRef.current = next
      setNear(next)
    }
  })
  return near
}
