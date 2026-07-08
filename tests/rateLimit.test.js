import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { rateLimit, clientIp } from '../lib/rateLimit.js'

describe('rateLimit — abuse caps on /api (gates A5, C2)', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('allows up to the limit, then blocks', () => {
    const key = `t1-${Date.now()}`
    for (let i = 0; i < 5; i++) {
      expect(rateLimit(key, { limit: 5, windowMs: 60_000 })).toBe(true)
    }
    expect(rateLimit(key, { limit: 5, windowMs: 60_000 })).toBe(false)
  })

  it('frees the bucket after the window passes', () => {
    const key = `t2-${Date.now()}`
    for (let i = 0; i < 3; i++) rateLimit(key, { limit: 3, windowMs: 1000 })
    expect(rateLimit(key, { limit: 3, windowMs: 1000 })).toBe(false)
    vi.advanceTimersByTime(1100)
    expect(rateLimit(key, { limit: 3, windowMs: 1000 })).toBe(true)
  })

  it('isolates keys — one abuser cannot exhaust another visitor', () => {
    const a = `t3a-${Date.now()}`
    const b = `t3b-${Date.now()}`
    for (let i = 0; i < 10; i++) rateLimit(a, { limit: 2, windowMs: 60_000 })
    expect(rateLimit(b, { limit: 2, windowMs: 60_000 })).toBe(true)
  })

  it('clientIp reads the first forwarded hop and survives missing headers', () => {
    expect(clientIp({ headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' } })).toBe('1.2.3.4')
    expect(clientIp({ headers: {} })).toBe('unknown')
  })
})
