/** @type {import('tailwindcss').Config} */
// Colors reference the CSS variables declared in src/styles/index.css —
// that file is the palette's single source of truth. (Note: var()-based
// colors don't support Tailwind opacity modifiers like bg-neon/50; use
// explicit rgba in CSS if translucency is ever needed.)
export default {
  content: ['./index.html', './src/**/*.{js,jsx}', './lib/**/*.js'],
  theme: {
    extend: {
      colors: {
        night: 'var(--night)',
        panel: 'var(--panel)',
        'panel-2': 'var(--panel-2)',
        neon: 'var(--neon)',
        'pix-purple': 'var(--pix-purple)',
        'pix-yellow': 'var(--pix-yellow)',
        'pix-orange': 'var(--pix-orange)',
        danger: 'var(--danger)',
        ink: 'var(--ink)',
        'ink-dim': 'var(--ink-dim)',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
