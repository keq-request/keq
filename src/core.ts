import { URL } from 'whatwg-url'
import { Exception } from '~/exception/exception'
import { clone } from '~/util/clone'
import { OUTPUT_PROPERTY } from './constant'
import { KeqContext, KeqRequestContext } from './types/keq-context'
import { KeqMiddleware } from './types/keq-middleware'
import {
  KeqOptions,
} from './types/keq-options'
import { KeqRequestInit } from './types/keq-request-init'
import { composeMiddleware } from './util/compose-middleware'
import { shadowClone } from './util/shadow-clone'


/**
 * @description Keq 核心 API，发送请求必要的原子化的API
 */
export class Core<T> {
  private requestPromise?: Promise<T>

  protected requestContext: KeqRequestContext

  protected __global__: Record<string, any>
  protected __prepend_middlewares__: KeqMiddleware[] = []
  protected __append_middlewares__: KeqMiddleware[] = []

  protected __options__: KeqOptions = { resolveWithFullResponse: false }

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
      signal: this.requestContext.signal,
    }

    const options = shadowClone(this.__options__)

    const ctx: KeqContext = {
      request: requestContext,
      options,
      global: this.__global__,

      get output() {
        throw new Exception('output property is write-only')
      },

      set output(value) {
        this[OUTPUT_PROPERTY] = value
      },
    }

    const middleware = composeMiddleware([...this.__prepend_middlewares__, ...this.__append_middlewares__])

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await middleware(ctx, async () => {})


    let output: any = ctx[OUTPUT_PROPERTY]

    if (ctx.options.resolveWithFullResponse) {
      return ctx.response as T
    }

    if (!(OUTPUT_PROPERTY in ctx)) {
      const response = ctx.response
      if (response?.status === 204) {
        // 204: NO CONTENT
        output = response && response.body
      } else {
        const headers = response?.headers
        const contentType = headers?.get('content-type') || ''
        try {
          if (contentType.includes('application/json')) {
            output = ctx.response && await ctx.response.json()
          } else if (contentType.includes('multipart/form-data')) {
            output = ctx.response && await ctx.response.formData()
          } else if (contentType.includes('plain/text')) {
            output = ctx.response && await ctx.response.text()
          } else {
            output = ctx.response && ctx.response.body
          }
        } catch (e) {
          console.warn('Failed to auto parse response body', e)
        }
      }
    }

    return output as T
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

