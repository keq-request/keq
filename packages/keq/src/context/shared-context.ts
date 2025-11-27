import { klona } from 'klona/full'
import mitt from 'mitt'
import {
  KeqRequestInit,
  KeqRequestInitOptions,
} from '~/request-init/index.js'
import { shallowClone } from '~/utils/shallow-clone.js'
import { watchObject } from './utils/index.js'
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


export class KeqSharedContext implements KeqContext {
  private readonly __locationId__?: string

  private readonly __request__: KeqRequestInit
  private readonly __global__: Record<string, any>
  private readonly __emitter__: KeqContextEmitter
  private readonly __options__: KeqContextOptions

  // The properties extends by middleware
  private readonly __data__: KeqContextData = {}

  private __output__?: any

  /**
   * original response
   */
  res?: Response

  constructor(options: KeqSharedContextOptions) {
    this.__locationId__ = options.locationId

    this.__request__ = watchObject(new KeqRequestInit(options.request), {
      abort: (target, thisArg, argArray) => {
        this.__emitter__.emit('abort', { context: this, reason: argArray[0] })
      },
    })

    this.__emitter__ = options.emitter || mitt<Omit<KeqEvents, never>>()
    this.__global__ = options.global
    this.__options__ = options.options ? shallowClone(options.options) : {}
    this.__data__ = options.data || {}
  }

  /**
   * The unique identifier of the request's location in the code
   */
  get locationId(): string | undefined {
    return this.__locationId__
  }

  get request(): KeqRequestInit {
    return this.__request__
  }

  get global(): KeqGlobal {
    return this.__global__
  }

  get emitter(): KeqContextEmitter {
    return this.__emitter__
  }

  get options(): KeqContextOptions {
    return this.__options__
  }

  set output(value: any) {
    this.__output__ = value
  }

  get output(): any {
    return this.__output__ as unknown
  }

  get response(): Response | undefined {
    if (!this.res) return undefined

    return new Proxy(this.res, {
      get(res, prop) {
        if (typeof prop === 'string') {
          if (['json', 'text', 'arrayBuffer', 'blob', 'buffer', 'formData'].includes(prop)) {
          /**
           * clone when invoking body, json, text, arrayBuffer, blob, buffer, formData
           * to avoid time-consuming cloning
           */
            return new Proxy(res[prop], {
              apply(target, thisArg, argArray) {
                const mirror = res.clone()
                return mirror[prop](...argArray) as unknown
              },
            }) as unknown
          }

          if (prop === 'body') {
            const mirror = res.clone()
            return mirror.body
          }
        }

        if (typeof res[prop] === 'function') {
          return res[prop].bind(res) as unknown
        }

        return res[prop] as unknown
      },
    })
  }

  get data(): KeqContextData {
    return this.__data__
  }

  clone(): KeqSharedContext {
    const context = new KeqSharedContext({
      locationId: this.__locationId__,
      request: this.__request__.clone(),
      global: this.__global__,
      options: klona(this.__options__),
      data: klona(this.__data__),
      emitter: this.__emitter__,
    })

    this.__emitter__.all.forEach((handler, type) => {
      context.emitter.on(type as any, handler as any)
    })

    return context
  }
}


