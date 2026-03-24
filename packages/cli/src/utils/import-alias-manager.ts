export type AliasCategory = 'schema' | 'response'

/**
 * Manages import alias naming with collision detection for generated TypeScript files.
 *
 * When generating `import type { X as XSchema }` statements, the alias (e.g., `XSchema`)
 * may collide with fixed names already present in the generated file (e.g., the file's own
 * `export type` name). This class tracks all used names and automatically falls back to
 * numbered suffixes (e.g., `XSchema$1`) when a collision is detected.
 *
 * Usage: call `register()` during import generation, then `resolve()` in referenceTransformer.
 * `register()` must always be called before `resolve()` for the same dependency, because
 * the first `register()` call determines the alias name.
 */
export class ImportAliasManager {
  /** "category:originalName" → alias */
  private aliasMap = new Map<string, string>()
  /** All alias names + reserved names currently in use */
  private usedNames = new Set<string>()

  /**
   * @param reservedNames - Fixed names in the generated file that aliases must not collide with.
   *   For example, the file's own export type name.
   */
  constructor(reservedNames: Iterable<string> = []) {
    for (const name of reservedNames) {
      this.usedNames.add(name)
    }
  }

  /**
   * Register a dependency and return its alias. Idempotent — calling with the same
   * category + originalName always returns the same alias.
   */
  register(category: AliasCategory, originalName: string): string {
    const key = `${category}:${originalName}`
    const existing = this.aliasMap.get(key)
    if (existing) return existing

    const suffix = category === 'schema' ? 'Schema' : 'Response'
    let candidate = `${originalName}${suffix}`

    if (this.usedNames.has(candidate)) {
      let i = 1
      while (this.usedNames.has(`${candidate}$${i}`)) {
        i++
      }
      candidate = `${candidate}$${i}`
    }

    this.aliasMap.set(key, candidate)
    this.usedNames.add(candidate)
    return candidate
  }

  /**
   * Look up alias for an already-registered dependency.
   * Returns undefined if not yet registered.
   */
  resolve(category: AliasCategory, originalName: string): string | undefined {
    return this.aliasMap.get(`${category}:${originalName}`)
  }
}
