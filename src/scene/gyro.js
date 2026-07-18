// Device-tilt look-around (the GYRO toggle on touch devices). Tilt the phone
// left/right to peek around the hero, forward/back to look up/down. Values
// land in the shared mutable `look` object; the camera rig eases toward them
// every frame, so nothing ever snaps.
//
// iOS 13+ only fires deviceorientation after an explicit permission grant,
// and the request MUST come from a user gesture — enableGyro is designed to
// be called from the toggle button's tap handler.
import { look } from './lookState'

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

// wherever the player holds the phone when enabling = the neutral pose
let base = null

function onOrientation(e) {
  if (e.beta == null || e.gamma == null) return
  if (base === null) base = { beta: e.beta, gamma: e.gamma }
  // portrait mapping: gamma = lean left/right, beta = tip forward/back
  look.gyro.yaw = clamp((e.gamma - base.gamma) * 0.022, -1.0, 1.0)
  look.gyro.pitch = clamp((e.beta - base.beta) * 0.011, -0.45, 0.45)
}

/** Start tilt look-around. Resolves false if the device refuses (no sensor
 * permission) so the caller can tell the player. */
export async function enableGyro() {
  try {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      if ((await DeviceOrientationEvent.requestPermission()) !== 'granted') return false
    }
  } catch {
    return false
  }
  base = null // re-center on every enable
  look.gyro.on = true
  window.addEventListener('deviceorientation', onOrientation)
  return true
}

export function disableGyro() {
  window.removeEventListener('deviceorientation', onOrientation)
  look.gyro.on = false
  look.gyro.yaw = 0
  look.gyro.pitch = 0 // rig eases the view back behind the hero
}
