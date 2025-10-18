import { KeqMiddlewareOrchestrator } from '~/orchestrator/index.js'
import { KeqRequestInit } from '~/request-init/index.js'
import { KeqOrchestratorContext } from './orchestrator-context.js'
import type { KeqContextData, KeqContextEmitter, KeqContextOptions, KeqGlobal } from './types/index.js'


export class KeqContext {
  private readonly __orchestrator__: KeqMiddlewareOrchestrator
  private readonly __orchestrator_context__: KeqOrchestratorContext


  constructor(orchestrator: KeqMiddlewareOrchestrator) {
    this.__orchestrator__ = orchestrator
    this.__orchestrator_context__ = new KeqOrchestratorContext(orchestrator)
  }

  get orchestration(): KeqOrchestratorContext {
    return this.__orchestrator_context__
  }

  /**
   * The unique identifier of the request's location in the code
   */
  get locationId(): string | undefined {
    return this.__orchestrator__.context.locationId
  }

  get request(): KeqRequestInit {
    return this.__orchestrator__.context.request
  }

  get global(): KeqGlobal {
    return this.__orchestrator__.context.global
  }

  get emitter(): KeqContextEmitter {
    return this.__orchestrator__.context.emitter
  }

  get options(): KeqContextOptions {
    return this.__orchestrator__.context.options
  }

  // The result get by user if resolveWith is set to 'intelligent' or not set
  set output(value: any) {
    if (this.options.resolveWith && this.options.resolveWith !== 'intelligent') {
      console.warn(`The request is configured to resolve with ${this.options.resolveWith}, so setting context.output maybe no effect.`)
    }
    this.__orchestrator__.context.output = value
  }

  // The original response
  get res(): Response | undefined {
    return this.__orchestrator__.context.res
  }

  // The original response
  set res(value: Response | undefined) {
    this.__orchestrator__.context.res = value
  }

  // The request response
  get response(): Response | undefined {
    return this.__orchestrator__.context.response
  }

  // The properties extends by middleware
  get data(): KeqContextData {
    return this.__orchestrator__.context.data
  }

  set data(value: KeqContextData) {
    this.__orchestrator__.context.data = value
  }
}
