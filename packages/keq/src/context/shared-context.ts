import mitt from 'mitt'
import {
  KeqRequestInit,
  KeqRequestInitOptions,
} from '~/request-init/index.js'
import { shallowClone } from '~/utils/shallow-clone.js'
import {
  watchObject,
  createProxyResponse,
} from './utils/index.js'
import type {
  KeqContext,
  KeqContextOptions,
  KeqContextEmitter,
  KeqContextData,
  KeqGlobal,
  KeqEvents,
} from './types/index.js'

export interface KeqSharedContextOptions {
  locationId?: string
  request: KeqRequestInitOptions
  global: KeqGlobal
  options?: KeqContextOptions
  data?: KeqContextData
  emitter?: KeqContextEmitter
}

export const ContextLocationIdProperty = Symbol('protected context.locationId')
export const ContextRequestProperty = Symbol('protected context.request')
export const ContextGlobalProperty = Symbol('protected context.global')
export const ContextEmitterProperty = Symbol('protected context.emitter')
export const ContextOptionsProperty = Symbol('protected context.options')
export const ContextDataProperty = Symbol('protected context.data')
export const ContextOutputProperty = Symbol('protected context.output')

export class KeqSharedContext implements KeqContext {
  readonly [ContextLocationIdProperty]?: string
  [ContextRequestProperty]: KeqRequestInit
  [ContextGlobalProperty]: Record<string, any>
  [ContextEmitterProperty]: KeqContextEmitter
  [ContextOptionsProperty]: KeqContextOptions
  [ContextOutputProperty]?: any

  // The properties extends by middleware
  [ContextDataProperty]: KeqContextData = {}


  /**
   * original response
   */
  res?: Response

  constructor(options: KeqSharedContextOptions) {
    this[ContextLocationIdProperty] = options.locationId

    this[ContextRequestProperty] = watchObject(new KeqRequestInit(options.request), {
      abort: (target, thisArg, argArray) => {
        this[ContextEmitterProperty].emit('abort', { context: this, reason: argArray[0] })
      },
    })

    this[ContextEmitterProperty] = options.emitter || mitt<Omit<KeqEvents, never>>()
    this[ContextGlobalProperty] = options.global
    this[ContextOptionsProperty] = options.options ? shallowClone(options.options) : {}
    this[ContextDataProperty] = options.data || {}
  }

  /**
   * The unique identifier of the request's location in the code
   */
  get locationId(): string | undefined {
    return this[ContextLocationIdProperty]
  }

  get request(): KeqRequestInit {
    return this[ContextRequestProperty]
  }

  get global(): KeqGlobal {
    return this[ContextGlobalProperty]
  }

  get emitter(): KeqContextEmitter {
    return this[ContextEmitterProperty]
  }

  get options(): KeqContextOptions {
    return this[ContextOptionsProperty]
  }

  set output(value: any) {
    this[ContextOutputProperty] = value
  }

  get response(): Response | undefined {
    if (!this.res) return undefined

    return createProxyResponse(this.res)
  }

  get data(): KeqContextData {
    return this[ContextDataProperty]
  }
}


