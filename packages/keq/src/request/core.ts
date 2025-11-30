import { KeqEvents, KeqGlobal, KeqListeners, KeqMiddlewareOptionsParameter, KeqMiddlewareOptionsReturnType } from '~/context/index.js'
import { Exception, RequestException } from '~/exception/index.js'
import { sleep } from '~/utils/index.js'
import { KeqRequestInit } from '~/request-init/index.js'
import { KeqSharedContext, KeqContextOptions } from '~/context/index.js'
import { KeqMiddlewareOrchestrator } from '~/orchestrator/index.js'
import { KeqMiddleware } from '~/middleware/index.js'
import { intelligentParseResponse } from './utils/index.js'
import { KeqDefaultOperation, KeqOperation, KeqQueryOptions } from './types/index.js'


export type KeqOptions = Partial<Omit<KeqRequestInit, 'url' | '__url__' | 'signal' | 'abort' | 'clone'>> & {
  locationId?: string
  global?: KeqGlobal
  qs?: KeqQueryOptions
}

/**
 * Core class that provides the foundational structure for managing middlewares, events, and request execution.
 */
export class Core<
  OP extends KeqOperation = KeqDefaultOperation,
  RES_BODY extends KeqOperation['responseBody'] = OP['responseBody'],
> {
  /**
   * The unique identifier of the request's location in the code
   */
  __locationId__?: string

  private requestPromise?: Promise<RES_BODY>

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
    this.__global__ = options.global || {}
    this.__locationId__ = options.locationId
    this.__qs__ = options.qs

    this.requestInit = new KeqRequestInit({
      method: 'get',
      headers: new Headers(),
      routeParams: {},
      body: undefined,
      ...options,
      url: new URL(url.href),
    })
  }

  prependMiddlewares(...middlewares: KeqMiddleware[]): this {
    this.__prepend_middlewares__.push(...middlewares)
    return this
  }

  /**
   * Appends middlewares to the end of the middleware chain.
   * Using this method indiscriminately is discouraged;
   * prefer using `.use` to maintain predictable execution order.
   */
  appendMiddlewares(...middlewares: KeqMiddleware[]): this {
    this.__append_middlewares__.unshift(...middlewares)
    return this
  }

  use(...middlewares: KeqMiddleware[]): this {
    return this.prependMiddlewares(...middlewares)
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

  async end(): Promise<RES_BODY> {
    const coreContext = await this.run()


    if (coreContext.options.resolveWith === 'response') {
      return coreContext.response as RES_BODY
    }

    const response = coreContext.response

    if (coreContext.options.resolveWith && coreContext.options.resolveWith !== 'intelligent' && !response) {
      throw new Exception([
        `Unable to process the response with '${coreContext.options.resolveWith}'. Possible causes:`,
        '1. The request was never initiated or sent',
        '2. The request failed before a response was received.',
      ].join('\n'))
    }

    if (coreContext.options.resolveWith === 'text') {
      return await response!.text() as RES_BODY
    } else if (coreContext.options.resolveWith === 'json') {
      return await response!.json() as RES_BODY
    } else if (coreContext.options.resolveWith === 'form-data') {
      return await response!.formData() as RES_BODY
    } else if (coreContext.options.resolveWith === 'blob') {
      return await response!.blob() as RES_BODY
    } else if (coreContext.options.resolveWith === 'array-buffer') {
      return await response!.arrayBuffer() as RES_BODY
    }

    const output: any = coreContext.output
    if (output !== undefined) {
      return output as RES_BODY
    }

    return intelligentParseResponse<RES_BODY>(response)
  }

  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = RES_BODY, TResult2 = never>(onfulfilled?: ((value: RES_BODY) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null): Promise<TResult1 | TResult2> {
    if (!this.requestPromise) this.requestPromise = this.end()
    return this.requestPromise.then(onfulfilled, onrejected)
  }

  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null): Promise<RES_BODY | TResult> {
    return this.end().catch(onrejected)
  }

  finally(onfinally?: (() => void) | null): Promise<RES_BODY> {
    return this.end().finally(onfinally)
  }
}
