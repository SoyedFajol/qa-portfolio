/** Pixel loading screen — Suspense fallback while the 3D chunk loads. */
export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center gap-6 bg-night">
      <p className="font-pixel text-sm text-neon">LOADING WORLD…</p>
      <div className="loading-bar" role="progressbar" aria-label="Loading">
        <div className="loading-bar-fill" />
      </div>
      <p className="font-body text-xs text-ink-dim">Compiling voxels · catching bugs 🐞</p>
    </div>
  )
}
