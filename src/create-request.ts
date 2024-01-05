/* eslint-disable @typescript-eslint/no-unsafe-return */
import { URL } from 'whatwg-url'
import { isBrowser } from './is/is-browser'
import { Keq } from './keq'
import { fetchArgumentsMiddleware } from './middlewares/fetch-arguments-middleware'
import { fetchMiddleware } from './middlewares/fetch-middleware'
import { proxyResponseMiddleware } from './middlewares/proxy-response-middleware'
import { retryMiddleware } from './middlewares/retry-middleware'
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
    proxyResponseMiddleware(),
    fetchArgumentsMiddleware(),
    retryMiddleware(),
    fetchMiddleware(),
  ]

  const prependMiddlewares: KeqMiddleware[] = []

  const formatUrl = (url: string | URL | globalThis.URL): URL => {
    if (typeof url === 'string') {
      return new URL(url, baseOrigin)
    }

    return new URL(url.href)
  }

  const router = new KeqRouter(prependMiddlewares)

  const request: KeqRequest = function (url, init) {
    const keq = new Keq(formatUrl(url), init)
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
    const keq = new Keq(formatUrl(url), { method: 'get' })
    keq.appendMiddlewares(...appendMiddlewares)
    keq.prependMiddlewares(...prependMiddlewares)
    return keq as any
  }

  request.put = function (url) {
    const keq = new Keq(formatUrl(url), { method: 'put' })
    keq.appendMiddlewares(...appendMiddlewares)
    keq.prependMiddlewares(...prependMiddlewares)
    return keq as any
  }

  request.delete = function (url) {
    const keq = new Keq(formatUrl(url), { method: 'delete' })
    keq.appendMiddlewares(...appendMiddlewares)
    keq.prependMiddlewares(...prependMiddlewares)
    return keq as any
  }

  request.del = request.delete

  request.post = function (url) {
    const keq = new Keq(formatUrl(url), { method: 'post' })
    keq.appendMiddlewares(...appendMiddlewares)
    keq.prependMiddlewares(...prependMiddlewares)
    return keq as any
  }

  request.head = function (url) {
    const keq = new Keq(formatUrl(url), { method: 'head' })
    keq.appendMiddlewares(...appendMiddlewares)
    keq.prependMiddlewares(...prependMiddlewares)
    return keq as any
  }

  request.patch = function (url) {
    const keq = new Keq(formatUrl(url), { method: 'patch' })
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
