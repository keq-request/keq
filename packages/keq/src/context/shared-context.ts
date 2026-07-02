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

export const ContextLocationIdProperty = '__KeqProtectedProperty(context.locationId)__'
export const ContextRequestProperty = '__KeqProtectedProperty(context.request)__'
export const ContextGlobalProperty = '__KeqProtectedProperty(context.global)__'
export const ContextEmitterProperty = '__KeqProtectedProperty(context.emitter)__'
export const ContextOptionsProperty = '__KeqProtectedProperty(context.options)__'
export const ContextDataProperty = '__KeqProtectedProperty(context.data)__'
export const ContextOutputProperty = '__KeqProtectedProperty(context.output)__'

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

  /** @deprecated Use `locationId` instead */
  get identifier(): string | undefined {
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


