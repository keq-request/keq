import { KeqMiddlewareExecutor } from '../orchestrator/executor.js'

export class KeqMiddlewareContext {
  private readonly __executor__: KeqMiddlewareExecutor
  constructor(executor: KeqMiddlewareExecutor) {
    this.__executor__ = executor
  }

  get name(): string {
    return this.__executor__.name
  }

  get status(): KeqMiddlewareExecutor['status'] {
    return this.__executor__.status
  }

  get finished(): boolean {
    return this.status === 'fulfilled' || this.status === 'rejected'
  }
}
