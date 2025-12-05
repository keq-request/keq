import type { KeqMiddlewareExecutor, KeqMiddlewareOrchestrator } from '~/orchestrator/index.js'
import { KeqMiddlewareContext } from './middleware-context.js'


const OrchestratorProperty = Symbol('protected context.orchestration.orchestrator')
const ExecutorProperty = Symbol('protected context.orchestration.executor')

export class KeqOrchestratorContext {
  readonly [OrchestratorProperty]: KeqMiddlewareOrchestrator
  readonly [ExecutorProperty]: KeqMiddlewareExecutor

  constructor(orchestrator: KeqMiddlewareOrchestrator, executor: KeqMiddlewareExecutor) {
    this[OrchestratorProperty] = orchestrator
    this[ExecutorProperty] = executor
  }

  get middlewares(): KeqMiddlewareContext[] {
    return this[OrchestratorProperty].executors.map((exe) => exe.context)
  }

  // NOTE: For Future
  // get executing(): KeqMiddlewareContext {
  //   const current = this[OrchestratorProperty].current
  //   const executors = this[OrchestratorProperty].executors
  //   const executor = executors[current]
  //   return executor.context
  // }

  /**
   * The middleware context of the current middleware
   */
  get middleware(): KeqMiddlewareContext {
    return this[ExecutorProperty].context
  }

  fork(): KeqMiddlewareOrchestrator {
    return this[OrchestratorProperty].fork()
  }

  merge(source: KeqMiddlewareOrchestrator): void {
    this[OrchestratorProperty].merge(source)
  }
}
