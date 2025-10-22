import type { KeqMiddlewareOrchestrator } from '~/orchestrator/index.js'
import { KeqMiddlewareContext } from './middleware-context'


export class KeqOrchestratorContext {
  private readonly __middlewares__: KeqMiddlewareContext[]
  private readonly __orchestrator__: KeqMiddlewareOrchestrator

  constructor(orchestrator: KeqMiddlewareOrchestrator) {
    this.__middlewares__ = orchestrator.executors.map((exe) => new KeqMiddlewareContext(exe))
    this.__orchestrator__ = orchestrator
  }

  get middlewares(): KeqMiddlewareContext[] {
    return this.__middlewares__
  }

  fork(): KeqMiddlewareOrchestrator {
    return this.__orchestrator__.fork()
  }
}
