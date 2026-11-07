import { KeqEvents, KeqGlobal, KeqListeners, KeqMiddlewareOptionsParameter, KeqMiddlewareOptionsReturnType, unwrap } from '~/context/index.js'
import { AbortException, Exception, RequestException, TypeException } from '~/exception/index.js'
import { Validator } from '~/validator/index.js'
import { KeqRequestInit } from '~/request-init/index.js'
import { KeqSharedContext, KeqContextOptions } from '~/context/index.js'
import { KeqMiddlewareOrchestrator } from '~/orchestrator/index.js'
import { KeqMiddleware } from '~/middleware/index.js'
import { intelligentParseResponse, resolveWith } from './utils/index.js'
import { KeqDefaultOperation, KeqOperation, KeqQueryOptions } from './types/index.js'
import { klona } from 'klona/json'


export type KeqOptions = Partial<Omit<KeqRequestInit, 'url' | '__url__' | 'signal' | 'abort' | 'clone'>> & {
  locationId?: string
  global?: KeqGlobal
  qs?: KeqQueryOptions
  middlewares?: KeqMiddleware[]
}

/**
 * Core class that provides the foundational structure for managing middlewares, events, and request execution.
 */
export class Core<
  OP extends KeqOperation = KeqDefaultOperation,
  RES_BODY extends KeqOperation['responseBody'] = OP['responseBody'],
