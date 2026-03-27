import { Compiler } from '~/compiler/index.js'


/**
 * A WeakMap-backed metadata storage for plugins.
 *
 * When a `key` is provided, the underlying WeakMap is stored in `globalThis` via
 * `Symbol.for(key)`, ensuring the same instance is shared across CJS and ESM module
 * boundaries. This is required for plugins that are imported by user config files
 * (e.g. via `@keq-request/cli/plugins`) and need to interoperate with the CLI's
 * internal plugins.
 *
 * When no `key` is provided, a plain `new WeakMap()` is used, which is sufficient
 * for plugins that always run within the same module system.
 */
export class PluginMetadataStorage<V> {
  private readonly storage: WeakMap<Compiler, V>

  constructor(key?: string) {
    if (key !== undefined) {
      const storageKey = Symbol.for(key)
      const g = globalThis as Record<symbol, unknown>
      if (!g[storageKey]) {
        g[storageKey] = new WeakMap<Compiler, V>()
      }
      this.storage = g[storageKey] as WeakMap<Compiler, V>
    } else {
      this.storage = new WeakMap<Compiler, V>()
    }
  }

  has(key: Compiler): boolean {
    return this.storage.has(key)
  }

  get(key: Compiler): V | undefined {
    return this.storage.get(key)
  }

  set(key: Compiler, value: V): this {
    this.storage.set(key, value)
    return this
  }

  delete(key: Compiler): boolean {
    return this.storage.delete(key)
  }
}
