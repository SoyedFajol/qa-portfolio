import { describe, expect, it } from 'vitest'
import * as profileModule from '../lib/profile.js'

const { PROFILE } = profileModule
const serialized = JSON.stringify(profileModule)

describe('profile privacy — non-negotiable (gate B7)', () => {
  it('contains no phone-number-like data anywhere in the module', () => {
    // Bangladeshi mobile formats (+8801..., 01X-...) and generic long numbers
    expect(serialized).not.toMatch(/\+?880\s?1[0-9\s-]{7,}/)
    expect(serialized).not.toMatch(/\b01[3-9][0-9\s-]{7,}/)
    expect(serialized).not.toMatch(/\+\d{10,}/)
  })

  it('exposes no phone or home-address fields', () => {
    expect(serialized.toLowerCase()).not.toContain('"phone"')
    expect(serialized.toLowerCase()).not.toContain('homeaddress')
    expect(PROFILE.phone).toBeUndefined()
    expect(PROFILE.address).toBeUndefined()
  })
})

describe('profile facts — the site must use REAL data', () => {
  it('has the exact approved contact channels', () => {
    expect(PROFILE.email).toBe('soyedmdsolemanfajul@gmail.com')
    expect(PROFILE.github).toBe('https://github.com/SoyedFajol')
    expect(PROFILE.linkedin).toContain('linkedin.com/in/soyed-md-solaman-fajul')
  })

  it('keeps the six-milestone story arc in order', () => {
    expect(PROFILE.story).toHaveLength(6)
    expect(PROFILE.story[0].title).toContain('AIUB')
    expect(PROFILE.story[3].title).toContain('BRAC IT')
  })

  it('keeps skill levels honest (1=learning, 2=working, 3=strong)', () => {
    const leveled = [
      ...PROFILE.skills.testing,
      ...PROFILE.skills.frameworks,
      ...PROFILE.skills.programming,
    ]
    for (const skill of leveled) {
      expect([1, 2, 3]).toContain(skill.level)
    }
    const manual = PROFILE.skills.testing.find((s) => s.name === 'Manual Testing')
    expect(manual.level).toBe(3)
    const security = PROFILE.skills.testing.find((s) => s.name === 'Security Testing')
    expect(security.level).toBe(1)
  })
})