> extends Promise<RES_BODY> {
  /**
   * Ensures `.then()`, `.catch()`, `.finally()` return plain Promise instances instead of Core/Keq instances.
   */
  static get [Symbol.species](): PromiseConstructor {
    return Promise
  }

  /**
   * The unique identifier of the request's location in the code
   */
  __locationId__?: string

  /** Deferred resolve callback captured from the Promise executor. */
  private __resolve__!: (value: RES_BODY | PromiseLike<RES_BODY>) => void
  /** Deferred reject callback captured from the Promise executor. */
  private __reject__!: (reason: unknown) => void
  /** Whether the request has been lazily triggered by `.then()`. */
  private __triggered__ = false
  /** Cached promise for idempotent `end()` calls. */
  private __requestPromise__?: Promise<RES_BODY>

  /** Whether `abort()` has been called on this request. */
  private __aborted__ = false
  /** The reason passed to `abort()`. */
  private __abortReason__: any
  /** The shared context of the running attempt, used to abort the in-flight fetch. */
  private __activeSharedContext__?: KeqSharedContext
  /** Resolves as soon as `abort()` is called, used to interrupt retry delays. */
  private __resolveAbort__!: (reason: any) => void
  private __abortPromise__: Promise<any> = new Promise((resolve) => {
    this.__resolveAbort__ = resolve
  })

  /** Cleanup callbacks registered by `abortWhen()`. */
  private __abortWhenCleanups__: (() => void)[] = []
  /** Whether the request has settled (resolved or rejected). */
  private __settled__ = false

  protected requestInit: KeqRequestInit

  protected __listeners__: KeqListeners = {}

  protected __global__: Record<string, any>
  protected __prepend_middlewares__: KeqMiddleware[] = []
  protected __append_middlewares__: KeqMiddleware[] = []
  protected __qs__: KeqQueryOptions | undefined

  protected get __middlewares__(): KeqMiddleware[] {
    return [...this.__prepend_middlewares__, ...this.__append_middlewares__]
  }

  protected __options__: KeqContextOptions = {
    resolveWithFullResponse: false,
    resolveWith: 'intelligent',
  }

  public constructor(url: URL, options: KeqOptions) {
    let resolve!: (value: RES_BODY | PromiseLike<RES_BODY>) => void
    let reject!: (reason: unknown) => void
    super((res, rej) => {
      resolve = res
      reject = rej
    })
    this.__resolve__ = resolve
    this.__reject__ = reject

    this.__global__ = options.global || {}
    this.__locationId__ = options.locationId
    this.__qs__ = options.qs

    this.requestInit = new KeqRequestInit({
      method: 'get',
      headers: new Headers(),
      pathParameters: {},
      body: undefined,
      ...options,
      url: new URL(url.href),
    })

    if (options.middlewares) {
      this.__append_middlewares__.push(...options.middlewares)
    }
  }

  use(...middlewares: KeqMiddleware[]): this {
    this.__prepend_middlewares__.push(...middlewares)
    return this
  }

  on<K extends keyof KeqEvents>(event: K, listener: (data: KeqEvents[K]) => void): this {
    this.__listeners__[event] = this.__listeners__[event] || []
    this.__listeners__[event]!.push(listener)
    return this
  }

  option<K extends keyof KeqMiddlewareOptionsReturnType<OP>>(key: K, value?: KeqMiddlewareOptionsParameter[K]): KeqMiddlewareOptionsReturnType<OP>[K]
  option(key: string, value?: any): this
  option(key: string, value: any = true): this {
    this.__options__[key] = value
    return this
  }

  options(opts: KeqContextOptions): this {
    for (const [key, value] of Object.entries(opts)) {
      this.__options__[key] = value
    }
    return this
  }

  /**
   * Abort the request manually.
   *
   * The request rejects with the given reason (an {@link AbortException} by default),
   * the `abort` event is emitted, and no further retry is performed.
   * It is safe to call `abort()` before the request is sent: the request will be
   * aborted as soon as it starts.
   *
   * @description 手动中止请求
   * @param reason Abort reason. Defaults to `new AbortException('Request aborted')`.
   */
  abort(reason: any = new AbortException('Request aborted')): void {
    if (this.__aborted__) return

    this.__aborted__ = true
    this.__abortReason__ = reason
    this.__resolveAbort__(reason)
    this.__activeSharedContext__?.request.abort(reason)
    this.__clearAbortWhenCleanups__()
  }

  /**
   * Abort the request when the given `AbortSignal` aborts,
   * or when the given `Promise` settles (resolves or rejects).
   *
   * It is designed for the normal `await` flow, so business code
   * does not need to call `.fire()` first:
   * `await request.get('/api/cats').abortWhen(signal)`.
   *
   * @description 当 signal 中止或 promise 完成时终止请求
   */
  abortWhen(source: AbortSignal | PromiseLike<unknown>): this {
    if (this.__aborted__ || this.__settled__) return this

    if (Validator.isAbortSignal(source)) {
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

    if (Validator.isObject(source) && typeof source.then === 'function') {
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

    throw new TypeException('abortWhen() expects an AbortSignal or a Promise')
  }

  derive(): this {
    const derived = new (this.constructor as new (url: URL, options: KeqOptions) => this)(
      this.requestInit.url,
      {
        method: this.requestInit.method,
        headers: this.requestInit.headers,
        body: this.requestInit.body,
        pathParameters: this.requestInit.pathParameters,
        cache: this.requestInit.cache,
        credentials: this.requestInit.credentials,
        integrity: this.requestInit.integrity,
        keepalive: this.requestInit.keepalive,
        mode: this.requestInit.mode,
        redirect: this.requestInit.redirect,
        referrer: this.requestInit.referrer,
        referrerPolicy: this.requestInit.referrerPolicy,
        locationId: this.__locationId__,
        global: this.__global__,
        qs: this.__qs__ ? { ...this.__qs__ } : undefined,
        middlewares: [...this.__append_middlewares__],
      },
    )

    derived.__prepend_middlewares__ = [...this.__prepend_middlewares__]

    derived.__listeners__ = {}
    for (const key in this.__listeners__) {
      derived.__listeners__[key] = [...this.__listeners__[key]!]
    }

    derived.__options__ = klona(this.__options__)

    return derived
  }

  private buildSharedContext(): KeqSharedContext {
    const coreContext = new KeqSharedContext({
      locationId: this.__locationId__,
      request: this.requestInit,
      global: this.__global__,
      options: this.__options__,
    })

    for (const eventName in this.__listeners__) {
      const listeners = this.__listeners__[eventName]
      for (const listener of listeners) {
        coreContext.emitter.on(eventName as keyof KeqEvents, listener)
      }
    }

    this.__activeSharedContext__ = coreContext

    if (this.__aborted__) {
      coreContext.request.abort(this.__abortReason__)
    }

    return coreContext
  }

  private async run(): Promise<KeqSharedContext> {
    let attempt: number | undefined

    try {
      while (true) {
        if (this.__aborted__ && attempt !== undefined) {
          throw this.__abortReason__
        }

        const attemptWithDefault = attempt || 0
        const sharedContext = this.buildSharedContext()
        const orchestrator = new KeqMiddlewareOrchestrator(sharedContext, this.__middlewares__)

        if (attempt !== undefined) sharedContext.data.retry = { attempt }
        if (attempt && attempt >= 1) sharedContext.emitter.emit('retry', { context: sharedContext })

        let error: unknown = null

        try {
          await orchestrator.execute()
        } catch (err) {
          error = err
        }

        if (this.__aborted__) {
          const reason = error ?? this.__abortReason__
          sharedContext.emitter.emit('error', { context: sharedContext })
          throw reason
        }

        const retryOn = typeof sharedContext.options.retry?.on === 'function'
          ? sharedContext.options.retry.on
          : (attempt, error) => {
            if (error instanceof RequestException && error.fatal) return false
            return !!error
          }
        let retryTimes = sharedContext.options.retry?.times || 0
        if (retryTimes) {
          if (retryTimes < 0) retryTimes = 0
          else if (!Number.isInteger(retryTimes)) retryTimes = Math.floor(retryTimes)
        }

        if (
          attemptWithDefault >= retryTimes
          || (await retryOn(attemptWithDefault, error, sharedContext)) === false
        ) {
          if (error) {
            sharedContext.emitter.emit('error', { context: sharedContext })
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw error
          }
          return sharedContext
        }

        const retryDelay = typeof sharedContext.options.retry?.delay === 'function'
          ? await sharedContext.options.retry.delay(attemptWithDefault, error, sharedContext)
          : sharedContext.options.retry?.delay || 0

        if (retryDelay) {
          await new Promise<void>((resolve) => {
            const timer = setTimeout(resolve, retryDelay)

            // The retry delay should be interrupted when the request is aborted.
            void this.__abortPromise__.then(() => {
              clearTimeout(timer)
              resolve()
            })
          })
        }
        attempt = attemptWithDefault + 1
      }
    } finally {
      this.__activeSharedContext__ = undefined
    }
  }

  private __execute__(): Promise<RES_BODY> {
    if (!this.__requestPromise__) {
      this.__requestPromise__ = (async () => {
        try {
          const coreContext = await this.run()
          const resolveWithMode = coreContext.options.resolveWith

          if (resolveWithMode === 'response') {
            return coreContext.response?.clone() as RES_BODY
          }

          const response = coreContext.response

          if (!resolveWithMode || resolveWithMode === 'intelligent') {
            const output: any = coreContext.output
            if (output !== undefined) {
              return output as RES_BODY
            }

            return await intelligentParseResponse<RES_BODY>(response)
          }

          if (!response) {
            throw new Exception([
              `Unable to process the response with '${resolveWithMode}'. Possible causes:`,
              '1. The request was never initiated or sent',
              '2. The request failed before a response was received.',
            ].join('\n'))
          }

          return await resolveWith(response, resolveWithMode)
        } finally {
          this.__settled__ = true
          this.__clearAbortWhenCleanups__()
        }
      })()
    }

    return this.__requestPromise__
  }

  private __clearAbortWhenCleanups__(): void {
    const cleanups = this.__abortWhenCleanups__
    this.__abortWhenCleanups__ = []
    for (const cleanup of cleanups) cleanup()
  }

  /**
   * Trigger the request without waiting for the result.
   *
   * Returns the request instance itself, so the handler can still be used later,
   * for example `request.get('/api/cats').fire().abort()`.
   */
  fire(): this {
    if (!this.__triggered__) {
      this.__triggered__ = true
      this.__execute__().then(this.__resolve__, this.__reject__)
    }

    return this
  }

  /** @deprecated Await the Keq instance directly or use `.fire()` for fire-and-forget. */
  end(): Promise<RES_BODY> {
    if (!this.__triggered__) {
      this.__triggered__ = true
      this.__execute__().then(this.__resolve__, this.__reject__)
    }
    return new Promise<RES_BODY>((resolve, reject) => {
      super.then(resolve, reject)
    })
  }

  override then<TResult1 = RES_BODY, TResult2 = never>(
    onfulfilled?: ((value: RES_BODY) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    if (!this.__triggered__) {
      this.__triggered__ = true
      this.__execute__().then(this.__resolve__, this.__reject__)
    }
    return super.then(onfulfilled, onrejected)
  }
}
