import type { KeqExecutionContext, KeqNext } from 'keq'


export interface KeqNestMiddleware {
  use(ctx: KeqExecutionContext, next: KeqNext): void | PromiseLike<void>
}
