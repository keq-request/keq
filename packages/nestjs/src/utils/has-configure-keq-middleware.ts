import type { KeqMiddlewareModule } from '../interfaces/keq-middleware-module.interface.js'


export function hasConfigureKeqMiddleware(instance: unknown): instance is KeqMiddlewareModule {
  return (
    instance !== null
    && instance !== undefined
    && typeof (instance as Record<string, unknown>).configureKeqMiddleware === 'function'
  )
}
