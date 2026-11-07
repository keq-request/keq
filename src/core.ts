/* eslint-disable @typescript-eslint/no-explicit-any */
import mitt from 'mitt'
import { AbortException } from './exception/abort.exception.js'
import { Exception } from './exception/exception.js'
import { InvalidArgumentsExceptions } from './exception/invalid-arguments.exception.js'
import { isAbortSignal } from './is/is-abort-signal.js'
import { cloneBody } from './util/clone-body.js'
import { ABORT_PROPERTY, OUTPUT_PROPERTY, SESSION_ABORTED_PROPERTY, SESSION_ABORT_CONTROLLER_PROPERTY } from './constant.js'
import { composeMiddleware } from './util/compose-middleware.js'
import { shallowClone } from './util/shallow-clone.js'
import { compileUrl } from './util/compile-url.js'

import type { KeqContext, KeqContextOptions } from './types/keq-context.js'
import type { KeqMiddleware } from './types/keq-middleware.js'
import type { KeqInit } from './types/keq-init.js'
import type { KeqEvents, KeqListeners } from './types/keq-events.js'
import type { KeqContextRequest } from './types/keq-context-request.js'
import { unwrap } from './util/fork.js'


/**
 * @description Keq 核心 API，发送请求必要的原子化的API
 */
export class Core<OUTPUT> {
  /**
   * The unique identifier of the request's location in the code
   */
  __identifier__: string

  private requestPromise?: Promise<OUTPUT>

  /** Whether abort() has been called on this request. */
  private __aborted__ = false
  /** The reason passed to abort(). */
  private __abortReason__: any
  /** The context of the running attempt, used to abort the in-flight fetch. */
  private __activeContext__?: KeqContext
  /** Aborts as soon as abort() is called, used to interrupt retry delays. */
  private __sessionAbortController__?: AbortController
  /** Cleanup callbacks registered by abortWhen(). */
  private __abortWhenCleanups__: (() => void)[] = []
  /** Whether the request has settled (resolved or rejected). */
  private __settled__ = false

  protected requestContext: Omit<KeqContextRequest, 'abort' | '__url__'>

  protected __listeners__: KeqListeners = {}

  protected __global__: Record<string, any>
  protected __prepend_middlewares__: KeqMiddleware[] = []
  protected __append_middlewares__: KeqMiddleware[] = []

  protected __options__: KeqContextOptions = {
    resolveWithFullResponse: false,
    resolveWith: 'intelligent',
  }

