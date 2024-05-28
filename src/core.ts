import { URL } from 'whatwg-url'
import { Exception } from '~/exception/exception.js'
import { clone } from '~/util/clone.js'
import { ABORT_PROPERTY, NEXT_INVOKED_PROPERTY, OUTPUT_PROPERTY } from './constant.js'
import { composeMiddleware } from './util/compose-middleware.js'
import { shadowClone } from './util/shadow-clone.js'

import type { KeqContext, KeqContextOptions, KeqRequestContext } from './types/keq-context.js'
import type { KeqMiddleware } from './types/keq-middleware.js'
import type { KeqRequestInit } from './types/keq-request-init.js'
import mitt from 'mitt'
import { KeqEvents, KeqListeners } from './types/keq-events.js'


/**
 * @description Keq 核心 API，发送请求必要的原子化的API
 */
export class Core<T> {
  private requestPromise?: Promise<T>

  protected requestContext: Omit<KeqRequestContext, 'abort'>

  protected __listeners__: KeqListeners = {}

  protected __global__: Record<string, any>
  protected __prepend_middlewares__: KeqMiddleware[] = []
  protected __append_middlewares__: KeqMiddleware[] = []

  protected __options__: KeqContextOptions = {
    resolveWithFullResponse: false,
    resolveWith: 'intelligent',
  }

  public constructor(url: (URL | globalThis.URL), init: KeqRequestInit, global: Record<string, any> = {}) {
    this.__global__ = global


    this.requestContext = {
      method: 'get',
      headers: new Headers(),
      routeParams: {},
      body: undefined,
      ...init,
      url: new URL(url.href),
    }
  }

  prependMiddlewares(...middlewares: KeqMiddleware[]): this {
    this.__prepend_middlewares__.push(...middlewares)
    return this
  }

  appendMiddlewares(...middlewares: KeqMiddleware[]): this {
    this.__append_middlewares__.unshift(...middlewares)
    return this
  }

  on<K extends keyof KeqEvents>(event: K, listener: (data: KeqEvents[K]) => void): this {
    this.__listeners__[event] = this.__listeners__[event] || []
    this.__listeners__[event]!.push(listener)
    return this
  }

  private async run(): Promise<T> {
    const headers = new Headers()

    for (const [key, value] of this.requestContext.headers.entries()) {
      headers.append(key, value)
    }

    const requestContext: KeqRequestContext = {
      method: this.requestContext.method,
      url: new URL(this.requestContext.url.href),
      headers,
      routeParams: shadowClone(this.requestContext.routeParams),
      body: clone(this.requestContext.body),

      cache: this.requestContext.cache,
      credentials: this.requestContext.credentials,
      integrity: this.requestContext.integrity,
      keepalive: this.requestContext.keepalive,
      mode: this.requestContext.mode,
      redirect: this.requestContext.redirect,
      referrer: this.requestContext.referrer,
      referrerPolicy: this.requestContext.referrerPolicy,
    }

    const options = shadowClone(this.__options__)

    const emitter = mitt<Omit<KeqEvents, never>>()
    for (const eventName in this.__listeners__) {
      const listeners = this.__listeners__[eventName]
      for (const listener of listeners) {
        emitter.on(eventName as keyof KeqEvents, listener)
      }
    }

    const ctx: KeqContext = {
      [NEXT_INVOKED_PROPERTY]: {
        finished: false,
        entryNextTimes: 0,
        outNextTimes: 0,
      },

      emitter,

      request: requestContext,
      options,
      global: this.__global__,

      get output() {
        throw new Exception('output property is write-only')
      },

      set output(value) {
        this[OUTPUT_PROPERTY] = value
      },

      [ABORT_PROPERTY]: undefined,
      abort(reason) {
        const abortController = this[ABORT_PROPERTY]

        if (abortController) {
          abortController.abort(reason)
        }
      },
    }

    const middleware = composeMiddleware([...this.__prepend_middlewares__, ...this.__append_middlewares__])

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await middleware(ctx, async function emptyNext() {})


    const output: any = ctx[OUTPUT_PROPERTY]

    if (ctx.options.resolveWithFullResponse || ctx.options.resolveWith === 'response') {
      return ctx.response as T
    }

    const response = ctx.response
    if (!response) {
      return (OUTPUT_PROPERTY in ctx) ? output as T : undefined as unknown as T
    }

    if (ctx.options.resolveWith === 'text') {
      return await response.text() as T
    } else if (ctx.options.resolveWith === 'json') {
      return await response.json() as T
    } else if (ctx.options.resolveWith === 'form-data') {
      return await response.formData() as T
    } else if (ctx.options.resolveWith === 'blob') {
      return await response.blob() as T
    } else if (ctx.options.resolveWith === 'array-buffer') {
      return await response.arrayBuffer() as T
    }

    if (OUTPUT_PROPERTY in ctx) {
      return output as T
    }

    if (response.status === 204) {
      // 204: NO CONTENT
      return undefined as unknown as T
    }

    const contentType = response.headers.get('content-type') || ''
    try {
      if (contentType.includes('application/json')) {
        return await response.json() as T
      } else if (contentType.includes('multipart/form-data')) {
        return await response.formData() as T
      } else if (contentType.includes('plain/text')) {
        return await response.text() as T
      }
    } catch (e) {
      console.warn('Failed to auto parse response body', e)
    }

    /**
     * Unable to parse response body
     * Return undefined
     * Enable users to discover the problem
     * And modify the method of parsing response
     */
    return undefined as unknown as T
  }

  async end(): Promise<T> {
    return this.run()
  }

  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2> {
    if (!this.requestPromise) this.requestPromise = this.end()
    return this.requestPromise.then(onfulfilled, onrejected)
  }

  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult> {
    return this.end().catch(onrejected)
  }
}

