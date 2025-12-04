import { KeqMiddlewareOrchestrator } from '~/orchestrator/index.js'
import { KeqRequestInit } from '~/request-init/index.js'
import { KeqOrchestratorContext } from './orchestrator-context.js'
import type {
  KeqContext,
  KeqContextData,
  KeqContextEmitter,
  KeqContextOptions,
  KeqGlobal,
} from './types/index.js'

export const ContextOrchestratorProperty = Symbol('context.orchestrator')
export const ContextOrchestrationProperty = Symbol('context.orchestration')


export class KeqExecutionContext implements KeqContext {
  private [ContextOrchestratorProperty]: KeqMiddlewareOrchestrator
  private [ContextOrchestrationProperty]: KeqOrchestratorContext

  constructor(orchestrator: KeqMiddlewareOrchestrator) {
    this[ContextOrchestratorProperty] = orchestrator
    this[ContextOrchestrationProperty] = new KeqOrchestratorContext(orchestrator)
  }

  get orchestration(): KeqOrchestratorContext {
    return this[ContextOrchestrationProperty]
  }

  /**
   * The unique identifier of the request's location in the code
   */
  get locationId(): string | undefined {
    return this[ContextOrchestratorProperty].context.locationId
  }

  get request(): KeqRequestInit {
    return this[ContextOrchestratorProperty].context.request
  }

  get global(): KeqGlobal {
    return this[ContextOrchestratorProperty].context.global
  }

  get emitter(): KeqContextEmitter {
    return this[ContextOrchestratorProperty].context.emitter
  }

  get options(): KeqContextOptions {
    return this[ContextOrchestratorProperty].context.options
  }

  // The result get by user if resolveWith is set to 'intelligent' or not set
  set output(value: any) {
    if (this.options.resolveWith && this.options.resolveWith !== 'intelligent') {
      console.warn(`The request is configured to resolve with ${this.options.resolveWith}, so setting context.output maybe no effect.`)
    }
    this[ContextOrchestratorProperty].context.output = value
  }

  // The original response
  get res(): Response | undefined {
    return this[ContextOrchestratorProperty].context.res
  }

  // The original response
  set res(value: Response | undefined) {
    this[ContextOrchestratorProperty].context.res = value
  }

  // The request response
  get response(): Response | undefined {
    return this[ContextOrchestratorProperty].context.response
  }

  // The properties extends by middleware
  get data(): KeqContextData {
    return this[ContextOrchestratorProperty].context.data
  }
}
