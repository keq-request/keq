/* eslint-disable @typescript-eslint/no-unsafe-return */
import { URL } from 'whatwg-url'
import { isBrowser } from './is/is-browser'
import { Keq } from './keq'
import { abortFlowControlMiddleware } from './middlewares/abort-flow-control-middleware.js'
import { fetchArgumentsMiddleware } from './middlewares/fetch-arguments-middleware'
import { fetchMiddleware } from './middlewares/fetch-middleware'
import { proxyResponseMiddleware } from './middlewares/proxy-response-middleware'
import { retryMiddleware } from './middlewares/retry-middleware'
import { serialFlowControlMiddleware } from './middlewares/serial-flow-control-middleware.js'
import { KeqRouter } from './router/keq-router.js'
import { KeqMiddleware } from './types/keq-middleware'
import { KeqRequest } from './types/keq-request'


interface CreateRequestOptions {
  initMiddlewares?: KeqMiddleware[]
  baseOrigin?: string
}

export function createRequest(options?: CreateRequestOptions): KeqRequest {
  let baseOrigin = options?.baseOrigin
  if (isBrowser() && !baseOrigin) baseOrigin = location.origin

  const appendMiddlewares: KeqMiddleware[] = options?.initMiddlewares ? [...options.initMiddlewares] : [
    serialFlowControlMiddleware(),
    abortFlowControlMiddleware(),
    proxyResponseMiddleware(),
    fetchArgumentsMiddleware(),
    retryMiddleware(),
    fetchMiddleware(),
  ]

  const prependMiddlewares: KeqMiddleware[] = []

  /**
   * share data between requests, used to implement flowControl
   * @description 跨请求共享数据，用于实现 flowControl的功能
   */
  const global = {}

  const formatUrl = (url: string | URL | globalThis.URL): URL => {
    if (typeof url === 'string') {
      return new URL(url, baseOrigin)
    }

    return new URL(url.href)
  }

  const router = new KeqRouter(prependMiddlewares)

  const request: KeqRequest = function (url, init) {
    const keq = new Keq(formatUrl(url), { ...init }, global)
    keq.appendMiddlewares(...appendMiddlewares)
    keq.prependMiddlewares(...prependMiddlewares)
    return keq as any
  }

  request.baseOrigin = (origin) => {
    baseOrigin = origin
  }

  request.useRouter = function useRouter() {
    return router
  }

  request.get = function (url) {
    const keq = new Keq(formatUrl(url), { method: 'get' }, global)
    keq.appendMiddlewares(...appendMiddlewares)
    keq.prependMiddlewares(...prependMiddlewares)
    return keq as any
  }

  request.put = function (url) {
    const keq = new Keq(formatUrl(url), { method: 'put' }, global)
    keq.appendMiddlewares(...appendMiddlewares)
    keq.prependMiddlewares(...prependMiddlewares)
    return keq as any
  }

  request.delete = function (url) {
    const keq = new Keq(formatUrl(url), { method: 'delete' }, global)
    keq.appendMiddlewares(...appendMiddlewares)
    keq.prependMiddlewares(...prependMiddlewares)
    return keq as any
  }

  request.del = request.delete

  request.post = function (url) {
    const keq = new Keq(formatUrl(url), { method: 'post' }, global)
    keq.appendMiddlewares(...appendMiddlewares)
    keq.prependMiddlewares(...prependMiddlewares)
    return keq as any
  }

  request.head = function (url) {
    const keq = new Keq(formatUrl(url), { method: 'head' }, global)
    keq.appendMiddlewares(...appendMiddlewares)
    keq.prependMiddlewares(...prependMiddlewares)
    return keq as any
  }

  request.patch = function (url) {
    const keq = new Keq(formatUrl(url), { method: 'patch' }, global)
    keq.appendMiddlewares(...appendMiddlewares)
    keq.prependMiddlewares(...prependMiddlewares)
    return keq as any
  }

  request.use = function use(middleware: KeqMiddleware, ...middlewares: KeqMiddleware[]): KeqRequest {
    prependMiddlewares.push(middleware, ...middlewares)
    return request
  }

  return request
}
