/* eslint-disable @typescript-eslint/no-explicit-any */
import { isBrowser } from './is/is-browser.js'
import { Keq } from './keq.js'
import { abortFlowControlMiddleware } from './middlewares/abort-flow-control-middleware.js'
import { fetchArgumentsMiddleware } from './middlewares/fetch-arguments-middleware.js'
import { fetchMiddleware } from './middlewares/fetch-middleware.js'
import { proxyResponseMiddleware } from './middlewares/proxy-response-middleware.js'
import { retryMiddleware } from './middlewares/retry-middleware.js'
import { serialFlowControlMiddleware } from './middlewares/serial-flow-control-middleware.js'
import { KeqRouter } from './router/keq-router.js'
import { timeoutMiddleware } from './middlewares/timeout-middleware.js'

import type { KeqMiddleware } from './types/keq-middleware.js'
import type { KeqRequest } from './types/keq-request.js'
import type { KeqGlobal } from './types/keq-global.js'
import type { KeqOperations } from './types/keq-operation.js'


interface CreateRequestOptions {
  initMiddlewares?: KeqMiddleware[]
  baseOrigin?: string
}

export function createRequest<OPERATIONS extends KeqOperations>(options?: CreateRequestOptions): KeqRequest<OPERATIONS> {
  let baseOrigin = options?.baseOrigin
  if (!baseOrigin) {
    if (isBrowser()) {
      baseOrigin = location.origin
    } else {
      baseOrigin = 'http://127.0.0.1'
    }
  }

  const appendMiddlewares: KeqMiddleware[] = options?.initMiddlewares ? [...options.initMiddlewares] : [
    retryMiddleware(),
    serialFlowControlMiddleware(),
    abortFlowControlMiddleware(),
    timeoutMiddleware(),
    proxyResponseMiddleware(),
    fetchArgumentsMiddleware(),
    fetchMiddleware(),
  ]

  const prependMiddlewares: KeqMiddleware[] = []

  /**
   * share data between requests, used to implement flowControl
   * @description 跨请求共享数据，用于实现 flowControl的功能
   */
  const global: KeqGlobal = {}

  const formatUrl = (url: string | URL): URL => {
    if (typeof url === 'string') {
      return new URL(url, baseOrigin)
    }

    return new URL(url.href)
  }

  const router = new KeqRouter(prependMiddlewares)

  const request: KeqRequest<OPERATIONS> = function (url, init) {
    const keq = new Keq(formatUrl(url), { ...init }, global)
    keq.appendMiddlewares(...appendMiddlewares)
    keq.prependMiddlewares(...prependMiddlewares)
    return keq as any
  }

  request.baseOrigin = (origin) => {
    baseOrigin = origin
    return request
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

  request.options = function (url) {
    const keq = new Keq(formatUrl(url), { method: 'options' }, global)
    keq.appendMiddlewares(...appendMiddlewares)
    keq.prependMiddlewares(...prependMiddlewares)
    return keq as any
  }

  request.use = function use(middleware: KeqMiddleware, ...middlewares: KeqMiddleware[]): KeqRequest<OPERATIONS> {
    prependMiddlewares.push(middleware, ...middlewares)
    return request
  }

  return request
}
