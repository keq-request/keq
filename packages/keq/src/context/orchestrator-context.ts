import { KeqMiddlewareOrchestrator } from '~/orchestrator/index.js'
import { KeqMiddlewareContext } from './middleware-context'


export class KeqOrchestratorContext {
  private readonly __middlewares__: KeqMiddlewareContext[]

  constructor(orchestrator: KeqMiddlewareOrchestrator) {
    this.__middlewares__ = orchestrator.executors.map((exe) => new KeqMiddlewareContext(exe))
  }

  get middlewares(): KeqMiddlewareContext[] {
    return this.__middlewares__
  }
}
