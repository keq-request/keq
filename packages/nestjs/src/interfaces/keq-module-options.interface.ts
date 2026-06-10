import type { KeqMiddleware } from 'keq'


export interface KeqModuleOptions {
  middlewares?: KeqMiddleware[]
  isolate?: boolean
}
