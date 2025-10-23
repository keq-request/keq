import { KeqEvents, KeqListeners } from '~/context/index.js'
import { Exception, RequestException } from '~/exception/index.js'
import { sleep } from '~/utils/index.js'
import { KeqRequestInit } from '~/request-init/index.js'
import { KeqSharedContext, KeqContextOptions } from '~/context/index.js'
import { KeqMiddlewareOrchestrator } from '~/orchestrator/index.js'
import { KeqMiddleware } from '~/middleware/index.js'
import { intelligentParseResponse } from './utils/index.js'
import { KeqInit } from './types/index.js'


/**
 * @description Keq 核心 API，发送请求必要的原子化的API
 */
export class Core<OUTPUT> {
  /**
   * The unique identifier of the request's location in the code
   */
  __locationId__?: string

  private requestPromise?: Promise<OUTPUT>

  protected requestInit: KeqRequestInit

  protected __listeners__: KeqListeners = {}

  protected __global__: Record<string, any>
  protected __prepend_middlewares__: KeqMiddleware[] = []
  protected __append_middlewares__: KeqMiddleware[] = []

  protected get __middlewares__(): KeqMiddleware[] {
    return [...this.__prepend_middlewares__, ...this.__append_middlewares__]
  }

  protected __options__: KeqContextOptions = {
    resolveWithFullResponse: false,
    resolveWith: 'intelligent',
  }

  public constructor(url: URL, init: KeqInit) {
    this.__global__ = init.global || {}
    this.__locationId__ = init.locationId

    this.requestInit = new KeqRequestInit({
      method: 'get',
      headers: new Headers(),
      routeParams: {},
      body: undefined,
      ...init,
      url: new URL(url.href),
    })
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
    // const middleware = composeMiddleware([...this.__prepend_middlewares__, ...this.__append_middlewares__], { name: 'root' })


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
        attemptWithDefault >= retryTimes ||
        (await retryOn(attemptWithDefault, error, sharedContext)) === false
      ) {
        if (error) {
          sharedContext.emitter.emit('error', { context: sharedContext })
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

  async end(): Promise<OUTPUT> {
    const coreContext = await this.run()


    if (coreContext.options.resolveWith === 'response') {
      return coreContext.response as OUTPUT
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
      return await response!.text() as OUTPUT
    } else if (coreContext.options.resolveWith === 'json') {
      return await response!.json() as OUTPUT
    } else if (coreContext.options.resolveWith === 'form-data') {
      return await response!.formData() as OUTPUT
    } else if (coreContext.options.resolveWith === 'blob') {
      return await response!.blob() as OUTPUT
    } else if (coreContext.options.resolveWith === 'array-buffer') {
      return await response!.arrayBuffer() as OUTPUT
    }

    const output: any = coreContext.output
    if (output !== undefined) {
      return output as OUTPUT
    }

    return intelligentParseResponse<OUTPUT>(response)
  }

  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = OUTPUT, TResult2 = never>(onfulfilled?: ((value: OUTPUT) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2> {
    if (!this.requestPromise) this.requestPromise = this.end()
    return this.requestPromise.then(onfulfilled, onrejected)
  }

  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<OUTPUT | TResult> {
    return this.end().catch(onrejected)
  }

  finally(onfinally?: (() => void) | undefined | null): Promise<OUTPUT> {
    return this.end().finally(onfinally)
  }
}
