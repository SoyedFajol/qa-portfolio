// Vitest runs in a node environment — give it a minimal localStorage so the
// zustand persist middleware behaves like it does in the browser.
class MemoryStorage {
  #map = new Map()
  getItem(key) {
    return this.#map.has(key) ? this.#map.get(key) : null
  }
  setItem(key, value) {
    this.#map.set(String(key), String(value))
  }
  removeItem(key) {
    this.#map.delete(key)
  }
  clear() {
    this.#map.clear()
  }
}

globalThis.localStorage = new MemoryStorage()
