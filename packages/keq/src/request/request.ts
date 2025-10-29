/* eslint-disable @typescript-eslint/no-explicit-any */
import { KeqGlobal } from '~/context'
import { Keq } from './keq'
import { KeqApiSchema, KeqDefaultOperation } from './types'
import { getLocationId } from './utils'
import { KeqMiddleware } from '~/middleware'
import { Validator } from '~/validator'
import { KeqRequestInit, KeqRequestMethod } from '~/request-init'
import { ExtractMethodOperations } from './types'
import { KeqRouter } from '~/router'
import { keqFetchMiddleware, keqFlowControlMiddleware, keqTimeoutMiddleware } from '~/middlewares'


export interface KeqRequestOptions {
  preMiddlewares?: KeqMiddleware[]
  postMiddlewares?: KeqMiddleware[]
  baseOrigin?: string
}

export type KeqRequestFetchOptions<M extends KeqRequestMethod = KeqRequestMethod> = Partial<Omit<KeqRequestInit, 'url' | '__url__' | 'signal' | 'abort' | 'clone' | 'toFetchArguments' | 'method'>> & {
  method: M
}

/**
 * Keq instance factory class,
 * and shares global data and middlewares across requests
 */
export class KeqRequest<SCHEMA extends KeqApiSchema> {
  baseOrigin: string

  /**
   * share data between requests, used to implement flowControl
   * @description 跨请求共享数据，用于实现 flowControl的功能
   */
  readonly globals: KeqGlobal = {}

  readonly preMiddlewares: KeqMiddleware[] = []
  readonly postMiddlewares: KeqMiddleware[] = []

  constructor(options?: KeqRequestOptions) {
    if (options?.baseOrigin) {
      this.baseOrigin = options.baseOrigin
    } else {
      this.baseOrigin = Validator.isBrowser() ? location.origin : 'http://127.0.0.1'
    }

    this.postMiddlewares = options?.postMiddlewares || [
      keqFlowControlMiddleware(),
      keqTimeoutMiddleware(),
      keqFetchMiddleware(),
    ]
    this.preMiddlewares = options?.preMiddlewares || []
  }

  private __formatUrl__(url: string | URL): URL {
    if (typeof url === 'string') {
      return new URL(url, this.baseOrigin)
    }

    return new URL(url.href)
  }

  private __fetch__(
    url: string | URL,
    init: KeqRequestFetchOptions,
    locationId?: string,
  ): Keq<any> {
    const keq = new Keq(this.__formatUrl__(url), { ...init, locationId, global: this.globals })

    keq.appendMiddlewares(...this.postMiddlewares)
    keq.prependMiddlewares(...this.preMiddlewares)
    return keq as Keq<any>
  }


  fetch<P extends keyof SCHEMA, M extends KeqRequestMethod>(url: P, init: KeqRequestFetchOptions<M>): Keq<Exclude<SCHEMA[P][M], undefined>>
  fetch<T = unknown>(url: string | URL, init: KeqRequestFetchOptions): Keq<KeqDefaultOperation<{ responseBody: T }>>
  fetch(url: string | URL, init: KeqRequestFetchOptions): Keq<any> {
    return this.__fetch__(
      url,
      init,
      getLocationId(1),
    )
  }

  get<P extends keyof ExtractMethodOperations<SCHEMA, 'get'>>(url: P): Keq<ExtractMethodOperations<SCHEMA, 'get'>[P], ExtractMethodOperations<SCHEMA, 'get'>[P]>
  get<T>(url: string | URL): Keq<KeqDefaultOperation<{ responseBody: T }>>
  get(url: string | URL): Keq<any> {
    return this.__fetch__(
      url,
      { method: 'get' },
      getLocationId(1),
    )
  }

  put<P extends keyof ExtractMethodOperations<SCHEMA, 'put'>>(url: P): Keq<ExtractMethodOperations<SCHEMA, 'put'>[P], ExtractMethodOperations<SCHEMA, 'put'>[P]>
  put<T>(url: string | URL): Keq<KeqDefaultOperation<{ responseBody: T }>>
  put(url: string | URL): Keq<any> {
    const locationId = getLocationId(1)
    const keq = new Keq(
      this.__formatUrl__(url),
      {
        method: 'put',
        locationId,
        global: this.globals,
      },
    )

    keq.appendMiddlewares(...this.postMiddlewares)
    keq.prependMiddlewares(...this.preMiddlewares)
    return keq
  }

  delete<P extends keyof ExtractMethodOperations<SCHEMA, 'delete'>>(url: P): Keq<ExtractMethodOperations<SCHEMA, 'delete'>[P], ExtractMethodOperations<SCHEMA, 'delete'>[P]>
  delete<T>(url: string | URL): Keq<KeqDefaultOperation<{ responseBody: T }>>
  delete(url: string | URL): Keq<any> {
    return this.__fetch__(
      url,
      { method: 'delete' },
      getLocationId(1),
    )
  }

  del<P extends keyof ExtractMethodOperations<SCHEMA, 'delete'>>(url: P): Keq<ExtractMethodOperations<SCHEMA, 'delete'>[P], ExtractMethodOperations<SCHEMA, 'delete'>[P]>
  del<T>(url: string | URL): Keq<KeqDefaultOperation<{ responseBody: T }>>
  del(url: string | URL): Keq<any> {
    return this.delete(url)
  }

  post<P extends keyof ExtractMethodOperations<SCHEMA, 'post'>>(url: P): Keq<ExtractMethodOperations<SCHEMA, 'post'>[P], ExtractMethodOperations<SCHEMA, 'post'>[P]>
  post<T>(url: string | URL): Keq<KeqDefaultOperation<{ responseBody: T }>>
  post(url: string | URL): Keq<any> {
    return this.__fetch__(
      url,
      { method: 'post' },
      getLocationId(1),
    )
  }

  head<P extends keyof ExtractMethodOperations<SCHEMA, 'head'>>(url: P): Keq<ExtractMethodOperations<SCHEMA, 'head'>[P], ExtractMethodOperations<SCHEMA, 'head'>[P]>
  head<T>(url: string | URL): Keq<KeqDefaultOperation<{ responseBody: T }>>
  head(url: string | URL): Keq<any> {
    return this.__fetch__(
      url,
      { method: 'head' },
      getLocationId(1),
    )
  }

  patch<P extends keyof ExtractMethodOperations<SCHEMA, 'patch'>>(url: P): Keq<ExtractMethodOperations<SCHEMA, 'patch'>[P], ExtractMethodOperations<SCHEMA, 'patch'>[P]>
  patch<T>(url: string | URL): Keq<KeqDefaultOperation<{ responseBody: T }>>
  patch(url: string | URL): Keq<any> {
    return this.__fetch__(
      url,
      { method: 'patch' },
      getLocationId(1),
    )
  }

  options<P extends keyof ExtractMethodOperations<SCHEMA, 'options'>>(url: P): Keq<ExtractMethodOperations<SCHEMA, 'options'>[P], ExtractMethodOperations<SCHEMA, 'options'>[P]>
  options<T>(url: string | URL): Keq<KeqDefaultOperation<{ responseBody: T }>>
  options(url: string | URL): Keq<any> {
    return this.__fetch__(
      url,
      { method: 'options' },
      getLocationId(1),
    )
  }

  use(firstMiddleware: KeqMiddleware, ...middleware: KeqMiddleware[]): this {
    this.preMiddlewares.push(firstMiddleware, ...middleware)
    return this
  }

  useRouter(): KeqRouter {
    return new KeqRouter(this.preMiddlewares)
  }
}

export const request = new KeqRequest()
