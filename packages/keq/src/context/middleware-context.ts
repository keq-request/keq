import { type KeqMiddlewareExecutor } from '../orchestrator/executor.js'


const ExecutorProperty = '__KeyProtectedProperty(context.orchestration.middlewares)__'

export class KeqMiddlewareContext {
  readonly [ExecutorProperty]: KeqMiddlewareExecutor

  constructor(executor: KeqMiddlewareExecutor) {
    this[ExecutorProperty] = executor
  }

  get name(): string {
    return this[ExecutorProperty].name
  }

  get status(): KeqMiddlewareExecutor['status'] {
    return this[ExecutorProperty].status
  }

  get finished(): boolean {
    return this.status === 'fulfilled' || this.status === 'rejected'
  }
}
