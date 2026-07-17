import { describe, expect, it } from 'vitest'
import { COMPANIES } from '../src/data/companies.js'

describe('Company Codex data', () => {
  it('has a healthy directory with unique ids', () => {
    expect(COMPANIES.length).toBeGreaterThanOrEqual(15)
    const ids = new Set(COMPANIES.map((c) => c.id))
    expect(ids.size).toBe(COMPANIES.length)
  })

  it('every company has name, city, focus, and https links', () => {
    for (const c of COMPANIES) {
      expect(c.name.length).toBeGreaterThan(2)
      expect(c.city.length).toBeGreaterThan(2)
      expect(c.focus.length).toBeGreaterThan(5)
      expect(c.website, `${c.id} website`).toMatch(/^https:\/\//)
      expect(c.careers, `${c.id} careers`).toMatch(/^https:\/\//)
      expect(Array.isArray(c.tags) && c.tags.length > 0).toBe(true)
    }
  })

  it("includes Soyed's current guild, highlighted", () => {
    const bits = COMPANIES.find((c) => c.id === 'bracits')
    expect(bits).toBeDefined()
    expect(bits.highlight).toBeTruthy()
  })

  it('leaks no phone-number-like data (gate B7 applies here too)', () => {
    expect(JSON.stringify(COMPANIES)).not.toMatch(/\+?880\s?1[0-9\s-]{7,}/)
  })
})
