import { KeqEvents, KeqGlobal, KeqListeners, KeqMiddlewareOptionsParameter, KeqMiddlewareOptionsReturnType, unwrap } from '~/context/index.js'
import { Exception, RequestException } from '~/exception/index.js'
import { sleep } from '~/utils/index.js'
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

  // prependMiddlewares(...middlewares: KeqMiddleware[]): this {
  //   this.__prepend_middlewares__.push(...middlewares)
  //   return this
  // }

  // /**
  //  * Appends middlewares to the end of the middleware chain.
  //  * Using this method indiscriminately is discouraged;
  //  * prefer using `.use` to maintain predictable execution order.
  //  */
  // appendMiddlewares(...middlewares: KeqMiddleware[]): this {
  //   this.__append_middlewares__.unshift(...middlewares)
  //   return this
  // }

  use(...middlewares: KeqMiddleware[]): this {
    this.__prepend_middlewares__.push(...middlewares)
    return this
    // return this.prependMiddlewares(...middlewares)
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

    return coreContext
  }

  private async run(): Promise<KeqSharedContext> {
    let attempt: number | undefined

    while (true) {
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

      const retryOn = typeof sharedContext.options.retry?.on === 'function'
        ? sharedContext.options.retry.on
        : (attempt, error) => {
          if (error instanceof RequestException && error.retry === false) return false
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

      if (retryDelay) await sleep(retryDelay)
      attempt = attemptWithDefault + 1
    }
  }

  private __execute__(): Promise<RES_BODY> {
    if (!this.__requestPromise__) {
      this.__requestPromise__ = (async () => {
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
      })()
    }

    return this.__requestPromise__
  }

  fire(): void {
    if (!this.__triggered__) {
      this.__triggered__ = true
      this.__execute__().then(this.__resolve__, this.__reject__)
    }
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
