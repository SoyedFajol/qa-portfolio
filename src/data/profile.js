// Frontend entry point for the shared profile data.
// The single source of truth lives in /lib/profile.js so the Vercel
// serverless functions in /api can import the exact same facts.
export * from '../../lib/profile.js'
