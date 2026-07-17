// Shared look-around state: written by pointer/touch listeners in App,
// read every frame by the camera rig. A plain mutable object keeps this
// out of React's render loop entirely.
export const look = {
  yaw: 0, // radians of orbit around the hero (drag left/right)
  pitch: 0, // -0.5..0.5 tilt (drag up/down)
  active: false, // true while the player is holding a drag
}