  public constructor(url: URL, init: KeqInit, identifier: string, global: Record<string, any> = {}) {
    this.__global__ = global
    this.__identifier__ = identifier

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

  /**
   * Abort the request manually.
   *
   * The request rejects with the given reason (an AbortException by default),
   * and no further retry is performed. It is safe to call abort() before the
   * request is sent.
   *
   * @description 手动中止请求
   */
  abort(reason: any = new AbortException('Request aborted')): void {
    if (this.__aborted__ || this.__settled__) return

    this.__aborted__ = true
    this.__abortReason__ = reason

    const ctx = this.__activeContext__
    if (ctx) ctx.abort(reason)

    this.__clearAbortWhenCleanups__()
  }

  /**
   * Abort the request when the given AbortSignal aborts,
   * or when the given Promise settles (resolves or rejects).
   *
   * @description 当 signal 中止或 promise 完成时终止请求
   */
  abortWhen(source: AbortSignal | PromiseLike<unknown>): this {
    if (this.__aborted__ || this.__settled__) return this

    if (isAbortSignal(source)) {
      const reason = (): any => source.reason ?? new AbortException('Request aborted by AbortSignal passed to abortWhen()')

      if (source.aborted) {
        this.abort(reason())
        return this
      }

      const onAbort = (): void => this.abort(reason())
      source.addEventListener('abort', onAbort, { once: true })
      this.__abortWhenCleanups__.push(() => source.removeEventListener('abort', onAbort))

      return this
    }

    if (typeof source === 'object' && source !== null && typeof (source as PromiseLike<unknown>).then === 'function') {
      const reason = new AbortException('Request aborted by Promise passed to abortWhen()')
      let cancelled = false
      this.__abortWhenCleanups__.push(() => {
        cancelled = true
      })

      void Promise.resolve(source).then(
        () => {
          if (!cancelled) this.abort(reason)
        },
        () => {
          if (!cancelled) this.abort(reason)
        },
      )

      return this
    }

    throw new InvalidArgumentsExceptions()
  }

  private __clearAbortWhenCleanups__(): void {
    const cleanups = this.__abortWhenCleanups__
    this.__abortWhenCleanups__ = []
    for (const cleanup of cleanups) cleanup()
  }

  private async run(): Promise<OUTPUT> {
    if (this.__aborted__) {
      this.__settled__ = true
      this.__clearAbortWhenCleanups__()
      throw this.__abortReason__
    }

    const headers = new Headers()

    for (const [key, value] of this.requestContext.headers.entries()) {
      headers.append(key, value)
    }

    const requestContext: KeqContextRequest = {
      url: new URL(this.requestContext.url.href),
      routeParams: shallowClone(this.requestContext.routeParams),

      get __url__() {
        return compileUrl(this.url, this.routeParams)
      },

      method: this.requestContext.method,
      headers,
      body: cloneBody(this.requestContext.body),

      cache: this.requestContext.cache,
      credentials: this.requestContext.credentials,
      integrity: this.requestContext.integrity,
      keepalive: this.requestContext.keepalive,
      mode: this.requestContext.mode,
      redirect: this.requestContext.redirect,
      referrer: this.requestContext.referrer,
      referrerPolicy: this.requestContext.referrerPolicy,
    }

    const options = shallowClone(this.__options__)

    const emitter = mitt<Omit<KeqEvents, never>>()
    for (const eventName in this.__listeners__) {
      const listeners = this.__listeners__[eventName]
      for (const listener of listeners) {
        emitter.on(eventName as keyof KeqEvents, listener)
      }
    }

    const ctx: KeqContext = {
      metadata: {
        finished: false,
        entryNextTimes: 0,
        outNextTimes: 0,
      },

      identifier: this.__identifier__,

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
        // Mark the request as aborted, so pending retries are stopped
        this[SESSION_ABORTED_PROPERTY] = reason
        this[SESSION_ABORT_CONTROLLER_PROPERTY]?.abort(reason)

        const abortController = this[ABORT_PROPERTY]
        if (abortController) abortController.abort(reason)
      },
    }

    const sessionAbortController = new AbortController()
    this.__sessionAbortController__ = sessionAbortController
    this.__activeContext__ = ctx
    ctx[SESSION_ABORT_CONTROLLER_PROPERTY] = sessionAbortController

    const middleware = composeMiddleware([...this.__prepend_middlewares__, ...this.__append_middlewares__])

    try {
      await middleware(ctx, async function emptyNext() {})

      if (this.__aborted__) throw this.__abortReason__

      const output: any = ctx[OUTPUT_PROPERTY]

      if (ctx.options.resolveWithFullResponse || ctx.options.resolveWith === 'response') {
        return ctx.response?.clone() as OUTPUT
      }

      const response = ctx.response
      if (!response) {
        return (OUTPUT_PROPERTY in ctx) ? output as OUTPUT : undefined as unknown as OUTPUT
      }

      if (ctx.options.resolveWith === 'text') {
        return await response.text() as OUTPUT
      } else if (ctx.options.resolveWith === 'json') {
        return unwrap(await response.json()) as OUTPUT
      } else if (ctx.options.resolveWith === 'form-data') {
        return await response.formData() as OUTPUT
      } else if (ctx.options.resolveWith === 'blob') {
        return await response.blob() as OUTPUT
      } else if (ctx.options.resolveWith === 'array-buffer') {
        return await response.arrayBuffer() as OUTPUT
      }

      if (OUTPUT_PROPERTY in ctx) {
        return output as OUTPUT
      }

      if (response.status === 204) {
        // 204: NO CONTENT
        return undefined as unknown as OUTPUT
      }

      const contentType = response.headers.get('content-type') || ''
      try {
        if (contentType.includes('application/json')) {
          return unwrap(await response.json()) as OUTPUT
        } else if (contentType.includes('multipart/form-data')) {
          return await response.formData() as OUTPUT
        } else if (contentType.includes('plain/text')) {
          return await response.text() as OUTPUT
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
      return undefined as unknown as OUTPUT
    } catch (error) {
      if (this.__aborted__) throw this.__abortReason__
      throw error
    } finally {
      if (this.__activeContext__ === ctx) this.__activeContext__ = undefined
      if (this.__sessionAbortController__ === sessionAbortController) this.__sessionAbortController__ = undefined
      this.__settled__ = true
      this.__clearAbortWhenCleanups__()
    }
  }

  end(): Promise<OUTPUT> {
    if (!this.requestPromise) {
      this.requestPromise = this.run()
      // `end()` can be used to send the request without awaiting the result,
      // mark the rejection as handled to avoid an unhandled rejection
      void this.requestPromise.catch(() => {})
    }

    return this.requestPromise
  }

  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = OUTPUT, TResult2 = never>(onfulfilled?: ((value: OUTPUT) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2> {
    return this.end().then(onfulfilled, onrejected)
  }

  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<OUTPUT | TResult> {
    return this.end().catch(onrejected)
  }

  finally(onfinally?: (() => void) | undefined | null): Promise<OUTPUT> {
    return this.end().finally(onfinally)
  }
}
